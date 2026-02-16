<?php

use App\Http\Controllers\AdminKamarController;
use App\Http\Controllers\AdminKosController;
use App\Http\Controllers\AdminPemilikController;
use App\Http\Controllers\AdminPendaftaranKosController;
use App\Http\Controllers\AdminPenghuniController;
use App\Http\Controllers\AdminRoleController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\PenghuniDashboardController;
use App\Http\Controllers\PenghuniTagihanController;
use App\Http\Controllers\PublicKosController;
use App\Http\Controllers\PublicPendaftaranKosController;
use App\Models\Kos;
use App\Models\Room;
use App\Models\Penyewaan;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Penghuni;
use App\Models\Pemilik;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Laravel\Fortify\Features;

Route::get('/', function (Request $request) {
    $search = $request->query('search');
    
    $query = Kos::with(['rooms' => function($q) {
        $q->select('id', 'kos_id', 'room_number', 'type_kamar_id', 'status')
          ->with('typeKamar');
    }]);

    if ($search) {
        $query->where(function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('address', 'like', "%{$search}%");
        });
    }

    $kos = $query->get();

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'kos' => $kos,
        'filters' => [
            'search' => $search
        ]
    ]);
})->name('home');

Route::get('pendaftaran-kos-{slug?}', [PublicPendaftaranKosController::class, 'create'])->name('public.pendaftaran-kos.create');
Route::post('pendaftaran-kos', [PublicPendaftaranKosController::class, 'store'])->name('public.pendaftaran-kos.store');
Route::get('pendaftaran-kos/sukses/{id}', [PublicPendaftaranKosController::class, 'success'])->name('public.pendaftaran-kos.sukses');
Route::get('kos/{slug}', [PublicKosController::class, 'show'])->name('public.kos.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();
        if ($user->role && $user->role->name === 'penghuni') {
            return app(PenghuniDashboardController::class)->index(request());
        }

        $pemilik = Pemilik::where('user_id', $user->id)->first();

        if ($user->role && $user->role->name === 'pemilik' && $pemilik) {
            $kosIds = Kos::where('owner_id', $pemilik->user_id)->pluck('id');
            $roomIds = Room::whereIn('kos_id', $kosIds)->pluck('id');
            $penyewaanIds = Penyewaan::whereIn('room_id', $roomIds)->pluck('id');

            $totalPenghuni = Penyewaan::whereIn('room_id', $roomIds)->where('status', 'aktif')->count();
            $jumlahKos = $kosIds->count();
            $totalKamar = $roomIds->count();
            $totalPendapatan = Payment::whereIn('invoice_id', 
                Invoice::whereIn('tenancy_id', $penyewaanIds)->pluck('id')
            )->where('status', 'sukses')->sum('amount_paid');
            $latestPenghuni = Penghuni::whereIn('user_id', 
                Penyewaan::whereIn('room_id', $roomIds)->pluck('penghuni_id')
            )->with('user')->latest('created_at')->take(5)->get();
            $latestPayments = Payment::whereIn('invoice_id',
                Invoice::whereIn('tenancy_id', $penyewaanIds)->pluck('id')
            )->latest('payment_date')->take(5)->get();
        } else {
            $totalPenghuni = Penghuni::count();
            $jumlahKos = Kos::count();
            $totalKamar = Room::count();
            $totalPendapatan = Payment::where('status', 'sukses')->sum('amount_paid');
            $latestPenghuni = Penghuni::with('user')->latest('created_at')->take(5)->get();
            $latestPayments = Payment::latest('payment_date')->take(5)->get();
        }

        return Inertia::render('dashboard', [
            'totalPenghuni' => $totalPenghuni,
            'jumlahKos' => $jumlahKos,
            'totalKamar' => $totalKamar,
            'totalPendapatan' => $totalPendapatan,
            'latestPenghuni' => $latestPenghuni,
            'latestPayments' => $latestPayments,
        ]);
    })->name('dashboard');

    // Penghuni routes
    Route::middleware(['role:penghuni'])->prefix('penghuni')->group(function () {
        Route::get('tagihan', [PenghuniTagihanController::class, 'index'])->name('penghuni.tagihan');
    });

    Route::prefix('admin')->group(function () {
        // Superadmin only
        Route::middleware(['role:superadmin'])->group(function () {
            Route::resource('roles', AdminRoleController::class);
            Route::resource('users', AdminUserController::class);
            Route::resource('pemilik', AdminPemilikController::class);
        });

        // Superadmin and Pemilik
        Route::middleware(['role:superadmin,pemilik'])->group(function () {
            Route::resource('pendaftaran-kos', AdminPendaftaranKosController::class)
                ->parameters(['pendaftaran-kos' => 'pendaftaranKos']);
            Route::resource('penghuni', AdminPenghuniController::class);
            Route::resource('kos', AdminKosController::class);
            Route::resource('type-kamar', \App\Http\Controllers\AdminTypeKamarController::class);
            Route::resource('room', AdminKamarController::class);
            Route::get('tagihan', function () {
                return Inertia::render('admin/Tagihan/Index', [
                    'rooms' => \App\Models\Room::with(['typeKamar', 'kos'])->get(),
                    'invoices' => \App\Models\Invoice::with(['tenancy.penghuni', 'tenancy.room.kos', 'tenancy.room.typeKamar', 'payments'])->latest()->get(),
                ]);
            });
            Route::get('tagihan/create', function (\Illuminate\Http\Request $request) {
                $room = null;
                if ($request->has('room_id')) {
                    $room = \App\Models\Room::with(['typeKamar', 'kos'])->find($request->room_id);
                }
                return Inertia::render('admin/Tagihan/Create', [
                    'kos' => \App\Models\Kos::all(),
                    'rooms' => \App\Models\Room::with(['typeKamar', 'kos'])->get(),
                    'room' => $room,
                ]);
            });
            Route::post('tagihan', function (\Illuminate\Http\Request $request) {
                $request->validate([
                    'room_id' => 'required|exists:rooms,id',
                    'billing_date' => 'required|integer|min:1|max:31',
                ]);

                $room = \App\Models\Room::findOrFail($request->room_id);
                $room->update([
                    'billing_date' => $request->billing_date,
                ]);

                return redirect()->route('admin.tagihan.index')->with('success', 'Pengaturan tagihan berhasil disimpan.');
            })->name('admin.tagihan.index');
        });
    });
});


require __DIR__.'/settings.php';
