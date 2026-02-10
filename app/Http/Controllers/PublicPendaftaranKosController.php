<?php

namespace App\Http\Controllers;

use App\Models\Kos;
use App\Models\Penghuni;
use App\Models\PendaftaranKos;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PublicPendaftaranKosController extends Controller
{
    public function create()
    {
        $kos = Kos::with('rooms')->get();

        return Inertia::render('Public/PendaftaranKos/Create', [
            'kos' => $kos,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kos_id' => 'required|exists:kos,id',
            'preferred_room_id' => 'nullable|exists:rooms,id',
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'religion' => 'required|string|max:50',
            'no_wa' => 'required|string|max:20',
            'file_ktp' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'file_kk' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        // Upload files
        $ktpPath = $request->file('file_ktp')->store('uploads/ktp', 'public');
        $kkPath = $request->file('file_kk')->store('uploads/kk', 'public');

        // Create penghuni record
        $penghuni = Penghuni::create([
            'name' => $request->name,
            'address' => $request->address,
            'religion' => $request->religion,
            'no_wa' => $request->no_wa,
            'file_path_ktp' => $ktpPath,
            'file_path_kk' => $kkPath,
        ]);

        // Create pendaftaran record
        PendaftaranKos::create([
            'kos_id' => $request->kos_id,
            'calon_penghuni_id' => $penghuni->id,
            'preferred_room_id' => $request->preferred_room_id,
            'status' => 'menunggu',
        ]);

        return redirect()->back()->with('success', 'Pendaftaran berhasil dikirim. Silakan tunggu konfirmasi dari pemilik kos.');
    }
}
