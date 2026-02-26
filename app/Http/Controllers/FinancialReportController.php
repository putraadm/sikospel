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

class FinancialReportController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $isSuperadmin = $user->role->name === 'superadmin';
        $isPemilik = $user->role->name === 'pemilik';

        // For stats calculation, we use the same filtering logic as the table
        $query = $this->getQuery($request);
        
        // Sorting
        $sortColumn = $request->input('sort', 'payment_date');
        $sortDirection = $request->input('direction', 'desc');
        
        // We need separate queries for top cards (period-specific but respecting Kos/User context)
        $baseContext = Payment::where('status', 'sukses')
            ->whereHas('invoice', fn($q) => $q->where('status', 'lunas'));

        if ($isPemilik) {
            $baseContext->whereHas('invoice.tenancy.room.kos', fn($q) => $q->where('owner_id', $user->id));
        }

        if ($request->filled('kos_id') && $request->kos_id !== 'all') {
            $baseContext->whereHas('invoice.tenancy.room.kos', fn($q) => $q->where('id', $request->kos_id));
        }

        $totalToday = (clone $baseContext)->whereDate('payment_date', Carbon::today())->sum('amount_paid');
        $totalMonth = (clone $baseContext)->whereMonth('payment_date', Carbon::now()->month)
                                        ->whereYear('payment_date', Carbon::now()->year)
                                        ->sum('amount_paid');
        $totalYear = (clone $baseContext)->whereYear('payment_date', Carbon::now()->year)->sum('amount_paid');

        $totalFiltered = (clone $query)->sum('amount_paid');

        // Pagination
        $payments = (clone $query)
            ->orderBy($sortColumn, $sortDirection)
            ->paginate(10)
            ->withQueryString();

        // Get Kos list for filter
        $kosList = $isSuperadmin ? Kos::all() : Kos::where('owner_id', $user->id)->get();

        return Inertia::render('admin/LaporanKeuangan/Index', [
            'payments' => $payments,
            'stats' => [
                'today' => $totalToday,
                'month' => $totalMonth,
                'year' => $totalYear,
                'total' => $totalFiltered,
            ],
            'filters' => $request->only(['bulan', 'tahun', 'kos_id', 'method', 'search', 'sort', 'direction']),
            'kosList' => $kosList,
            'methods' => Payment::whereNotNull('method')->distinct()->pluck('method'),
        ]);
    }

    public function exportPdf(Request $request)
    {
        $payments = $this->getQuery($request)->get();
        $total = $payments->sum('amount_paid');
        $bulan = $request->bulan ? Carbon::create()->month($request->bulan)->translatedFormat('F') : 'Semua';
        $tahun = $request->tahun ?? 'Semua';

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('exports.financial-report', [
            'payments' => $payments,
            'total' => $total,
            'bulan_name' => $bulan,
            'tahun' => $tahun,
        ]);

        return $pdf->download('Laporan_Keuangan_SIKOSPEL_' . now()->format('YmdHis') . '.pdf');
    }

    public function exportExcel(Request $request)
    {
        $payments = $this->getQuery($request)->get();
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\FinancialReportExport($payments), 
            'Laporan_Keuangan_SIKOSPEL_' . now()->format('YmdHis') . '.xlsx'
        );
    }

    private function getQuery(Request $request)
    {
        $user = auth()->user();
        $isPemilik = $user->role->name === 'pemilik';

        $query = Payment::with([
            'invoice.tenancy.penghuni',
            'invoice.tenancy.room.kos',
            'invoice.tenancy.room.typeKamar'
        ])
        ->where('payments.status', 'sukses')
        ->whereHas('invoice', function($q) {
            $q->where('status', 'lunas');
        });

        if ($isPemilik) {
            $query->whereHas('invoice.tenancy.room.kos', function ($q) use ($user) {
                $q->where('owner_id', $user->id);
            });
        }

        if ($request->filled('kos_id') && $request->kos_id !== 'all') {
            $query->whereHas('invoice.tenancy.room.kos', function ($q) use ($request) {
                $q->where('id', $request->kos_id);
            });
        }

        if ($request->filled('bulan') && $request->bulan !== 'all') {
            $query->whereMonth('payment_date', $request->bulan);
        }

        if ($request->filled('tahun') && $request->tahun !== 'all') {
            $query->whereYear('payment_date', $request->tahun);
        }

        if ($request->filled('method') && $request->method !== 'all') {
            $query->where('method', $request->method);
        }

        if ($request->filled('search')) {
            $searchTerm = trim($request->search);
            $query->whereHas('invoice.tenancy.penghuni', function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%');
            });
        }

        return $query;
    }
}
