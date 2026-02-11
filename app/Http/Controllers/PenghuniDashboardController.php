<?php

namespace App\Http\Controllers;

use App\Models\Penghuni;
use App\Models\Invoice;
use App\Models\Penyewaan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenghuniDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Ambil data penghuni berdasarkan user yang login
        $penghuni = Penghuni::where('user_id', $user->id)->first();

        if (!$penghuni) {
            return Inertia::render('Penghuni/Dashboard', [
                'penghuni' => null,
                'penyewaan' => null,
                'tagihanAktif' => 0,
                'totalTerbayar' => 0,
            ]);
        }

        // Ambil penyewaan aktif dengan relasi room dan kos
        $penyewaan = Penyewaan::where('penghuni_id', $penghuni->user_id)
            ->where('status', 'aktif')
            ->with(['room.kos'])
            ->first();

        // Hitung tagihan belum dibayar
        $tagihanAktif = 0;
        $totalTerbayar = 0;
        if ($penyewaan) {
            $tagihanAktif = Invoice::where('tenancy_id', $penyewaan->id)
                ->where('status', 'belum_dibayar')
                ->count();

            $totalTerbayar = Invoice::where('tenancy_id', $penyewaan->id)
                ->where('status', 'lunas')
                ->sum('amount');
        }

        return Inertia::render('Penghuni/Dashboard', [
            'penghuni' => $penghuni,
            'penyewaan' => $penyewaan,
            'tagihanAktif' => $tagihanAktif,
            'totalTerbayar' => $totalTerbayar,
        ]);
    }
}
