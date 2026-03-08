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
                'harga' => 800000,
                'deskripsi' => 'Kamar standar dengan fasilitas dasar meliputi tempat tidur, lemari, dan meja belajar.',
                'facilities' => ['Tempat Tidur', 'Lemari', 'Meja Belajar'],
            ],
            [
                'nama' => 'Deluxe',
                'harga' => 1500000,
                'deskripsi' => 'Kamar deluxe dengan AC, kamar mandi dalam, dan Wi-Fi.',
                'facilities' => ['AC', 'Kamar Mandi Dalam', 'Tempat Tidur', 'Lemari', 'Meja Belajar', 'Wi-Fi'],
            ],
            [
                'nama' => 'VIP',
                'harga' => 2500000,
                'deskripsi' => 'Kamar VIP dengan fasilitas lengkap, TV, kulkas, dan balkon.',
                'facilities' => ['AC', 'Kamar Mandi Dalam', 'Tempat Tidur', 'Lemari', 'Meja Belajar', 'Wi-Fi', 'TV', 'Kulkas', 'Balkon'],
            ],
            [
                'nama' => 'Suite',
                'harga' => 3500000,
                'deskripsi' => 'Kamar suite dengan ruang tamu kecil dan fasilitas premium.',
                'facilities' => ['AC', 'Kamar Mandi Dalam', 'Tempat Tidur King', 'Lemari Besar', 'Meja Belajar', 'Wi-Fi', 'Smart TV', 'Kulkas Duo', 'Sofa', 'Water Heater'],
            ],
        ];

        foreach ($types as $type) {
            TypeKamar::firstOrCreate(
                ['nama' => $type['nama']],
                $type
            );
        }
    }
}
