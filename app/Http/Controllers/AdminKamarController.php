<?php

namespace App\Http\Controllers;

use App\Models\Kos;
use App\Models\Room;
use App\Models\TypeKamar;
use App\Models\RoomImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Inertia\Inertia;

class AdminKamarController extends Controller
{
    public function index()
    {
        $rooms = Room::with(['kos.owner.user', 'typeKamar'])->get();
        $kos = Kos::with('owner.user')->get();
        $typeKamars = TypeKamar::all();
        
        return Inertia::render('Admin/Room/Index', [
            'rooms' => $rooms,
            'kos' => $kos,
            'typeKamars' => $typeKamars,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kos_id' => 'required|exists:kos,id',
            'room_number' => 'required|string|max:255',
            'type_kamar_id' => 'required|exists:type_kamars,id',
            'status' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $data = $request->all();

        Room::create($data);

        return redirect()->back()->with('success', 'Kamar berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'kos_id' => 'required|exists:kos,id',
            'room_number' => 'required|string|max:255',
            'type_kamar_id' => 'required|exists:type_kamars,id',
            'status' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $room = Room::findOrFail($id);
        $data = $request->all();

        $room->update($data);

        return redirect()->back()->with('success', 'Kamar berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $room = Room::findOrFail($id);
        
        $room->delete();

        return redirect()->back()->with('success', 'Kamar berhasil dihapus.');
    }
}