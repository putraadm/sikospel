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
    public function index(Request $request)
    {
        $user = $request->user();

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
            // ignore
        }

        // 4. Data Chart Pendapatan (ambil dari Sipenkos API /laporan/pendapatan)
        // Dashboard page mengharapkan field: kos_id, tanggal_pembayaran, nominal
        $sipenkosLaporan = [];
        $kosList = Kos::select('id', 'name')->get();

        try {
            $token = config('services.pelaporan.token');
            $baseUrl = config('services.pelaporan.url');

            if ($token && $baseUrl) {
                $params = ['cetak' => 'true'];

                // catatan: logika pemilik/pemilik_id mengikuti pola di FinancialReportController
                if ($user?->role?->name === 'pemilik') {
                    $params['pemilik_id'] = $user->id;
                }

                $response = \Illuminate\Support\Facades\Http::timeout(30)
                    ->withToken($token)
                    ->get($baseUrl . '/laporan/pendapatan', array_filter($params));

                if ($response->successful()) {
                    $api = $response->json('data');
                    $sipenkosLaporan = $api['laporan'] ?? [];
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error Dashboard ambil laporan pendapatan: ' . $e->getMessage());
        }

        return Inertia::render('dashboard', [
            'totalPenghuni' => $totalPenghuni,
            'jumlahKos' => $jumlahKos,
            'totalKamar' => $totalKamar,
            'latestPenghuni' => $latestPenghuni,
            'totalPendapatan' => $totalPendapatan,
            'latestPayments' => $latestPayments,
            'sipenkosLaporan' => $sipenkosLaporan,
            'kosList' => $kosList,
        ]);
    }
}

