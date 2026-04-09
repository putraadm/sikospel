<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Kos;
use App\Models\Room;
use App\Models\Pemilik;
use App\Models\Invoice;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AdminFeedbackController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $query = Payment::with(['invoice.tenancy.penghuni', 'invoice.tenancy.room.kos'])
            ->whereNotNull('feedback')
            ->where('feedback', '!=', '');

        if ($user->role->name === 'pemilik') {
            $pemilik = Pemilik::where('user_id', $user->id)->first();
            if ($pemilik) {
                $kosIds = Kos::where('owner_id', $pemilik->user_id)->pluck('id');
                $roomIds = Room::whereIn('kos_id', $kosIds)->pluck('id');
                $invoiceIds = Invoice::whereIn('tenancy_id', function($q) use ($roomIds) {
                    $q->select('id')->from('penyewaan')->whereIn('room_id', $roomIds);
                })->pluck('id');
                
                $query->whereIn('invoice_id', $invoiceIds);
            }
        }

        $feedbacks = $query->latest('payment_date')->get();

        return Inertia::render('Admin/Feedback/Index', [
            'feedbacks' => $feedbacks
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'admin_response' => 'required|string',
        ]);

        $payment = Payment::findOrFail($id);
        
        // Ensure user has access to this payment's feedback
        $user = auth()->user();
        if ($user->role->name === 'pemilik') {
            $pemilik = Pemilik::where('user_id', $user->id)->first();
            if ($pemilik) {
                // Verify owner
                $invoice = Invoice::with('tenancy.room.kos')->find($payment->invoice_id);
                if ($invoice && $invoice->tenancy->room->kos->owner_id !== $pemilik->user_id) {
                    abort(403);
                }
            }
        }

        $payment->admin_response = $request->admin_response;
        $payment->save();

        return redirect()->back()->with('success', 'Tanggapan berhasil disimpan.');
    }
}
