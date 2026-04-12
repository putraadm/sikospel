<?php

namespace App\Http\Controllers;

use App\Models\Kos;
use App\Models\Pemilik;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'gender_type' => 'required|in:putra,putri,campuran',
        ];

        if ($user->role->name === 'superadmin') {
            $rules['owner_id'] = 'required|exists:pemilik,user_id';
        }

        $request->validate($rules);

        $data = $request->except(['image', 'owner_id']);
        
        if ($user->role->name === 'superadmin') {
            $data['owner_id'] = $request->owner_id;
        } else {
            $pemilikData = Pemilik::where('user_id', $user->id)->first();
            if (!$pemilikData) {
                return redirect()->back()->with('error', 'Data pemilik tidak ditemukan.');
            }
            $data['owner_id'] = $pemilikData->user_id;
        }

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
            
            Storage::disk('public')->put($path, (string) $encoded);
            
            $data['image'] = $path;
        }

        $data['slug'] = Str::slug($data['name']);
        $kos = Kos::create($data);
        
        $pemilik = Pemilik::where('user_id', $kos->owner_id)->first();

        \App\Jobs\SyncKosPelaporanJob::dispatch(
            $kos->id,
            $kos->owner_id,
            $pemilik ? $pemilik->name : 'Tidak Diketahui',
            $pemilik ? $pemilik->no_wa : null,
            $kos->name,
            $kos->address
        );

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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'gender_type' => 'required|in:putra,putri,campuran',
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
                Storage::disk('public')->delete($kos->image);
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
            
            Storage::disk('public')->put($path, (string) $encoded);
            
            $data['image'] = $path;
        }

        $kos->update($data);
        
        $pemilik = Pemilik::where('user_id', $kos->owner_id)->first();

        \App\Jobs\SyncKosPelaporanJob::dispatch(
            $kos->id,
            $kos->owner_id,
            $pemilik ? $pemilik->name : 'Tidak Diketahui',
            $pemilik ? $pemilik->no_wa : null,
            $kos->name,
            $kos->address
        );

        return redirect()->back()->with('success', 'Kos berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $user = auth()->user();
        $kos = Kos::findOrFail($id);
        
        if ($user->role->name !== 'superadmin' && $kos->owner_id !== $user->id) {
             abort(403, 'Unauthorized action.');
        }

        \DB::transaction(function() use ($kos) {
            $kos->rooms()->delete();
            
            $kos->delete();
        });

        return redirect()->back()->with('success', 'Kos berhasil dihapus (Data diarsipkan).');
    }
}
