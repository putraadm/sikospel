<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    public function getSnapToken(Request $request)
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
        ]);

        $invoice = Invoice::with(['tenancy.penghuni.user'])->findOrFail($request->invoice_id);

        if ($invoice->status === 'lunas') {
            return response()->json(['message' => 'Invoice already paid'], 400);
        }

        $params = [
            'transaction_details' => [
                'order_id' => 'INV-' . $invoice->id . '-' . time(),
                'gross_amount' => (int) $invoice->amount,
            ],
            'customer_details' => [
                'first_name' => $invoice->tenancy->penghuni->name,
                'email' => $invoice->tenancy->penghuni->user->email,
                'phone' => $invoice->tenancy->penghuni->no_wa,
            ],
            'item_details' => [
                [
                    'id' => 'INV-' . $invoice->id,
                    'price' => (int) $invoice->amount,
                    'quantity' => 1,
                    'name' => 'Tagihan Kos - Periode ' . $invoice->billing_period->format('M Y'),
                ]
            ],
            'callbacks' => [
                'finish' => route('penghuni.tagihan', ['payment_status' => 'success']),
                'unfinish' => route('penghuni.tagihan', ['payment_status' => 'pending']),
                'error' => route('penghuni.tagihan', ['payment_status' => 'error']),
            ],
            // 'notification_url' => route('midtrans.callback'),
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            return response()->json(['snap_token' => $snapToken]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function checkStatus(Request $request)
    {
        $request->validate([
            'order_id' => 'required',
        ]);

        try {
            $status = Transaction::status($request->order_id);
            
            $this->updatePaymentStatus($status);

            return response()->json(['status' => $status->transaction_status]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    private function updatePaymentStatus($notification)
    {
        $isObject = is_object($notification);
        
        \Illuminate\Support\Facades\Log::debug('Midtrans updatePaymentStatus processing', [
            'type' => $isObject ? get_class($notification) : 'Array',
            'order_id_raw' => $isObject ? ($notification->order_id ?? 'N/A') : ($notification['order_id'] ?? 'N/A'),
        ]);

        $transaction = $isObject ? ($notification->transaction_status ?? null) : ($notification['transaction_status'] ?? null);
        $type = $isObject ? ($notification->payment_type ?? null) : ($notification['payment_type'] ?? null);
        $orderId = $isObject ? ($notification->order_id ?? null) : ($notification['order_id'] ?? null);
        $fraud = $isObject ? ($notification->fraud_status ?? null) : ($notification['fraud_status'] ?? null);
        $midtransTransactionId = $isObject ? ($notification->transaction_id ?? null) : ($notification['transaction_id'] ?? null);
        $grossAmount = $isObject ? ($notification->gross_amount ?? null) : ($notification['gross_amount'] ?? null);

        if (!$orderId) {
            throw new \Exception("Order ID is missing from notification data.");
        }

        $invoiceId = null;
        if (preg_match('/INV-(\d+)/i', $orderId, $matches)) {
            $invoiceId = $matches[1];
        } 
        
        if (!$invoiceId || !is_numeric($invoiceId)) {
             $idParts = explode('-', $orderId);
             if (count($idParts) >= 2 && is_numeric($idParts[1])) {
                 $invoiceId = $idParts[1];
             }
        }

        if (!$invoiceId) {
            throw new \Exception("Could not extract valid Invoice ID from Order ID: " . $orderId);
        }

        DB::transaction(function () use ($invoiceId, $transaction, $type, $midtransTransactionId, $grossAmount, $fraud) {
            $invoice = Invoice::findOrFail($invoiceId);

            $paymentStatus = 'pending';
            $invoiceStatus = 'belum_dibayar';

            if ($transaction == 'capture' || $transaction == 'settlement') {
                if ($type == 'credit_card' && $fraud == 'challenge') {
                    $paymentStatus = 'pending';
                } else {
                    $paymentStatus = 'sukses';
                    $invoiceStatus = 'lunas';
                }
            } else if ($transaction == 'pending') {
                $paymentStatus = 'pending';
            } else if ($transaction == 'deny' || $transaction == 'expire' || $transaction == 'cancel') {
                $paymentStatus = 'gagal';
                $invoiceStatus = 'belum_dibayar';
            }

            $invoice->update(['status' => $invoiceStatus]);

            Payment::updateOrCreate(
                ['transaction_id' => $midtransTransactionId],
                [
                    'invoice_id' => $invoice->id,
                    'payment_date' => now(),
                    'amount_paid' => $grossAmount,
                    'method' => $type,
                    'sumber' => 'midtrans',
                    'status' => $paymentStatus,
                ]
            );
        });
    }

    public function callback(Request $request)
    {
        try {
            \Illuminate\Support\Facades\Log::info('Midtrans Notification received', $request->all());

            $this->updatePaymentStatus($request->all());
            
            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Midtrans Callback Error: ' . $e->getMessage(), [
                'stack' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json(['status' => 'error'], 500);
        }
    }
}
