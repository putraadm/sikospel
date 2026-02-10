<?php

namespace App\Http\Controllers;

use App\Models\Kos;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminKamarController extends Controller
{
    public function index()
    {
        $rooms = Room::with('kos.owner.user')->get();
        $kos = Kos::with('owner.user')->get();
        return Inertia::render('admin/room', [
            'rooms' => $rooms,
            'kos' => $kos,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kos_id' => 'required|exists:kos,id',
            'room_number' => 'required|string|max:255',
            'monthly_rate' => 'required|numeric',
            'status' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        Room::create($request->all());

        return redirect()->back()->with('success', 'Kamar berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'kos_id' => 'required|exists:kos,id',
            'room_number' => 'required|string|max:255',
            'monthly_rate' => 'required|numeric',
            'status' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $room = Room::findOrFail($id);
        $room->update($request->all());

        return redirect()->back()->with('success', 'Kamar berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $room = Room::findOrFail($id);
        $room->delete();

        return redirect()->back()->with('success', 'Kamar berhasil dihapus.');
    }
}
