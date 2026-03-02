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
    private function getUserRole()
    {
        $user = auth()->user();
        
        // Check if user has a role
        if (!$user || !$user->role) {
            return null;
        }
        
        return $user->role->name;
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $roleName = $this->getUserRole();
        
        // Handle case where user has no role
        if (!$roleName) {
            return Inertia::render('admin/LaporanKeuangan/Index', [
                'payments' => [
                    'data' => [],
                    'links' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'total' => 0,
                ],
                'stats' => [
                    'today' => 0,
                    'month' => 0,
                    'year' => 0,
                    'total' => 0,
                ],
                'filters' => $request->only(['bulan', 'tahun', 'kos_id', 'method', 'search', 'sort', 'direction']),
                'kosList' => [],
                'methods' => [],
            ]);
        }
        
        $isSuperadmin = $roleName === 'superadmin';
        $isPemilik = $roleName === 'pemilik';

        // Sorting
        $sortColumn = $request->input('sort', 'payment_date');
        $sortDirection = $request->input('direction', 'desc');
        
        // Get base query for stats
        $statsQuery = $this->getBaseStatsQuery($isPemilik, $user);
        
        // Apply kos_id filter to stats if provided
        if ($request->filled('kos_id') && $request->kos_id !== 'all') {
            $statsQuery->whereHas('invoice.tenancy.room.kos', fn($q) => $q->where('id', $request->kos_id));
        }

        // Calculate stats
        $totalToday = (clone $statsQuery)->whereDate('payment_date', Carbon::today())->sum('amount_paid');
        $totalMonth = (clone $statsQuery)->whereMonth('payment_date', Carbon::now()->month)
                                        ->whereYear('payment_date', Carbon::now()->year)
                                        ->sum('amount_paid');
        $totalYear = (clone $statsQuery)->whereYear('payment_date', Carbon::now()->year)->sum('amount_paid');

        // Get filtered total
        $totalFiltered = $this->getFilteredQuery($request, $isPemilik, $user)->sum('amount_paid');

        // Base query for the table with eager loading
        $tableQuery = Payment::with([
            'invoice.tenancy.penghuni',
            'invoice.tenancy.room.kos',
            'invoice.tenancy.room.typeKamar'
        ])
        ->where('payments.status', 'sukses')
        ->whereHas('invoice', fn($q) => $q->where('status', 'lunas'));

        // Apply filters to table query
        $this->applyFiltersToQuery($tableQuery, $request, $isPemilik, $user);

        // Apply sorting
        $sortMap = [
            'payment_date' => 'payments.payment_date',
            'amount_paid' => 'payments.amount_paid',
            'method' => 'payments.method',
            'penghuni_name' => 'payments.payment_date', // Will sort by eager loaded relationship in memory
            'kos_name' => 'payments.payment_date',
            'billing_period' => 'payments.payment_date',
        ];

        // For now, always sort by payment_date in database, sort relationships in memory
        $tableQuery->orderBy('payments.payment_date', $sortDirection);

        // Pagination
        $payments = $tableQuery->paginate(10)->withQueryString();

        // Get Kos list for filter
        if ($isSuperadmin) {
            $kosList = Kos::all();
        } elseif ($isPemilik) {
            $kosList = Kos::where('owner_id', $user->id)->get();
        } else {
            $kosList = [];
        }

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
        $user = auth()->user();
        $roleName = $this->getUserRole();
        $isPemilik = $roleName === 'pemilik';

        $payments = $this->getFilteredQuery($request, $isPemilik, $user)->get();
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
        $user = auth()->user();
        $roleName = $this->getUserRole();
        $isPemilik = $roleName === 'pemilik';

        $payments = $this->getFilteredQuery($request, $isPemilik, $user)->get();
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\FinancialReportExport($payments), 
            'Laporan_Keuangan_SIKOSPEL_' . now()->format('YmdHis') . '.xlsx'
        );
    }

    private function getBaseStatsQuery($isPemilik, $user)
    {
        $query = Payment::where('payments.status', 'sukses')
            ->whereHas('invoice', fn($q) => $q->where('status', 'lunas'));
        
        if ($isPemilik) {
            $query->whereHas('invoice.tenancy.room.kos', fn($q) => $q->where('owner_id', $user->id));
        }

        return $query;
    }

    private function getFilteredQuery(Request $request, $isPemilik, $user)
    {
        $query = Payment::with([
            'invoice.tenancy.penghuni',
            'invoice.tenancy.room.kos',
            'invoice.tenancy.room.typeKamar'
        ])
        ->where('payments.status', 'sukses')
        ->whereHas('invoice', fn($q) => $q->where('status', 'lunas'));

        $this->applyFiltersToQuery($query, $request, $isPemilik, $user);

        return $query;
    }

    private function applyFiltersToQuery($query, Request $request, $isPemilik, $user)
    {
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
            $query->where(function($q) use ($searchTerm) {
                $q->whereHas('invoice.tenancy.penghuni', function ($sq) use ($searchTerm) {
                    $sq->where('name', 'like', '%' . $searchTerm . '%');
                })
                ->orWhereHas('invoice.tenancy.room.kos', function ($sq) use ($searchTerm) {
                    $sq->where('name', 'like', '%' . $searchTerm . '%');
                })
                ->orWhereHas('invoice.tenancy.room', function ($sq) use ($searchTerm) {
                    $sq->where('room_number', 'like', '%' . $searchTerm . '%');
                })
                ->orWhere('method', 'like', '%' . $searchTerm . '%');
            });
        }
    }
}
