<?php

namespace App\Http\Controllers;

use App\Models\Kos;
use App\Models\Pemilik;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminKosController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        if ($user->role->name === 'superadmin') {
            $kos = Kos::with('owner.user')->get();
            $pemilik = Pemilik::with('user')->get();
        } else {
            $pemilikData = Pemilik::where('user_id', $user->id)->first();
            
            if (!$pemilikData) {
                 $kos = []; 
                 $pemilik = [];
            } else {
                $kos = Kos::where('owner_id', $pemilikData->user_id)->with('owner.user')->get();
                $pemilik = [$pemilikData];
            }
        }

        return Inertia::render('Admin/Kos/Index', [
            'kos' => $kos,
            'pemilik' => $pemilik,
            'userRole' => $user->role->name,
            'currentUserId' => $user->id, 
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        
        $rules = [
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'description' => 'required|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];

        if ($user->role->name === 'superadmin') {
            $rules['owner_id'] = 'required|exists:pemilik,user_id';
        }

        $request->validate($rules);

        $data = $request->except(['image', 'owner_id']);
        
        // Handle Owner ID
        if ($user->role->name === 'superadmin') {
            $data['owner_id'] = $request->owner_id;
        } else {
            $pemilikData = Pemilik::where('user_id', $user->id)->first();
            if (!$pemilikData) {
                return redirect()->back()->with('error', 'Data pemilik tidak ditemukan.');
            }
            $data['owner_id'] = $pemilikData->user_id;
        }

        // Handle Image Upload with Compression
        if ($request->hasFile('image')) {
            $imageStart = $request->file('image');
            $imageName = time() . '.' . $imageStart->getClientOriginalExtension();
            
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $image = $manager->read($imageStart);
            
            if ($image->width() > 1000) {
                $image->scale(width: 1000);
            }
            
            $path = 'kos-images/' . $imageName;
            
            $encoded = $image->toJpeg(quality: 80); 
            
            \Illuminate\Support\Facades\Storage::disk('public')->put($path, (string) $encoded);
            
            $data['image'] = $path;
        }

        $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
    Kos::create($data);

        return redirect()->back()->with('success', 'Kos berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $kos = Kos::findOrFail($id);

        if ($user->role->name !== 'superadmin' && $kos->owner_id !== $user->id) {
             abort(403, 'Unauthorized action.');
        }

        $rules = [
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];

        if ($user->role->name === 'superadmin') {
            $rules['owner_id'] = 'required|exists:pemilik,user_id';
        }

        $request->validate($rules);

        $data = $request->except(['image', 'owner_id']);

        if ($user->role->name === 'superadmin') {
            $data['owner_id'] = $request->owner_id;
        }

        if ($request->hasFile('image')) {
            if ($kos->image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($kos->image);
            }

            $imageStart = $request->file('image');
            $imageName = time() . '.' . $imageStart->getClientOriginalExtension();
            
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $image = $manager->read($imageStart);
            
            if ($image->width() > 1000) {
                $image->scale(width: 1000);
            }
            
            $path = 'kos-images/' . $imageName;
            $encoded = $image->toJpeg(quality: 80); 
            
            \Illuminate\Support\Facades\Storage::disk('public')->put($path, (string) $encoded);
            
            $data['image'] = $path;
        }

        $kos->update($data);

        return redirect()->back()->with('success', 'Kos berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $user = auth()->user();
        $kos = Kos::findOrFail($id);
        
        if ($user->role->name !== 'superadmin' && $kos->owner_id !== $user->id) {
             abort(403, 'Unauthorized action.');
        }

        $kos->delete();

        return redirect()->back()->with('success', 'Kos berhasil dihapus.');
    }
}
