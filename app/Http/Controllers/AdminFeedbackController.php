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
                    $q->select('id')->from('penyewaans')->whereIn('room_id', $roomIds);
                })->pluck('id');
                
                $query->whereIn('invoice_id', $invoiceIds);
            }
        }

        $feedbacks = $query->latest('payment_date')->get();

        return Inertia::render('Admin/Feedback/Index', [
            'feedbacks' => $feedbacks
        ]);
    }
}
