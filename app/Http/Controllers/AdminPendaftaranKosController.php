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
        $pendaftaranKos = PendaftaranKos::with(['kos', 'assignedRoom'])->get();

        return Inertia::render('Admin/PendaftaranKos/Index', [
            'pendaftaranKos' => $pendaftaranKos,
        ]);
    }

    public function show(PendaftaranKos $pendaftaranKos)
    {
        $pendaftaranKos->load(['kos.rooms', 'assignedRoom']);

        // Ambil daftar kamar tersedia di kos terkait
        $availableRooms = Room::where('kos_id', $pendaftaranKos->kos_id)
            ->where('status', 'tersedia')
            ->get(['id', 'room_number', 'monthly_rate', 'status']);

        // Ambil credentials dari session flash (jika baru saja approve)
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

        // Jika diterima, wajib assign kamar
        if ($request->status === 'diterima') {
            $rules['assigned_room_id'] = 'required|exists:rooms,id';
        }

        $request->validate($rules);

        return DB::transaction(function () use ($request, $pendaftaranKos) {
            // Update status pendaftaran
            $pendaftaranKos->update([
                'status' => $request->status,
                'notes' => $request->notes,
                'assigned_room_id' => $request->status === 'diterima' ? $request->assigned_room_id : null,
                'verified_at' => in_array($request->status, ['diterima', 'ditolak']) ? now() : null,
            ]);

            $generatedCredentials = null;

            // Jika DITERIMA: buat user + penghuni + penyewaan + invoice
            if ($request->status === 'diterima') {
                $room = Room::findOrFail($request->assigned_room_id);

                // 1. Generate credentials
                $username = Str::slug($pendaftaranKos->nama, '') . rand(100, 999);
                $email = $username . '@kos.local';
                $plainPassword = Str::random(8);

                // 2. Buat User
                $role = Role::where('name', 'penghuni')->first();
                $user = User::create([
                    'username' => $username,
                    'email' => $email,
                    'password' => Hash::make($plainPassword),
                    'role_id' => $role->id,
                ]);

                // 3. Buat Penghuni
                Penghuni::create([
                    'user_id' => $user->id,
                    'name' => $pendaftaranKos->nama,
                    'no_wa' => $pendaftaranKos->no_wa,
                    'address' => $pendaftaranKos->alamat,
                    'religion' => $pendaftaranKos->agama,
                    'file_path_ktp' => $pendaftaranKos->file_path_ktp,
                    'file_path_kk' => $pendaftaranKos->file_path_kk,
                ]);

                // 4. Update calon_penghuni_id dan simpan password plain di pendaftaran
                $pendaftaranKos->update([
                    'calon_penghuni_id' => $user->id,
                    'generated_password_plain' => $plainPassword,
                ]);

                // 5. Buat Penyewaan
                $startDate = $pendaftaranKos->start_date ?? now()->toDateString();
                $penyewaan = Penyewaan::create([
                    'penghuni_id' => $user->id,
                    'room_id' => $room->id,
                    'start_date' => $startDate,
                    'status' => 'aktif',
                ]);

                // 6. Update status kamar → ditempati
                $room->update(['status' => 'ditempati']);

                // 7. Buat Invoice bulan pertama
                $billingPeriod = now()->startOfMonth();
                $dueDate = now()->startOfMonth()->addDays(9); // Jatuh tempo tanggal 10

                Invoice::create([
                    'tenancy_id' => $penyewaan->id,
                    'amount' => $room->monthly_rate,
                    'due_date' => $dueDate,
                    'billing_period' => $billingPeriod,
                    'status' => 'belum_dibayar',
                ]);

                // 8. Simpan credentials di session flash untuk ditampilkan ke admin
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
