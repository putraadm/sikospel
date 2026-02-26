<?php

namespace App\Http\Controllers;

use App\Models\Kos;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicKosController extends Controller
{
    public function show($slug)
    {
        $kos = Kos::with(['owner.user', 'rooms.typeKamar.images'])
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('Public/Kos/Show', [
            'kos' => $kos,
            'typeKamars' => \App\Models\TypeKamar::with('images')->get(),
        ]);
    }
}
