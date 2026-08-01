<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

// Disable foreign key checks temporarily if needed, though truncating users might cascade or fail.
DB::statement('SET session_replication_role = \'replica\';');
User::truncate();
DB::statement('SET session_replication_role = \'origin\';');

User::create([
    'name' => 'Admin',
    'email' => 'admin@mabdc.org',
    'password' => Hash::make('Denskie123'),
    'role' => 'admin'
]);

User::create([
    'name' => 'Registrar',
    'email' => 'registrar@mabdc.org',
    'password' => Hash::make('Denskie123'),
    'role' => 'registrar'
]);

User::create([
    'name' => 'Finance',
    'email' => 'finance@mabdc.org',
    'password' => Hash::make('Denskie123'),
    'role' => 'finance'
]);

echo "Users reset successfully!\n";
