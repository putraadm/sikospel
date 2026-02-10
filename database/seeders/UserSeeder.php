<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superadminRole = Role::where('name', 'superadmin')->first();

        if ($superadminRole) {
            User::firstOrCreate(
                ['email' => 'superadmin@sikospel.com'],
                [
                    'username' => 'Superadmin',
                    'password' => Hash::make('superadmin'),
                    'role_id' => $superadminRole->id,
                ]
            );
        }
    }
}
