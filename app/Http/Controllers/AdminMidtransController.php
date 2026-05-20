<?php

namespace App\Http\Controllers;

use App\Models\Kos;
use App\Models\Pemilik;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminMidtransController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        if ($user->role->name === 'superadmin') {
            $kos = Kos::with('owner.user')->get()->each->makeVisible('midtrans_server_key');
        } else {
            $pemilik = Pemilik::where('user_id', $user->id)->first();
            if (!$pemilik) {
                $kos = collect();
            } else {
                $kos = Kos::where('owner_id', $pemilik->user_id)
                    ->get()
                    ->each->makeVisible('midtrans_server_key');
            }
        }

        return Inertia::render('admin/Midtrans/Index', [
            'kos' => $kos,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $kos = Kos::findOrFail($id);

        if ($user->role->name !== 'superadmin' && $kos->owner_id !== $user->id) {
            abort(403);
        }

        $request->validate([
            'midtrans_server_key' => 'nullable|string|max:255',
            'midtrans_client_key' => 'nullable|string|max:255',
        ]);

        $kos->update($request->only('midtrans_server_key', 'midtrans_client_key'));

        return redirect()->back()->with('success', 'Pengaturan Midtrans berhasil diperbarui.');
    }
}
