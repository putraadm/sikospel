<?php

namespace App\Http\Controllers;

use App\Models\Pemilik;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPemilikController extends Controller
{
    public function index()
    {
        $pemilik = Pemilik::with('user')->get();
        $users = User::all();

        return Inertia::render('Admin/Pemilik/Index', [
            'pemilik' => $pemilik,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'no_wa' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        $username = strtolower(str_replace(' ', '', $request->name)) . rand(100, 999);
        $email = $username . '@sikospel.com';
        $password = bcrypt('password');

        $role = Role::where('name', 'pemilik')->first();

        $user = User::create([
            'username' => $username,
            'email' => $email,
            'password' => $password,
            'role_id' => $role ? $role->id : null,
        ]);

        Pemilik::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'no_wa' => $request->no_wa,
            'address' => $request->address,
        ]);

        return redirect()->back()->with('success', 'Pemilik created successfully. User account: ' . $username . ' / password');
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
