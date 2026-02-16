<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\PendaftaranKos;
use App\Models\Penghuni;
use App\Models\Penyewaan;
use App\Models\Role;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminPendaftaranKosController extends Controller
{
    public function index()
    {
        $pendaftaranKos = PendaftaranKos::with(['kos', 'assignedRoom.typeKamar'])->get();

        return Inertia::render('Admin/PendaftaranKos/Index', [
            'pendaftaranKos' => $pendaftaranKos,
        ]);
    }

    public function show(PendaftaranKos $pendaftaranKos)
    {
        $pendaftaranKos->load(['kos.rooms.typeKamar', 'assignedRoom.typeKamar']);

        $availableRooms = Room::where('kos_id', $pendaftaranKos->kos_id)
            ->with('typeKamar')
            ->where('status', 'tersedia')
            ->get();

        $generatedCredentials = session('generated_credentials');

        return Inertia::render('Admin/PendaftaranKos/Show', [
            'pendaftaranKos' => $pendaftaranKos,
            'availableRooms' => $availableRooms,
            'generatedCredentials' => $generatedCredentials,
        ]);
    }

    public function update(Request $request, PendaftaranKos $pendaftaranKos)
    {
        $rules = [
            'status' => 'required|in:menunggu,diterima,ditolak,dibatalkan',
            'notes' => 'nullable|string',
        ];

        if ($request->status === 'diterima') {
            $rules['assigned_room_id'] = 'required|exists:rooms,id';
        }

        $request->validate($rules);

        return DB::transaction(function () use ($request, $pendaftaranKos) {
            $pendaftaranKos->update([
                'status' => $request->status,
                'notes' => $request->notes,
                'assigned_room_id' => $request->status === 'diterima' ? $request->assigned_room_id : null,
                'verified_at' => in_array($request->status, ['diterima', 'ditolak']) ? now() : null,
            ]);

            $generatedCredentials = null;

            if ($request->status === 'diterima') {
                $room = Room::findOrFail($request->assigned_room_id);

                $username = Str::slug($pendaftaranKos->nama, '') . rand(100, 999);
                $email = $username . '@sikospel.com';
                $plainPassword = Str::random(8);

                $role = Role::where('name', 'penghuni')->first();
                $user = User::create([
                    'username' => $username,
                    'email' => $email,
                    'password' => Hash::make($plainPassword),
                    'role_id' => $role->id,
                ]);

                Penghuni::create([
                    'user_id' => $user->id,
                    'name' => $pendaftaranKos->nama,
                    'no_wa' => $pendaftaranKos->no_wa,
                    'address' => $pendaftaranKos->alamat,
                    'religion' => $pendaftaranKos->agama,
                    'file_path_ktp' => $pendaftaranKos->file_path_ktp,
                    'file_path_kk' => $pendaftaranKos->file_path_kk,
                ]);

                $pendaftaranKos->update([
                    'calon_penghuni_id' => $user->id,
                    'generated_password_plain' => $plainPassword,
                ]);

                $startDate = $pendaftaranKos->start_date ?? now()->toDateString();
                $penyewaan = Penyewaan::create([
                    'penghuni_id' => $user->id,
                    'room_id' => $room->id,
                    'start_date' => $startDate,
                    'status' => 'aktif',
                ]);

                $room->update(['status' => 'ditempati']);

                $room->load('typeKamar');
                $monthlyRate = $room->typeKamar ? $room->typeKamar->harga : 0;
                
                $billingPeriod = now()->startOfMonth();
                $dueDate = now()->startOfMonth()->addDays(9);
                Invoice::create([
                    'tenancy_id' => $penyewaan->id,
                    'amount' => $monthlyRate,
                    'due_date' => $dueDate,
                    'billing_period' => $billingPeriod,
                    'status' => 'belum_dibayar',
                ]);

                $generatedCredentials = [
                    'username' => $username,
                    'email' => $email,
                    'password' => $plainPassword,
                ];
            }

            return redirect()
                ->route('pendaftaran-kos.show', $pendaftaranKos->id)
                ->with('success', 'Status pendaftaran berhasil diperbarui.')
                ->with('generated_credentials', $generatedCredentials);
        });
    }
}
