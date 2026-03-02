<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminInvoiceController extends Controller
{
    public function markAsPaid(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        
        if ($invoice->status === 'lunas') {
            return redirect()->back()->with('error', 'Tagihan sudah lunas.');
        }

        DB::transaction(function () use ($invoice) {
            $invoice->update(['status' => 'lunas']);

            Payment::create([
                'invoice_id' => $invoice->id,
                'payment_date' => now(),
                'amount_paid' => $invoice->amount,
                'method' => 'cash',
                'sumber' => 'manual',
                'status' => 'sukses',
                'feedback' => 'Dibayar tunai (cash) melalui Admin/Pemilik.',
            ]);
        });

        return redirect()->back()->with('success', 'Tagihan berhasil ditandai sebagai lunas (Cash).');
    }
}
