<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Kos;
use App\Models\Payment;
use App\Models\Pemilik;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FinancialReportController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $isSuperadmin = $user->role->name === 'superadmin';
        
        // Prepare API Parameters
        $params = [
            'bulan'  => $request->bulan === 'all' ? null : $request->bulan,
            'tahun'  => $request->tahun === 'all' ? null : $request->tahun,
            'kos_id' => $request->kos_id === 'all' ? null : $request->kos_id,
            'metode' => $request->method === 'all' ? null : $request->method,
            'search' => $request->search,
            'page'   => $request->page ?? 1,
        ];

        if ($user->role->name === 'pemilik') {
            $params['pemilik_id'] = $user->id;
        }

        try {
            $response = Http::timeout(30)->withToken(env('API_PELAPORAN_TOKEN'))
                ->get(env('API_PELAPORAN_URL') . '/laporan-pendapatan', array_filter($params));

            if ($response->successful()) {
                $apiData = $response->json('data');
                $agregasi = $apiData['agregasi'];
                $laporan = $apiData['laporan'];

                // Re-format for pagination compatibility if needed (Inertia expects specific structure)
                // App2 returns $laporan which is already a paginated object if not 'cetak=true'
            } else {
                Log::error('Gagal mengambil laporan dari API', ['status' => $response->status(), 'body' => $response->body()]);
                $agregasi = ['hari_ini' => 0, 'bulan_ini' => 0, 'tahun_ini' => 0, 'keseluruhan' => 0];
                $laporan = ['data' => [], 'links' => [], 'total' => 0];
            }
        } catch (\Exception $e) {
            Log::error('Error koneksi API Laporan: ' . $e->getMessage());
            $agregasi = ['hari_ini' => 0, 'bulan_ini' => 0, 'tahun_ini' => 0, 'keseluruhan' => 0];
            $laporan = ['data' => [], 'links' => [], 'total' => 0];
        }

        // Get Kos list for filter (Still local to App1)
        $kosList = $isSuperadmin ? Kos::all() : Kos::where('owner_id', $user->id)->get();

        return Inertia::render('admin/LaporanKeuangan/Index', [
            'payments' => $laporan,
            'stats' => [
                'today' => $agregasi['hari_ini'],
                'month' => $agregasi['bulan_ini'],
                'year' => $agregasi['tahun_ini'],
                'total' => $agregasi['keseluruhan'],
            ],
            'filters' => $request->only(['bulan', 'tahun', 'kos_id', 'method', 'search', 'sort', 'direction']),
            'kosList' => $kosList,
            'methods' => Payment::whereNotNull('method')->distinct()->pluck('method'),
        ]);
    }

    public function exportPdf(Request $request)
    {
        $user = auth()->user();
        $params = [
            'bulan'  => $request->bulan === 'all' ? null : $request->bulan,
            'tahun'  => $request->tahun === 'all' ? null : $request->tahun,
            'kos_id' => $request->kos_id === 'all' ? null : $request->kos_id,
            'metode' => $request->method === 'all' ? null : $request->method,
            'search' => $request->search,
            'cetak'  => 'true',
        ];

        if ($user->role->name === 'pemilik') {
            $params['pemilik_id'] = $user->id;
        }

        try {
            $response = Http::timeout(30)->withToken(env('API_PELAPORAN_TOKEN'))
                ->get(env('API_PELAPORAN_URL') . '/laporan-pendapatan', array_filter($params));
            
            $payments = $response->successful() ? collect($response->json('data.laporan')) : collect([]);
        } catch (\Exception $e) {
            $payments = collect([]);
        }

        $total = $payments->sum('nominal');
        $bulanStr = 'Semua';
        if ($request->filled('bulan') && $request->bulan !== 'all') {
            $bulanStr = Carbon::create()->month($request->bulan)->translatedFormat('F');
        }
        $tahunStr = $request->filled('tahun') && $request->tahun !== 'all' ? $request->tahun : 'Semua';

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('exports.financial-report', [
            'payments' => $payments,
            'total' => $total,
            'bulan_name' => $bulanStr,
            'tahun' => $tahunStr,
            'filtered_kos' => $request->filled('kos_id') && $request->kos_id !== 'all' ? Kos::find($request->kos_id)->name : 'Semua Kos',
            'user' => auth()->user(),
        ]);

        $filename = 'Laporan_Keuangan_SIKOSPEL_' . now()->format('YmdHis') . '.pdf';

        if ($request->has('preview')) {
            return $pdf->stream($filename);
        }

        return $pdf->download($filename);
    }

    public function exportExcel(Request $request)
    {
        $user = auth()->user();
        $params = [
            'bulan'  => $request->bulan === 'all' ? null : $request->bulan,
            'tahun'  => $request->tahun === 'all' ? null : $request->tahun,
            'kos_id' => $request->kos_id === 'all' ? null : $request->kos_id,
            'metode' => $request->method === 'all' ? null : $request->method,
            'search' => $request->search,
            'cetak'  => 'true',
        ];

        if ($user->role->name === 'pemilik') {
            $params['pemilik_id'] = $user->id;
        }

        try {
            $response = Http::timeout(30)->withToken(env('API_PELAPORAN_TOKEN'))
                ->get(env('API_PELAPORAN_URL') . '/laporan-pendapatan', array_filter($params));
            
            $payments = $response->successful() ? collect($response->json('data.laporan')) : collect([]);
        } catch (\Exception $e) {
            $payments = collect([]);
        }

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\FinancialReportExport($payments), 
            'Laporan_Keuangan_SIKOSPEL_' . now()->format('YmdHis') . '.xlsx'
        );
    }

    private function getQuery(Request $request)
    {
        return Payment::query();
    }
}