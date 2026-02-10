<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Penghuni;
use App\Models\User;

class PenghuniSeeder extends Seeder
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
                User::factory()->create(['username' => 'John Doe', 'email' => 'john@example.com']),
                User::factory()->create(['username' => 'Jane Smith', 'email' => 'jane@example.com']),
                User::factory()->create(['username' => 'Bob Johnson', 'email' => 'bob@example.com']),
            ]);
        }

        // Create penghuni for some users
        foreach ($users->take(3) as $user) {
            Penghuni::create([
                'user_id' => $user->id,
                'name' => $user->username,
                'no_wa' => '08123456789' . rand(10, 99),
                'address' => 'Jl. Contoh No. ' . rand(1, 100) . ', Kota Contoh',
                'religion' => ['Islam', 'Kristen', 'Hindu', 'Budha'][rand(0, 3)],
                'file_path_kk' => null, // No file for seeder
                'file_path_ktp' => null,
            ]);
        }
    }
}
