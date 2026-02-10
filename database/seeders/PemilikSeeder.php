<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pemilik;
use App\Models\User;

class PemilikSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some existing users
        $users = User::all();

        if ($users->isEmpty()) {
            // If no users, create some
            $users = collect([
                User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']),
                User::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']),
                User::factory()->create(['name' => 'Bob Johnson', 'email' => 'bob@example.com']),
            ]);
        }

        // Create pemilik for some users (different from penghuni if possible)
        foreach ($users->take(2) as $user) {
            Pemilik::create([
                'user_id' => $user->id,
                'name' => $user->username,
                'no_wa' => '08123456789' . rand(10, 99),
                'address' => 'Jl. Pemilik No. ' . rand(1, 100) . ', Kota Pemilik',
            ]);
        }
    }
}
