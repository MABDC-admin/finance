<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Sections with level '3':\n";
$secs = DB::table('sections')->where('level', '3')->get();
print_r($secs);

echo "\nEnrollments with level '3':\n";
$ens = DB::table('enrollments')->where('level', '3')->get();
print_r($ens);

echo "\nAll unique levels in sections:\n";
print_r(DB::table('sections')->distinct()->pluck('level')->toArray());

echo "\nAll unique levels in enrollments:\n";
print_r(DB::table('enrollments')->distinct()->pluck('level')->toArray());
