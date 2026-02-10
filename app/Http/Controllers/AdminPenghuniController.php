<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPenghuniController extends Controller
{
    public function index()
    {
        $penghuni = \App\Models\Penghuni::with('user')->get();
        $users = \App\Models\User::all();
        return Inertia::render('admin/penghuni', [
            'penghuni' => $penghuni,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id|unique:penghuni,user_id',
            'name' => 'required|string|max:255',
            'no_wa' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'religion' => 'nullable|string|max:50',
            'file_path_kk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_path_ktp' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $data = $request->only(['user_id', 'name', 'no_wa', 'address', 'religion']);

        if ($request->hasFile('file_path_kk')) {
            $data['file_path_kk'] = $request->file('file_path_kk')->store('kk', 'public');
        }

        if ($request->hasFile('file_path_ktp')) {
            $data['file_path_ktp'] = $request->file('file_path_ktp')->store('ktp', 'public');
        }

        \App\Models\Penghuni::create($data);

        return redirect()->back()->with('success', 'Penghuni created successfully.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id|unique:penghuni,user_id,' . $id . ',user_id',
            'name' => 'required|string|max:255',
            'no_wa' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'religion' => 'nullable|string|max:50',
            'file_path_kk' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'file_path_ktp' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $penghuni = \App\Models\Penghuni::findOrFail($id);
        $data = $request->only(['user_id', 'name', 'no_wa', 'address', 'religion']);

        if ($request->hasFile('file_path_kk')) {
            $data['file_path_kk'] = $request->file('file_path_kk')->store('kk', 'public');
        }

        if ($request->hasFile('file_path_ktp')) {
            $data['file_path_ktp'] = $request->file('file_path_ktp')->store('ktp', 'public');
        }

        $penghuni->update($data);

        return redirect()->back()->with('success', 'Penghuni updated successfully.');
    }

    public function destroy($id)
    {
        $penghuni = \App\Models\Penghuni::findOrFail($id);
        $penghuni->delete();
        return redirect()->back()->with('success', 'Penghuni deleted successfully.');
    }
}
