<?php

namespace App\Http\Controllers;

use App\Models\TypeKamar;
use App\Models\RoomImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Inertia\Inertia;

class AdminTypeKamarController extends Controller
{
    public function index()
    {
        $typeKamars = TypeKamar::with('images')->get();
        return Inertia::render('Admin/TypeKamar/Index', [
            'typeKamars' => $typeKamars
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $typeKamar = TypeKamar::create($request->except('images'));

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
                    'type_kamar_id' => $typeKamar->id,
                    'gambar' => $path,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Tipe kamar berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $typeKamar = TypeKamar::findOrFail($id);
        $typeKamar->update($request->except('images'));

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
                    'type_kamar_id' => $typeKamar->id,
                    'gambar' => $path,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Tipe kamar berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $typeKamar = TypeKamar::with('images')->findOrFail($id);
        
        // Delete images from storage
        foreach ($typeKamar->images as $image) {
            Storage::disk('public')->delete($image->gambar);
            $image->delete();
        }

        $typeKamar->delete();

        return redirect()->back()->with('success', 'Tipe kamar berhasil dihapus.');
    }

    public function deleteImage($id)
    {
        $image = RoomImage::findOrFail($id);
        Storage::disk('public')->delete($image->gambar);
        $image->delete();

        return redirect()->back()->with('success', 'Gambar berhasil dihapus.');
    }
}
