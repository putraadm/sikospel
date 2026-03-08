<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Kos;
use App\Models\Room;
use App\Models\Pemilik;
use Inertia\Inertia;

use App\Models\Penyewaan;
use Carbon\Carbon;

class AdminInvoiceController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $query = Invoice::with(['tenancy.penghuni', 'tenancy.room.kos', 'tenancy.room.typeKamar', 'payments'])->latest();

        if ($user->role->name === 'pemilik') {
            $pemilik = Pemilik::where('user_id', $user->id)->first();
            if ($pemilik) {
                $kosIds = Kos::where('owner_id', $pemilik->user_id)->pluck('id');
                $query->whereHas('tenancy.room', function($q) use ($kosIds) {
                    $q->whereIn('kos_id', $kosIds);
                });
            }
        }

        return Inertia::render('admin/Tagihan/Index', [
            'invoices' => $query->get(),
        ]);
    }

    public function create(Request $request)
    {
        $user = auth()->user();
        $room = null;
        
        $kosQuery = Kos::query();
        $roomQuery = Room::with(['typeKamar', 'kos']);

        if ($user->role->name === 'pemilik') {
            $pemilik = Pemilik::where('user_id', $user->id)->first();
            if ($pemilik) {
                $kosQuery->where('owner_id', $pemilik->user_id);
                $roomQuery->whereHas('kos', function($q) use ($pemilik) {
                    $q->where('owner_id', $pemilik->user_id);
                });
            }
        }

        if ($request->has('room_id')) {
            $room = (clone $roomQuery)->find($request->room_id);
        }

        return Inertia::render('admin/Tagihan/Create', [
            'kos' => $kosQuery->get(),
            'rooms' => $roomQuery->get(),
            'room' => $room,
        ]);
    }

    public function updateBillingDate(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'billing_date' => 'required|integer|min:1|max:31',
        ]);

        $room = Room::findOrFail($request->room_id);
        
        // Security check for Pemilik
        $user = auth()->user();
        if ($user->role->name === 'pemilik') {
            if ($room->kos->owner_id !== $user->id) {
                abort(403, 'Unauthorized access to this room.');
            }
        }

        $room->update([
            'billing_date' => $request->billing_date,
        ]);

        return redirect()->route('admin.tagihan.index')->with('success', 'Pengaturan tagihan berhasil disimpan.');
    }

    public function bulkGenerate(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020',
        ]);

        $month = $request->month;
        $year = $request->year;
        $billingPeriod = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $user = auth()->user();

        $query = Penyewaan::where('status', 'aktif')
            ->with(['penghuni', 'room.typeKamar', 'room.kos']);

        if ($user->role->name === 'pemilik') {
            $pemilik = Pemilik::where('user_id', $user->id)->first();
            if ($pemilik) {
                $query->whereHas('room.kos', function($q) use ($pemilik) {
                    $q->where('owner_id', $pemilik->user_id);
                });
            }
        }

        $tenancies = $query->get();
        $generatedCount = 0;

        foreach ($tenancies as $tenancy) {
            // Check if invoice already exists for this period
            $exists = Invoice::where('tenancy_id', $tenancy->id)
                ->where('billing_period', $billingPeriod->format('Y-m-d'))
                ->exists();

            if ($exists) continue;

            $room = $tenancy->room;
            $penghuni = $tenancy->penghuni;
            $dailyRate = $room->typeKamar ? $room->typeKamar->harga : 0;
            $startDate = Carbon::parse($tenancy->start_date);
            
            $amount = 0;
            $periodEnd = $billingPeriod->copy()->endOfMonth();

            // If tenancy started after this period, skip
            if ($startDate->isAfter($periodEnd)) {
                continue;
            }

            if ($startDate->month == $month && $startDate->year == $year) {
                // First month of tenancy
                if ($penghuni->status_penghuni === 'penghuni') {
                    $amount = $dailyRate * 30;
                } else {
                    $remainingDays = $periodEnd->day - $startDate->day + 1;
                    $amount = $dailyRate * $remainingDays;
                }
            } else {
                // Subsequent months
                if ($penghuni->status_penghuni === 'penghuni') {
                    $amount = $dailyRate * 30;
                } else {
                    $amount = $dailyRate * $periodEnd->day;
                }
            }

            Invoice::create([
                'tenancy_id' => $tenancy->id,
                'amount' => $amount,
                'due_date' => $billingPeriod->copy()->addDays(9), // Default due date 10th
                'billing_period' => $billingPeriod,
                'status' => 'belum_dibayar',
            ]);

            $generatedCount++;
        }

        return redirect()->back()->with('success', "$generatedCount tagihan berhasil digenerate untuk periode " . $billingPeriod->format('F Y'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
        ]);

        $invoice = Invoice::findOrFail($id);
        
        // Security check
        $user = auth()->user();
        if ($user->role->name === 'pemilik') {
            $pemilik = Pemilik::where('user_id', $user->id)->first();
            if ($invoice->tenancy->room->kos->owner_id !== $pemilik->user_id) {
                abort(403);
            }
        }

        $invoice->update($request->only(['amount', 'due_date']));

        return redirect()->back()->with('success', 'Tagihan berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        
        // Security check
        $user = auth()->user();
        if ($user->role->name === 'pemilik') {
            $pemilik = Pemilik::where('user_id', $user->id)->first();
            if ($invoice->tenancy->room->kos->owner_id !== $pemilik->user_id) {
                abort(403);
            }
        }

        if ($invoice->status === 'lunas') {
            return redirect()->back()->with('error', 'Tagihan yang sudah lunas tidak dapat dihapus.');
        }

        $invoice->delete();

        return redirect()->back()->with('success', 'Tagihan berhasil dihapus.');
    }

    public function markAsPaid(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        
        if ($invoice->status === 'lunas') {
            return redirect()->back()->with('error', 'Tagihan sudah lunas.');
        }

        DB::transaction(function () use ($invoice) {
            $invoice->update(['status' => 'lunas']);

            Payment::create([
                'invoice_id' => $invoice->id,
                'payment_date' => now(),
                'amount_paid' => $invoice->amount,
                'method' => 'cash',
                'sumber' => 'manual',
                'status' => 'sukses',
                'feedback' => 'Dibayar tunai (cash) melalui Admin/Pemilik.',
            ]);
        });

        return redirect()->back()->with('success', 'Tagihan berhasil ditandai sebagai lunas (Cash).');
    }
}
