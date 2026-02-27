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
        
        $sortableColumns = [
            'payment_date' => 'payments.payment_date',
            'amount_paid' => 'payments.amount_paid',
            'method' => 'payments.method',
            'penghuni_name' => 'penghuni.name',
            'kos_name' => 'kos.name',
            'type_kamar' => 'type_kamars.nama',
            'billing_period' => 'invoices.billing_period',
        ];
        
        $orderColumn = $sortableColumns[$sortColumn] ?? 'payments.payment_date';
        
        // We need separate queries for top cards (period-specific but respecting Kos/User context)
        $baseContext = Payment::where('status', 'sukses')
            ->whereHas('invoice', fn($q) => $q->where('status', 'lunas'));

        if ($isPemilik) {
            $baseContext->whereHas('invoice.tenancy.room.kos', fn($q) => $q->where('owner_id', $user->id));
        }

        if ($request->filled('kos_id') && $request->kos_id !== 'all') {
            $baseContext->whereHas('invoice.tenancy.room.kos', fn($q) => $q->where('id', $request->kos_id));
        }

        $totalToday = (clone $baseContext)->whereDate('payment_date', Carbon::today())->sum('payments.amount_paid');
        $totalMonth = (clone $baseContext)->whereMonth('payment_date', Carbon::now()->month)
                                        ->whereYear('payment_date', Carbon::now()->year)
                                        ->sum('payments.amount_paid');
        $totalYear = (clone $baseContext)->whereYear('payment_date', Carbon::now()->year)->sum('payments.amount_paid');

        $totalFiltered = (clone $query)->sum('payments.amount_paid');

        // Pagination
        $payments = (clone $query)
            ->orderBy($orderColumn, $sortDirection)
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

        $query = Payment::select('payments.*')
            ->with([
                'invoice.tenancy.penghuni',
                'invoice.tenancy.room.kos',
                'invoice.tenancy.room.typeKamar'
            ])
            ->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
            ->join('penyewaan', 'invoices.tenancy_id', '=', 'penyewaan.id')
            ->join('penghuni', 'penyewaan.penghuni_id', '=', 'penghuni.user_id')
            ->join('rooms', 'penyewaan.room_id', '=', 'rooms.id')
            ->join('kos', 'rooms.kos_id', '=', 'kos.id')
            ->join('type_kamars', 'rooms.type_kamar_id', '=', 'type_kamars.id')
            ->where('payments.status', 'sukses')
            ->where('invoices.status', 'lunas');

        if ($isPemilik) {
            $query->where('kos.owner_id', $user->id);
        }

        if ($request->filled('kos_id') && $request->kos_id !== 'all') {
            $query->where('kos.id', $request->kos_id);
        }

        if ($request->filled('bulan') && $request->bulan !== 'all') {
            $query->whereMonth('payments.payment_date', $request->bulan);
        }

        if ($request->filled('tahun') && $request->tahun !== 'all') {
            $query->whereYear('payments.payment_date', $request->tahun);
        }

        if ($request->filled('method') && $request->method !== 'all') {
            $query->where('payments.method', $request->method);
        }

        if ($request->filled('search')) {
            $searchTerm = trim($request->search);
            $query->where(function ($q) use ($searchTerm) {
                $q->where('penghuni.name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('kos.name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('type_kamars.nama', 'like', '%' . $searchTerm . '%')
                  ->orWhere('rooms.room_number', 'like', '%' . $searchTerm . '%');
            });
        }

        return $query;
    }
}
