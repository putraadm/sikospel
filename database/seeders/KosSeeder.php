<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kos;
use App\Models\User;
use Illuminate\Support\Str;

class KosSeeder extends Seeder
{
    public function run(): void
    {
        $pemilik = User::whereHas('role', fn($q) => $q->where('name', 'pemilik'))->first();

        if (!$pemilik) {
            return;
        }

        $kosData = [
            [
                'name' => 'Kos Permata',
                'description' => 'Kos nyaman di pusat kota.',
                'address' => 'Jl. Permata No. 10, Bandung',
                'gender_type' => 'campuran',
            ],
            [
                'name' => 'Kos Anggrek',
                'description' => 'Kos khusus putri dekat kampus.',
                'address' => 'Jl. Anggrek No. 5, Bandung',
                'gender_type' => 'putri',
            ],
            [
                'name' => 'Kos Melati',
                'description' => 'Kos khusus putra dengan fasilitas lengkap.',
                'address' => 'Jl. Melati No. 2, Bandung',
                'gender_type' => 'putra',
            ],
        ];

        foreach ($kosData as $data) {
            Kos::firstOrCreate(
                ['name' => $data['name'], 'owner_id' => $pemilik->id],
                [
                    'slug' => Str::slug($data['name']),
                    'address' => $data['address'],
                    'description' => $data['description'],
                    'gender_type' => $data['gender_type'],
                ]
            );
        }
    }
}
