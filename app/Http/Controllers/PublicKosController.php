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

        $typeKamars = \App\Models\TypeKamar::whereHas('rooms', function($q) use ($kos) {
            $q->where('kos_id', $kos->id);
        })->with('images')->get();

        return Inertia::render('Public/Kos/Show', [
            'kos' => $kos,
            'typeKamars' => $typeKamars,
        ]);
    }
}
