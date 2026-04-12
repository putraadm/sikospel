<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Invoice;
use App\Models\Kos;
use App\Models\Payment;
use App\Models\Penghuni;
use App\Models\Penyewaan;
use App\Models\Room;
use App\Models\TypeKamar;
use App\Models\User;
use App\Jobs\SyncMutasiPelaporanJob;

class AdminPenghuniController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $queryPenghuni = Penghuni::with(['user', 'currentRoom.typeKamar', 'currentRoom.kos']);
        $queryRooms = \App\Models\Room::with(['typeKamar', 'kos']);
        $queryTypeKamars = \App\Models\TypeKamar::query();
        $queryKos = \App\Models\Kos::query();

        if ($user->role->name === 'pemilik') {
            $pemilik = \App\Models\Pemilik::where('user_id', $user->id)->first();
            $kosIds = \App\Models\Kos::where('owner_id', $pemilik->user_id)->pluck('id');
            
            $queryPenghuni->whereHas('currentRoom', function($q) use ($kosIds) {
                $q->whereIn('kos_id', $kosIds);
            });
            $queryRooms->whereIn('kos_id', $kosIds);
            $queryKos->where('owner_id', $pemilik->user_id);
            $queryTypeKamars->where('user_id', $user->id);
        }

        // Filtering
        if ($request->kos_id) {
            $queryPenghuni->whereHas('currentRoom', function($q) use ($request) {
                $q->where('kos_id', $request->kos_id);
            });
        }

        if ($request->status) {
            $queryPenghuni->where('status_penghuni', $request->status);
        }

        $queryPenghuni->orderBy('created_at', 'desc');

        return Inertia::render('Admin/Penghuni/Index', [
            'penghuni' => $queryPenghuni->get(),
            'rooms' => $queryRooms->get(),
            'typeKamars' => $queryTypeKamars->get(),
            'kos' => $queryKos->get(),
            'filters' => $request->only(['kos_id', 'status']),
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $queryRooms = \App\Models\Room::with(['typeKamar', 'kos']);
        $queryTypeKamars = \App\Models\TypeKamar::query();
        $queryKos = \App\Models\Kos::query();

        if ($user->role->name === 'pemilik') {
            $pemilik = \App\Models\Pemilik::where('user_id', $user->id)->first();
            $kosIds = \App\Models\Kos::where('owner_id', $pemilik->user_id)->pluck('id');
            
            $queryRooms->whereIn('kos_id', $kosIds);
            $queryKos->where('owner_id', $pemilik->user_id);
            $queryTypeKamars->where('user_id', $user->id);
        }

        return Inertia::render('Admin/Penghuni/Create', [
            'rooms' => $queryRooms->get(),
            'typeKamars' => $queryTypeKamars->get(),
            'kos' => $queryKos->get(),
        ]);
    }

    public function edit($id)
    {
        $user = auth()->user();
        $penghuni = Penghuni::with(['user', 'currentRoom.typeKamar', 'currentRoom.kos'])->findOrFail($id);
        
        $queryRooms = \App\Models\Room::with(['typeKamar', 'kos']);
        $queryTypeKamars = \App\Models\TypeKamar::query();
        $queryKos = \App\Models\Kos::query();

        if ($user->role->name === 'pemilik') {
            $pemilik = \App\Models\Pemilik::where('user_id', $user->id)->first();
            $kosIds = \App\Models\Kos::where('owner_id', $pemilik->user_id)->pluck('id');
            
            // Security check
            if ($penghuni->currentRoom && !in_array($penghuni->currentRoom->kos_id, $kosIds->toArray())) {
                abort(403, 'Unauthorized access to this resident.');
            }

            $queryRooms->whereIn('kos_id', $kosIds);
            $queryKos->where('owner_id', $pemilik->user_id);
            $queryTypeKamars->where('user_id', $user->id);
        }

        return Inertia::render('Admin/Penghuni/Edit', [
            'penghuni' => $penghuni,
            'rooms' => $queryRooms->get(),
            'typeKamars' => $queryTypeKamars->get(),
            'kos' => $queryKos->get(),
        ]);
    }

    public function store(Request $request)
    {
        // First, check if NIK already exists to determine if we need a new user
        $existingPenghuni = null;
        if ($request->nik) {
            $existingPenghuni = Penghuni::where('nik', $request->nik)->first();
        }

        $request->validate([
            'username' => $existingPenghuni ? 'nullable|string' : 'required|string|max:255|unique:users,username',
            'nik' => 'nullable|string|size:16',
            'name' => 'required|string|max:255',
            'no_wa' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'religion' => 'nullable|string|max:50',
            'file_path_kk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_path_ktp' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'tanggal_daftar' => 'nullable|date',
            'status_penghuni' => 'required|in:penghuni,pra penghuni,keluar',
            'room_id' => 'nullable|exists:rooms,id',
        ]);

        return \DB::transaction(function () use ($request, $existingPenghuni) {
            $user = null;
            $isNewUser = false;
            $password = null;

            if ($existingPenghuni) {
                $user = $existingPenghuni->user;
            } else {
                $password = \Str::random(8);
                $user = User::create([
                    'username' => $request->username,
                    'email' => $request->username . '@sikospel.com',
                    'password' => bcrypt($password),
                    'role_id' => 4,
                ]);
                $isNewUser = true;
            }

            $data = $request->only(['nik', 'name', 'no_wa', 'address', 'religion', 'tanggal_daftar', 'status_penghuni']);
            $data['user_id'] = $user->id;

            if ($request->hasFile('file_path_kk')) {
                $data['file_path_kk'] = $request->file('file_path_kk')->store('kk', 'public');
            }

            if ($request->hasFile('file_path_ktp')) {
                $data['file_path_ktp'] = $request->file('file_path_ktp')->store('ktp', 'public');
            }

            if ($existingPenghuni) {
                $existingPenghuni->update($data);
                $penghuni = $existingPenghuni;
            } else {
                $penghuni = Penghuni::create($data);
            }

            if ($request->room_id) {
                // Check if already has active tenancy
                $currentPenyewaan = Penyewaan::where('penghuni_id', $penghuni->user_id)->where('status', 'aktif')->first();
                
                if ($currentPenyewaan) {
                    $currentPenyewaan->update(['status' => 'selesai', 'end_date' => now()]);
                    $oldRoom = Room::find($currentPenyewaan->room_id);
                    if ($oldRoom) $oldRoom->update(['status' => 'tersedia']);
                }

                $penyewaan = Penyewaan::create([
                    'penghuni_id' => $penghuni->user_id,
                    'room_id' => $request->room_id,
                    'start_date' => $request->tanggal_daftar ?? now(),
                    'status' => 'aktif',
                ]);

                $room = Room::find($request->room_id);
                if ($room) {
                    $room->update(['status' => 'ditempati']);
                }

                SyncMutasiPelaporanJob::dispatch(
                    $penghuni->user_id,
                    $penghuni->nik,
                    $penghuni->name,
                    $penghuni->no_wa,
                    $penghuni->religion,
                    $penghuni->file_path_ktp,
                    $penghuni->file_path_kk,
                    $room->kos_id,
                    'masuk',
                    $request->tanggal_daftar ?? now()->format('Y-m-d')
                );
            }

            $redirect = redirect()->route('penghuni.index')->with('success', $isNewUser ? 'Akun penghuni berhasil dibuat.' : 'Data penghuni diperbarui dan mutasi dicatat.');
            
            if ($isNewUser) {
                $redirect->with('new_user_account', [
                    'username' => $user->username,
                    'email' => $user->email,
                    'password' => $password,
                    'name' => $penghuni->name
                ]);
            }

            return $redirect;
        });
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            // 'nik' => 'required|string|size:16|unique:penghuni,nik,' . $id . ',user_id',
            'nik' => 'nullable|string|size:16',
            'name' => 'required|string|max:255',
            'no_wa' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'religion' => 'nullable|string|max:50',
            'file_path_kk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_path_ktp' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'tanggal_daftar' => 'nullable|date',
            'status_penghuni' => 'required|in:penghuni,pra penghuni,keluar',
            'room_id' => 'nullable|exists:rooms,id',
        ]);

        return \DB::transaction(function () use ($request, $id) {
            $penghuni = Penghuni::findOrFail($id);
            $data = $request->only(['nik', 'name', 'no_wa', 'address', 'religion', 'tanggal_daftar', 'status_penghuni']);

            if ($request->hasFile('file_path_kk')) {
                $data['file_path_kk'] = $request->file('file_path_kk')->store('kk', 'public');
            }

            if ($request->hasFile('file_path_ktp')) {
                $data['file_path_ktp'] = $request->file('file_path_ktp')->store('ktp', 'public');
            }

            $penghuni->update($data);
            $mutasiDispatched = false;

            if ($request->status_penghuni === 'keluar') {
                $currentPenyewaan = $penghuni->currentPenyewaan;
                if ($currentPenyewaan) {
                    $room = Room::find($currentPenyewaan->room_id);
                    if ($room) {
                        $room->update(['status' => 'tersedia']);
                        
                        SyncMutasiPelaporanJob::dispatch(
                            $penghuni->user_id,
                            $penghuni->nik,
                            $penghuni->name,
                            $penghuni->no_wa,
                            $penghuni->religion,
                            null,
                            null,
                            $room->kos_id,
                            'keluar',
                            now()->format('Y-m-d')
                        );
                        $mutasiDispatched = true;
                    }
                    $currentPenyewaan->update(['status' => 'selesai', 'end_date' => now()]);
                }
            } elseif ($request->room_id) {
                $currentPenyewaan = $penghuni->currentPenyewaan;
                
                if (!$currentPenyewaan || $currentPenyewaan->room_id != $request->room_id) {
                    $oldKosId = null;

                    if ($currentPenyewaan) {
                        $oldRoom = Room::find($currentPenyewaan->room_id);
                        if ($oldRoom) {
                            $oldKosId = $oldRoom->kos_id;
                            $oldRoom->update(['status' => 'tersedia']);
                        }
                        $currentPenyewaan->update(['status' => 'selesai', 'end_date' => now()]);
                    }

                    Penyewaan::create([
                        'penghuni_id' => $penghuni->user_id,
                        'room_id' => $request->room_id,
                        'start_date' => $request->tanggal_daftar ?? now(),
                        'status' => 'aktif',
                    ]);

                    $newRoom = Room::find($request->room_id);
                    $newKosId = null;
                    if ($newRoom) {
                        $newKosId = $newRoom->kos_id;
                        $newRoom->update(['status' => 'ditempati']);
                    }

                    if ($newKosId && $oldKosId !== $newKosId) {
                        if ($oldKosId) {
                            SyncMutasiPelaporanJob::dispatch(
                                $penghuni->user_id,
                                $penghuni->nik,
                                $penghuni->name,
                                $penghuni->no_wa,
                                $penghuni->religion,
                                null, // KTP gak dikirim kalau keluar
                                null, // KK gak dikirim kalau keluar
                                $oldKosId,
                                'keluar',
                                now()->format('Y-m-d')
                            );
                        }

                        // B. Laporkan MASUK ke Kos Baru
                        \App\Jobs\SyncMutasiPelaporanJob::dispatch(
                            $penghuni->user_id,
                            $penghuni->nik,
                            $penghuni->name,
                            $penghuni->no_wa,
                            $penghuni->religion,
                            $penghuni->file_path_ktp,
                            $penghuni->file_path_kk,
                            $newKosId,
                            'masuk',
                            $request->tanggal_daftar ?? now()->format('Y-m-d')
                        );
                        $mutasiDispatched = true;
                    }
                }
            }

            if (!$mutasiDispatched) {
                \App\Jobs\SyncPenghuniPelaporanJob::dispatch(
                    $penghuni->user_id,
                    $penghuni->nik,
                    $penghuni->name,
                    $penghuni->no_wa,
                    $penghuni->religion,
                    $penghuni->file_path_ktp,
                    $penghuni->file_path_kk
                );
            }

            return redirect()->route('penghuni.index')->with('success', 'Penghuni updated successfully.');
        });
    }

    public function destroy($id)
    {
        return \DB::transaction(function () use ($id) {
            $penghuni = Penghuni::findOrFail($id);
            $user = $penghuni->user;
            
            $currentPenyewaan = $penghuni->currentPenyewaan;
            $idKosKeluar = null;

            if ($currentPenyewaan) {
                $room = Room::find($currentPenyewaan->room_id);
                if ($room) {
                    $idKosKeluar = $room->kos_id;
                    $room->update(['status' => 'tersedia']);
                }
                // Akhiri masa sewa
                $currentPenyewaan->update(['status' => 'selesai', 'end_date' => now()]);
            }

            if ($idKosKeluar) {
                SyncMutasiPelaporanJob::dispatch(
                    $penghuni->user_id,
                    $penghuni->nik,
                    $penghuni->name,
                    $penghuni->no_wa,
                    $penghuni->religion,
                    null, // KTP gak dikirim saat keluar
                    null, // KK gak dikirim saat keluar
                    $idKosKeluar,
                    'keluar',
                    now()->format('Y-m-d')
                );
            }

            // Soft delete the penghuni
            $penghuni->delete();
            // Soft delete the user
            if ($user) {
                $user->delete();
            }

            return redirect()->back()->with('success', 'Penghuni & User account deleted successfully (Data archived).');
        });
    }
}
