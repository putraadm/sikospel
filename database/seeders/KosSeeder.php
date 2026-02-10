<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kos;
use App\Models\Pemilik;

class KosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing pemilik
        $pemilik = Pemilik::all();

        if ($pemilik->isEmpty()) {
            // If no pemilik, create some
            $pemilik = collect([
                Pemilik::factory()->create(['name' => 'Pemilik 1', 'no_wa' => '081234567890', 'address' => 'Jl. Kos 1']),
                Pemilik::factory()->create(['name' => 'Pemilik 2', 'no_wa' => '081234567891', 'address' => 'Jl. Kos 2']),
            ]);
        }

        // Create kos for each pemilik
        foreach ($pemilik as $owner) {
            Kos::create([
                'owner_id' => $owner->user_id,
                'name' => 'Kos ' . $owner->name,
                'address' => 'Jl. Kos No. ' . rand(1, 100) . ', Kota Kos',
            ]);
        }
    }
}
