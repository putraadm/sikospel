<?php

namespace App\Http\Controllers;

use App\Models\Pemilik;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPemilikController extends Controller
{
    public function index()
    {
        $pemilik = Pemilik::with('user')->get();
        $users = User::all();

        return Inertia::render('admin/pemilik', [
            'pemilik' => $pemilik,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id|unique:pemilik,user_id',
            'name' => 'required|string|max:255',
            'no_wa' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        Pemilik::create($request->all());

        return redirect()->back()->with('success', 'Pemilik created successfully.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id|unique:pemilik,user_id,' . $id . ',user_id',
            'name' => 'required|string|max:255',
            'no_wa' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        $pemilik = Pemilik::findOrFail($id);
        $pemilik->update($request->all());

        return redirect()->back()->with('success', 'Pemilik updated successfully.');
    }

    public function destroy($id)
    {
        $pemilik = Pemilik::findOrFail($id);
        $pemilik->delete();
        return redirect()->back()->with('success', 'Pemilik deleted successfully.');
    }
}
