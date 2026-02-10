<?php

namespace App\Http\Controllers;

use App\Models\PendaftaranKos;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPendaftaranKosController extends Controller
{
    public function index()
    {
        $pendaftaranKos = PendaftaranKos::with(['kos', 'calonPenghuni', 'preferredRoom'])->get();

        return Inertia::render('Admin/PendaftaranKos/Index', [
            'pendaftaranKos' => $pendaftaranKos,
        ]);
    }

    public function show(PendaftaranKos $pendaftaranKos)
    {
        $pendaftaranKos->load(['kos', 'calonPenghuni', 'preferredRoom']);

        return Inertia::render('Admin/PendaftaranKos/Show', [
            'pendaftaranKos' => $pendaftaranKos,
        ]);
    }

    public function update(Request $request, PendaftaranKos $pendaftaranKos)
    {
        $request->validate([
            'status' => 'required|in:menunggu,diterima,ditolak,dibatalkan',
            'notes' => 'nullable|string',
        ]);

        $pendaftaranKos->update([
            'status' => $request->status,
            'notes' => $request->notes,
            'verified_at' => $request->status === 'diterima' ? now() : null,
        ]);

        return redirect()->back()->with('success', 'Status pendaftaran berhasil diperbarui.');
    }
}
