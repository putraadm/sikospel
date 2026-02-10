<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('admin')->group(function () {
        Route::resource('penghuni', \App\Http\Controllers\AdminPenghuniController::class);
        Route::resource('pemilik', \App\Http\Controllers\AdminPemilikController::class);
        Route::resource('kos', \App\Http\Controllers\AdminKosController::class);
        Route::resource('room', \App\Http\Controllers\AdminKamarController::class);
    });
});


require __DIR__.'/settings.php';
