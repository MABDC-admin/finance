<?php
require __DIR__."/vendor/autoload.php";
$app = require_once __DIR__."/bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

$teacherRole = Role::firstOrCreate(["name" => "teacher"]);
$registrarRole = Role::firstOrCreate(["name" => "registrar"]);
$adminRole = Role::firstOrCreate(["name" => "admin"]);

$teacher = User::firstOrCreate(
    ["email" => "teacher@mabdc.test"],
    ["name" => "Demo Teacher", "password" => Hash::make("password"), "role" => "teacher"]
);
$teacher->assignRole($teacherRole);

$registrar = User::firstOrCreate(
    ["email" => "registrar@mabdc.test"],
    ["name" => "Demo Registrar", "password" => Hash::make("password"), "role" => "registrar"]
);
$registrar->assignRole($registrarRole);

$admin = User::where("email", "admin@mabdc.test")->first();
if ($admin) {
    $admin->assignRole($adminRole);
}
echo "Done\n";

