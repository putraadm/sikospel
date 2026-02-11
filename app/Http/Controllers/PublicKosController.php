<?php

namespace App\Http\Controllers;

use App\Models\Kos;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicKosController extends Controller
{
    public function show($slug)
    {
        $kos = Kos::with(['owner.user', 'rooms'])
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('Public/Kos/Show', [
            'kos' => $kos,
        ]);
    }
}
