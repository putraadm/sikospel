<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Penghuni;
use App\Models\User;

class AdminPenghuniController extends Controller
{
    public function index()
    {
        $penghuni = Penghuni::with(['user', 'currentRoom.typeKamar', 'currentRoom.kos'])->get();
        $rooms = \App\Models\Room::with(['typeKamar', 'kos'])->get();
        $typeKamars = \App\Models\TypeKamar::all();
        $kos = \App\Models\Kos::all();
        return Inertia::render('Admin/Penghuni/Index', [
            'penghuni' => $penghuni,
            'rooms' => $rooms,
            'typeKamars' => $typeKamars,
            'kos' => $kos,
        ]);
    }

    public function create()
    {
        $rooms = \App\Models\Room::with(['typeKamar', 'kos'])->get();
        $typeKamars = \App\Models\TypeKamar::all();
        $kos = \App\Models\Kos::all();
        return Inertia::render('Admin/Penghuni/Create', [
            'rooms' => $rooms,
            'typeKamars' => $typeKamars,
            'kos' => $kos,
        ]);
    }

    public function edit($id)
    {
        $penghuni = Penghuni::with(['user', 'currentRoom.typeKamar', 'currentRoom.kos'])->findOrFail($id);
        $rooms = \App\Models\Room::with(['typeKamar', 'kos'])->get();
        $typeKamars = \App\Models\TypeKamar::all();
        $kos = \App\Models\Kos::all();
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
            // Create User Account
            $user = \App\Models\User::create([
                'username' => $request->username,
                'email' => $request->username . '@sikospel.com', // Auto-generated email
                'password' => bcrypt($password),
                'role_id' => 4, // Role Penghuni
            ]);

            $data = $request->only(['name', 'no_wa', 'address', 'religion', 'tanggal_daftar', 'status_penghuni']);
            $data['user_id'] = $user->id;

            if ($request->hasFile('file_path_kk')) {
                $data['file_path_kk'] = $request->file('file_path_kk')->store('kk', 'public');
            }

            if ($request->hasFile('file_path_ktp')) {
                $data['file_path_ktp'] = $request->file('file_path_ktp')->store('ktp', 'public');
            }

            $penghuni = \App\Models\Penghuni::create($data);

            if ($request->room_id) {
                $penyewaan = \App\Models\Penyewaan::create([
                    'penghuni_id' => $penghuni->user_id,
                    'room_id' => $request->room_id,
                    'start_date' => $request->tanggal_daftar ?? now(),
                    'status' => 'aktif',
                ]);

                $room = \App\Models\Room::find($request->room_id);
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
                        $amount = $dailyRate * 30; // Monthly rate
                    } else {
                        // Calculate remaining days in the month for pra-penghuni
                        $remainingDays = $start->daysInMonth - $start->day + 1;
                        $amount = $dailyRate * $remainingDays;
                    }
                    
                    \App\Models\Invoice::create([
                        'tenancy_id' => $penyewaan->id,
                        'amount' => $amount,
                        'due_date' => $period->copy()->addDays(9),
                        'billing_period' => $period,
                        'status' => 'belum_dibayar',
                    ]);
                }
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
            'user_id' => 'required|exists:users,id|unique:penghuni,user_id,' . $id . ',user_id',
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

        $penghuni = \App\Models\Penghuni::findOrFail($id);
        $data = $request->only(['user_id', 'name', 'no_wa', 'address', 'religion', 'tanggal_daftar', 'status_penghuni']);

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
                // Mark old room as available if it exists
                if ($currentPenyewaan) {
                    $oldRoom = \App\Models\Room::find($currentPenyewaan->room_id);
                    if ($oldRoom) {
                        $oldRoom->update(['status' => 'tersedia']);
                    }
                    $currentPenyewaan->update(['status' => 'selesai', 'end_date' => now()]);
                }

                // Create new tenancy
                \App\Models\Penyewaan::create([
                    'penghuni_id' => $penghuni->user_id,
                    'room_id' => $request->room_id,
                    'start_date' => $request->tanggal_daftar ?? now(),
                    'status' => 'aktif',
                ]);

                // Mark new room as occupied
                $newRoom = \App\Models\Room::find($request->room_id);
                if ($newRoom) {
                    $newRoom->update(['status' => 'ditempati']);
                }
            }
        }

        return redirect()->route('penghuni.index')->with('success', 'Penghuni updated successfully.');
    }

    public function destroy($id)
    {
        return \DB::transaction(function () use ($id) {
            $penghuni = \App\Models\Penghuni::findOrFail($id);
            $user = $penghuni->user;
            
            // 1. Release room if currently occupied
            $currentPenyewaan = $penghuni->currentPenyewaan;
            if ($currentPenyewaan) {
                $room = \App\Models\Room::find($currentPenyewaan->room_id);
                if ($room) {
                    $room->update(['status' => 'tersedia']);
                }
            }

            // 2. Clean up related data that might not have cascade delete
            $tenancyIds = \App\Models\Penyewaan::where('penghuni_id', $id)->pluck('id');
            $invoiceIds = \App\Models\Invoice::whereIn('tenancy_id', $tenancyIds)->pluck('id');
            
            \App\Models\Payment::whereIn('invoice_id', $invoiceIds)->delete();
            \App\Models\Invoice::whereIn('tenancy_id', $tenancyIds)->delete();
            \App\Models\Penyewaan::where('penghuni_id', $id)->delete();

            // 3. Delete the resident record and user account
            $penghuni->delete();
            if ($user) {
                $user->delete();
            }

            return redirect()->back()->with('success', 'Penghuni & User account deleted successfully.');
        });
    }
}
