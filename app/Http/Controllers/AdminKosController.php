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
        $kos = Kos::with('owner.user')->get();
        $pemilik = Pemilik::with('user')->get();
        return Inertia::render('admin/kos', [
            'kos' => $kos,
            'pemilik' => $pemilik,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'owner_id' => 'required|exists:pemilik,user_id',
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
        ]);

        Kos::create($request->all());

        return redirect()->back()->with('success', 'Kos berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'owner_id' => 'required|exists:pemilik,user_id',
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
        ]);

        $kos = Kos::findOrFail($id);
        $kos->update($request->all());

        return redirect()->back()->with('success', 'Kos berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $kos = Kos::findOrFail($id);
        $kos->delete();

        return redirect()->back()->with('success', 'Kos berhasil dihapus.');
    }
}
