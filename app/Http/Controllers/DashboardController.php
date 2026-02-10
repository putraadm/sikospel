<?php

namespace App\Http\Controllers;

use App\Models\Kos;
use App\Models\Payment;
use App\Models\Penghuni;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Total Stats
        $totalPenghuni = Penghuni::count();
        $jumlahKos = Kos::count();
        $totalKamar = Room::count();
        
        // 2. Rekap Penghuni (e.g., latest 5)
        $latestPenghuni = Penghuni::with('user')
            ->latest()
            ->take(5)
            ->get();

        // 3. Rekap Pendapatan (Total and Recent)
        // Assuming 'payments' table has 'amount_paid' and 'status'
        $totalPendapatan = 0;
        $latestPayments = [];
        
        try {
            $totalPendapatan = \Illuminate\Support\Facades\DB::table('payments')
                ->where('status', 'sukses')
                ->sum('amount_paid');

            $latestPayments = \Illuminate\Support\Facades\DB::table('payments')
                ->where('status', 'sukses')
                ->latest()
                ->take(5)
                ->get();
        } catch (\Exception $e) {
            // Table might not exist or be empty if no migrations run for it yet
        }

        return Inertia::render('dashboard', [
            'totalPenghuni' => $totalPenghuni,
            'jumlahKos' => $jumlahKos,
            'totalKamar' => $totalKamar,
            'latestPenghuni' => $latestPenghuni,
            'totalPendapatan' => $totalPendapatan,
            'latestPayments' => $latestPayments,
        ]);
    }
}
