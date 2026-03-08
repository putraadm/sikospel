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
        $user = auth()->user();
        $isSuperAdmin = $user->role->name === 'superadmin';

        $roomQuery = Room::with(['kos.owner.user', 'typeKamar']);
        $kosQuery = Kos::with('owner.user');
        $typeKamarQuery = TypeKamar::query();

        if (!$isSuperAdmin) {
            $roomQuery->whereHas('kos.owner', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            });
            $kosQuery->whereHas('owner', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            });
            $typeKamarQuery->where('user_id', $user->id);
        }

        return Inertia::render('Admin/Room/Index', [
            'rooms' => $roomQuery->get(),
            'kos' => $kosQuery->get(),
            'typeKamars' => $typeKamarQuery->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kos_id' => 'required|exists:kos,id',
            'room_number' => 'required|string|max:255',
            'type_kamar_id' => 'required|exists:type_kamars,id',
            'status' => 'required|string|max:255',
        ]);

        $data = $request->all();

        Room::create($data);

        return redirect()->back()->with('success', 'Kamar berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->role->name === 'superadmin';

        $request->validate([
            'kos_id' => 'required|exists:kos,id',
            'room_number' => 'required|string|max:255',
            'type_kamar_id' => 'required|exists:type_kamars,id',
            'status' => 'required|string|max:255',
        ]);

        $room = Room::where('id', $id);
        if (!$isSuperAdmin) {
            $room->whereHas('kos.owner', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            });
        }
        $room = $room->firstOrFail();
        $data = $request->all();

        $room->update($data);

        return redirect()->back()->with('success', 'Kamar berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->role->name === 'superadmin';

        $room = Room::where('id', $id);
        if (!$isSuperAdmin) {
            $room->whereHas('kos.owner', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            });
        }
        $room = $room->firstOrFail();
        
        $room->delete();

        return redirect()->back()->with('success', 'Kamar berhasil dihapus.');
    }
}