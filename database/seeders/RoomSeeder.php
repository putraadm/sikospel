<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;
use App\Models\Kos;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing kos
        $kos = Kos::all();

        if ($kos->isEmpty()) {
            // If no kos, create some
            $kos = collect([
                Kos::factory()->create(['name' => 'Kos A', 'address' => 'Jl. Kos A']),
                Kos::factory()->create(['name' => 'Kos B', 'address' => 'Jl. Kos B']),
            ]);
        }

        // Create rooms for each kos
        foreach ($kos as $k) {
            for ($i = 1; $i <= 5; $i++) { // Create 5 rooms per kos
                Room::create([
                    'kos_id' => $k->id,
                    'room_number' => 'K' . $k->id . '-' . str_pad($i, 2, '0', STR_PAD_LEFT),
                    'monthly_rate' => rand(500000, 2000000),
                    'status' => ['tersedia', 'ditempati', 'perbaikan'][rand(0, 2)],
                    'description' => 'Kamar nyaman dengan fasilitas lengkap.',
                ]);
            }
        }
    }
}
