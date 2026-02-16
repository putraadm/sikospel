<?php

namespace Database\Seeders;

use App\Models\TypeKamar;
use Illuminate\Database\Seeder;

class TypeKamarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'nama' => 'Standard',
                'harga' => 500000,
                'deskripsi' => 'Kamar standar dengan fasilitas dasar.',
            ],
            [
                'nama' => 'Deluxe',
                'harga' => 800000,
                'deskripsi' => 'Kamar deluxe dengan AC dan kamar mandi dalam.',
            ],
            [
                'nama' => 'VIP',
                'harga' => 1200000,
                'deskripsi' => 'Kamar VIP dengan fasilitas lengkap dan balkon.',
            ],
            [
                'nama' => 'Suite',
                'harga' => 1500000,
                'deskripsi' => 'Kamar suite dengan ruang tamu kecil dan fasilitas premium.',
            ],
        ];

        foreach ($types as $type) {
            TypeKamar::create($type);
        }
    }
}
