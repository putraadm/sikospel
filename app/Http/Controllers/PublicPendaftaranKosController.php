<?php

namespace App\Http\Controllers;

use App\Models\Kos;
use App\Models\User;
use App\Models\PendaftaranKos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PublicPendaftaranKosController extends Controller
{
    public function create(Request $request, $slug = null)
    {
        $kos = Kos::with(['rooms' => function ($q) {
            $q->with('typeKamar')->select('id', 'kos_id', 'room_number', 'type_kamar_id', 'status');
        }])->get();

        $selectedKos = null;
        if ($slug) {
            $selectedKos = Kos::where('slug', $slug)->first();
        } elseif ($request->query('kos_id')) {
            $selectedKos = Kos::find($request->query('kos_id'));
        }

        return Inertia::render('Public/Pendaftaran/Create', [
            'kosList' => $kos,
            'selectedKos' => $selectedKos,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kos_id' => 'required|exists:kos,id',
            'start_date' => 'required|date|after_or_equal:today',
            'notes' => 'nullable|string|max:1000',
            'nama' => 'required|string|max:255',
            'no_wa' => 'required|string|max:20',
            'alamat' => 'required|string|max:500',
            'agama' => 'required|string|max:50',
            'file_ktp' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'file_kk' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $pathKtp = $request->file('file_ktp')->store('documents/ktp', 'public');
        $pathKk = $request->file('file_kk')->store('documents/kk', 'public');

        $pendaftaran = PendaftaranKos::create([
            'kos_id' => $request->kos_id,
            'nama' => $request->nama,
            'no_wa' => $request->no_wa,
            'alamat' => $request->alamat,
            'agama' => $request->agama,
            'file_path_ktp' => $pathKtp,
            'file_path_kk' => $pathKk,
            'start_date' => $request->start_date,
            'status' => 'menunggu',
            'notes' => $request->notes,
        ]);

        return redirect('/pendaftaran-kos/sukses/' . $pendaftaran->id);
    }

    public function success($id)
    {
        $pendaftaran = PendaftaranKos::with(['kos', 'assignedRoom.typeKamar'])->find($id);

        if (!$pendaftaran) {
            return redirect()->route('home');
        }

        $generatedUser = null;
        if ($pendaftaran->status === 'diterima' && $pendaftaran->calon_penghuni_id) {
            $user = User::find($pendaftaran->calon_penghuni_id);
            if ($user) {
                $generatedUser = [
                    'username' => $user->username,
                    'email' => $user->email,
                    'password' => $pendaftaran->generated_password_plain,
                ];
            }
        }

        return Inertia::render('Public/Pendaftaran/Success', [
            'pendaftaran' => $pendaftaran,
            'generatedUser' => $generatedUser,
        ]);
    }
}
