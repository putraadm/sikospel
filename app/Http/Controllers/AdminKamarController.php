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
            'description' => 'nullable|string|max:500',
        ]);

        $data = $request->all();

        $data = $request->all();

        $room = Room::create($data);

        if ($request->hasFile('images')) {
            $manager = new ImageManager(new Driver());
            foreach ($request->file('images') as $imgFile) {
                $imageName = time() . '_' . uniqid() . '.' . $imgFile->getClientOriginalExtension();
                $image = $manager->read($imgFile);
                
                if ($image->width() > 800) {
                    $image->scale(width: 800);
                }
                
                $path = 'room-images/' . $imageName;
                $encoded = $image->toJpeg(quality: 80); 
                Storage::disk('public')->put($path, (string) $encoded);

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
            'description' => 'nullable|string|max:500',
        ]);

        $room = Room::findOrFail($id);
        $data = $request->all();

        $room->update($data);

        if ($request->hasFile('images')) {
            $manager = new ImageManager(new Driver());
            foreach ($request->file('images') as $imgFile) {
                $imageName = time() . '_' . uniqid() . '.' . $imgFile->getClientOriginalExtension();
                $image = $manager->read($imgFile);
                
                if ($image->width() > 800) {
                    $image->scale(width: 800);
                }
                
                $path = 'room-images/' . $imageName;
                $encoded = $image->toJpeg(quality: 80); 
                Storage::disk('public')->put($path, (string) $encoded);

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
        
        if ($room->image) {
            Storage::disk('public')->delete($room->image);
        }

        $room->delete();

        return redirect()->back()->with('success', 'Kamar berhasil dihapus.');
    }

    public function deleteImage($id)
    {
        $image = RoomImage::findOrFail($id);
        Storage::disk('public')->delete($image->gambar);
        $image->delete();

        return redirect()->back()->with('success', 'Gambar berhasil dihapus.');
    }
}