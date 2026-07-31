<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InitialAdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('registrar.initial_admin.email');
        $password = config('registrar.initial_admin.password');

        if (! $email || ! $password) {
            return;
        }

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => config('registrar.initial_admin.name', 'MABDC Admin'),
                'password' => Hash::make($password),
                'role' => 'admin',
            ],
        );
    }
}
