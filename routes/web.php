<?php

use App\Http\Controllers\AdminPendaftaranKosController;
use App\Http\Controllers\AdminRoleController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\PublicPendaftaranKosController;
use App\Models\Kos;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    $kos = Kos::with('rooms')->get();

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'kos' => $kos,
    ]);
})->name('home');

Route::get('pendaftaran-kos', [PublicPendaftaranKosController::class, 'create'])->name('public.pendaftaran-kos.create');
Route::post('pendaftaran-kos', [PublicPendaftaranKosController::class, 'store'])->name('public.pendaftaran-kos.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('admin/pendaftaran-kos', AdminPendaftaranKosController::class)->names([
        'index' => 'admin.pendaftaran-kos.index',
        'show' => 'admin.pendaftaran-kos.show',
        'update' => 'admin.pendaftaran-kos.update',
    ]);

    Route::resource('admin/roles', AdminRoleController::class)->names([
        'index' => 'admin.roles.index',
        'store' => 'admin.roles.store',
        'update' => 'admin.roles.update',
        'destroy' => 'admin.roles.destroy',
    ]);

    Route::resource('admin/users', AdminUserController::class)->names([
        'index' => 'admin.users.index',
        'store' => 'admin.users.store',
        'update' => 'admin.users.update',
        'destroy' => 'admin.users.destroy',
    ]);
});

require __DIR__.'/settings.php';
