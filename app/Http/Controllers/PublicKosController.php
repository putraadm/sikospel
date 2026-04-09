<?php

namespace App\Http\Controllers;

use App\Models\Kos;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicKosController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        
        $query = Kos::with(['rooms' => function($q) {
            $q->select('id', 'kos_id', 'room_number', 'type_kamar_id', 'status')
              ->with('typeKamar');
        }]);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $kos = $query->get();

        return Inertia::render('Public/Kos/Index', [
            'kos' => $kos,
            'filters' => [
                'search' => $search
            ]
        ]);
    }

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
