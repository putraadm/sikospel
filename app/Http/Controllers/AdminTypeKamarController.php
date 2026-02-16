<?php

namespace App\Http\Controllers;

use App\Models\TypeKamar;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminTypeKamarController extends Controller
{
    public function index()
    {
        $typeKamars = TypeKamar::all();
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
        ]);

        TypeKamar::create($request->all());

        return redirect()->back()->with('success', 'Tipe kamar berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric',
        ]);

        $typeKamar = TypeKamar::findOrFail($id);
        $typeKamar->update($request->all());

        return redirect()->back()->with('success', 'Tipe kamar berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $typeKamar = TypeKamar::findOrFail($id);
        $typeKamar->delete();

        return redirect()->back()->with('success', 'Tipe kamar berhasil dihapus.');
    }
}
