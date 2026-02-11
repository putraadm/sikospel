<?php

namespace App\Http\Controllers;

use App\Models\Penghuni;
use App\Models\Invoice;
use App\Models\Penyewaan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenghuniTagihanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $penghuni = Penghuni::where('user_id', $user->id)->first();

        $invoices = collect();

        if ($penghuni) {
            $penyewaanIds = Penyewaan::where('penghuni_id', $penghuni->user_id)
                ->pluck('id');

            $invoices = Invoice::whereIn('tenancy_id', $penyewaanIds)
                ->with(['tenancy.room.kos'])
                ->orderByDesc('due_date')
                ->get();
        }

        return Inertia::render('Penghuni/Tagihan', [
            'invoices' => $invoices,
        ]);
    }
}
