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
    public function index()
    {
        $penghuni = Penghuni::with(['user', 'currentRoom.typeKamar', 'currentRoom.kos'])->get();
        $rooms = Room::with(['typeKamar', 'kos'])->get();
        $typeKamars = TypeKamar::all();
        $kos = Kos::all();
        return Inertia::render('Admin/Penghuni/Index', [
            'penghuni' => $penghuni,
            'rooms' => $rooms,
            'typeKamars' => $typeKamars,
            'kos' => $kos,
        ]);
    }

    public function create()
    {
        $rooms = Room::with(['typeKamar', 'kos'])->get();
        $typeKamars = TypeKamar::all();
        $kos = Kos::all();
        return Inertia::render('Admin/Penghuni/Create', [
            'rooms' => $rooms,
            'typeKamars' => $typeKamars,
            'kos' => $kos,
        ]);
    }

    public function edit($id)
    {
        $penghuni = Penghuni::with(['user', 'currentRoom.typeKamar', 'currentRoom.kos'])->findOrFail($id);
        $rooms = Room::with(['typeKamar', 'kos'])->get();
        $typeKamars = TypeKamar::all();
        $kos = Kos::all();
        return Inertia::render('Admin/Penghuni/Edit', [
            'penghuni' => $penghuni,
            'rooms' => $rooms,
            'typeKamars' => $typeKamars,
            'kos' => $kos,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'name' => 'required|string|max:255',
            'no_wa' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'religion' => 'nullable|string|max:50',
            'file_path_kk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_path_ktp' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'tanggal_daftar' => 'nullable|date',
            'status_penghuni' => 'required|in:penghuni,pra penghuni',
            'room_id' => 'nullable|exists:rooms,id',
        ]);

        return \DB::transaction(function () use ($request) {
            $password = \Str::random(8);
            $user = User::create([
                'username' => $request->username,
                'email' => $request->username . '@sikospel.com',
                'password' => bcrypt($password),
                'role_id' => 4,
            ]);

            $data = $request->only(['name', 'no_wa', 'address', 'religion', 'tanggal_daftar', 'status_penghuni']);
            $data['user_id'] = $user->id;

            if ($request->hasFile('file_path_kk')) {
                $data['file_path_kk'] = $request->file('file_path_kk')->store('kk', 'public');
            }

            if ($request->hasFile('file_path_ktp')) {
                $data['file_path_ktp'] = $request->file('file_path_ktp')->store('ktp', 'public');
            }

            $penghuni = Penghuni::create($data);

            if ($request->room_id) {
                $penyewaan = Penyewaan::create([
                    'penghuni_id' => $penghuni->user_id,
                    'room_id' => $request->room_id,
                    'start_date' => $request->tanggal_daftar ?? now(),
                    'status' => 'aktif',
                ]);

                $room = Room::find($request->room_id);
                if ($room) {
                    $room->update(['status' => 'ditempati']);

                    // Create initial invoice
                    $room->load('typeKamar');
                    $dailyRate = $room->typeKamar ? $room->typeKamar->harga : 0;
                    
                    $startDate = $request->tanggal_daftar ?? now();
                    $start = \Carbon\Carbon::parse($startDate);
                    $period = $start->copy()->startOfMonth();

                    $statusPenghuni = $penghuni->status_penghuni;
                    if ($statusPenghuni === 'penghuni') {
                        $amount = $dailyRate * 30;
                    } else {
                        $remainingDays = $start->daysInMonth - $start->day + 1;
                        $amount = $dailyRate * $remainingDays;
                    }
                    
                    Invoice::create([
                        'tenancy_id' => $penyewaan->id,
                        'amount' => $amount,
                        'due_date' => $period->copy()->addDays(9),
                        'billing_period' => $period,
                        'status' => 'belum_dibayar',
                    ]);
                }

                $room = Room::find($request->room_id);
                
                $urlKtp = $penghuni->file_path_ktp ? asset('storage/' . $penghuni->file_path_ktp) : null;
                $urlKk = $penghuni->file_path_kk ? asset('storage/' . $penghuni->file_path_kk) : null;

                SyncMutasiPelaporanJob::dispatch(
                    $penghuni->user_id,
                    $penghuni->name,
                    $penghuni->no_wa,
                    $penghuni->religion,
                    $urlKtp,
                    $urlKk,
                    $room->kos_id,
                    'masuk',
                    $request->tanggal_daftar ?? now()->format('Y-m-d')
                );
            }

            return redirect()->route('penghuni.index')->with('success', 'Akun penghuni berhasil dibuat.')
                ->with('new_user_account', [
                    'username' => $user->username,
                    'email' => $user->email,
                    'password' => $password,
                    'name' => $penghuni->name
                ]);
        });
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'no_wa' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'religion' => 'nullable|string|max:50',
            'file_path_kk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_path_ktp' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'tanggal_daftar' => 'nullable|date',
            'status_penghuni' => 'required|in:penghuni,pra penghuni',
            'room_id' => 'nullable|exists:rooms,id',
        ]);

        return \DB::transaction(function () use ($request, $id) {
            $penghuni = Penghuni::findOrFail($id);
            $data = $request->only(['name', 'no_wa', 'address', 'religion', 'tanggal_daftar', 'status_penghuni']);

            if ($request->hasFile('file_path_kk')) {
                $data['file_path_kk'] = $request->file('file_path_kk')->store('kk', 'public');
            }

            if ($request->hasFile('file_path_ktp')) {
                $data['file_path_ktp'] = $request->file('file_path_ktp')->store('ktp', 'public');
            }

            $penghuni->update($data);

            if ($request->room_id) {
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
                        $urlKtp = $penghuni->file_path_ktp ? asset('storage/' . $penghuni->file_path_ktp) : null;
                        $urlKk = $penghuni->file_path_kk ? asset('storage/' . $penghuni->file_path_kk) : null;

                        if ($oldKosId) {
                            SyncMutasiPelaporanJob::dispatch(
                                $penghuni->user_id,
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
                            $penghuni->name,
                            $penghuni->no_wa,
                            $penghuni->religion,
                            $urlKtp,
                            $urlKk,
                            $newKosId,
                            'masuk',
                            $request->tanggal_daftar ?? now()->format('Y-m-d')
                        );
                    }
                }
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
            }

            if ($idKosKeluar) {
                SyncMutasiPelaporanJob::dispatch(
                    $penghuni->user_id,
                    $penghuni->name,
                    $penghuni->no_wa,
                    $penghuni->religion,
                    null,
                    null,
                    $idKosKeluar,
                    'keluar',
                    now()->format('Y-m-d')
                );
            }

            $tenancyIds = Penyewaan::where('penghuni_id', $id)->pluck('id');
            $invoiceIds = Invoice::whereIn('tenancy_id', $tenancyIds)->pluck('id');
            
            Payment::whereIn('invoice_id', $invoiceIds)->delete();
            Invoice::whereIn('tenancy_id', $tenancyIds)->delete();
            Penyewaan::where('penghuni_id', $id)->delete();

            $penghuni->delete();
            if ($user) {
                $user->delete();
            }

            return redirect()->back()->with('success', 'Penghuni & User account deleted successfully.');
        });
    }
}
