<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    public function print(Request $request, $id)
    {
        $payment = Payment::with([
            'invoice.tenancy.penghuni',
            'invoice.tenancy.room.kos'
        ])->findOrFail($id);

        // Ensure user owns this receipt
        $user = auth()->user();
        if ($user->role->name === 'penghuni' && $payment->invoice->tenancy->penghuni->user_id !== $user->id) {
            abort(403);
        }

        return view('receipt.print', compact('payment'));
    }
}
