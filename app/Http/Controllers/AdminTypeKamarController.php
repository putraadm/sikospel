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
        $user = auth()->user();
        if ($user->role->name === 'superadmin') {
            $typeKamars = TypeKamar::with('images')->get();
        } else {
            $typeKamars = TypeKamar::with('images')->where('user_id', $user->id)->get();
        }
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
            'facilities' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048'
        ]);

        $typeKamar = auth()->user()->typeKamars()->create([
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi,
            'harga' => $request->harga,
            'facilities' => $request->facilities,
        ]);

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
            'facilities' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048'
        ]);

        $user = auth()->user();
        $query = TypeKamar::where('id', $id);
        if ($user->role->name !== 'superadmin') {
            $query->where('user_id', $user->id);
        }
        $typeKamar = $query->firstOrFail();
        
        $typeKamar->update([
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi,
            'harga' => $request->harga,
            'facilities' => $request->facilities,
        ]);

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
        $typeKamar = TypeKamar::with(['images', 'rooms'])->where('id', $id);
        if (auth()->user()->role->name !== 'superadmin') {
            $typeKamar->where('user_id', auth()->id());
        }
        $typeKamar = $typeKamar->firstOrFail();
        
        \DB::transaction(function() use ($typeKamar) {
             // Soft delete associated rooms
             $typeKamar->rooms()->delete();
             
             // Soft delete the type kamar
             $typeKamar->delete();
        });

        return redirect()->back()->with('success', 'Tipe kamar berhasil dihapus (Data diarsipkan).');
    }

    public function deleteImage($id)
    {
        $image = RoomImage::with('typeKamar')->findOrFail($id);
        
        // Ownership check
        if (auth()->user()->role->name !== 'superadmin' && $image->typeKamar->user_id !== auth()->id()) {
            abort(403);
        }

        Storage::disk('public')->delete($image->gambar);
        $image->delete();

        return redirect()->back()->with('success', 'Gambar berhasil dihapus.');
    }
}
