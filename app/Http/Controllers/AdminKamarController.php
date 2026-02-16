<?php

namespace App\Http\Controllers;

use App\Models\Kos;
use App\Models\Room;
use App\Models\TypeKamar;
use App\Models\RoomImage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AdminKamarController extends Controller
{
    public function index()
    {
        $rooms = Room::with(['kos.owner.user', 'typeKamar', 'images'])->get();
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
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $room = Room::create([
            'kos_id' => $request->kos_id,
            'room_number' => $request->room_number,
            'type_kamar_id' => $request->type_kamar_id,
            'status' => $request->status,
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('rooms', 'public');
                RoomImage::create([
                    'room_id' => $room->id,
                    'gambar' => $path,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Kamar berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'kos_id' => 'required|exists:kos,id',
            'room_number' => 'required|string|max:255',
            'type_kamar_id' => 'required|exists:type_kamars,id',
            'status' => 'required|string|max:255',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $room = Room::findOrFail($id);
        $room->update([
            'kos_id' => $request->kos_id,
            'room_number' => $request->room_number,
            'type_kamar_id' => $request->type_kamar_id,
            'status' => $request->status,
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('rooms', 'public');
                RoomImage::create([
                    'room_id' => $room->id,
                    'gambar' => $path,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Kamar berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $room = Room::findOrFail($id);
        
        // Delete images from storage
        foreach ($room->images as $image) {
            Storage::disk('public')->delete($image->gambar);
            $image->delete();
        }
        
        $room->delete();

        return redirect()->back()->with('success', 'Kamar berhasil dihapus.');
    }
}
