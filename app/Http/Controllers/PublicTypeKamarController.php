<?php

namespace App\Http\Controllers;

use App\Models\TypeKamar;
use App\Models\Kos;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicTypeKamarController extends Controller
{
    public function show(Request $request, $id)
    {
        $typeKamar = TypeKamar::with('images')->findOrFail($id);
        
        // Optional: find a Kos context if passed
        $kos = null;
        if ($request->has('kos')) {
            $kos = Kos::with('owner')->where('slug', $request->kos)->first();
        }

        return Inertia::render('Public/TypeKamar/Show', [
            'typeKamar' => $typeKamar,
            'kos' => $kos,
        ]);
    }
}
