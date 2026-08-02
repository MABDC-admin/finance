<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Section;
use App\Models\Enrollment;

echo "Sections level search:\n";
$secs = Section::select('id', 'name', 'level')->get();
foreach ($secs as $s) {
    if ($s->level == '3' || $s->level == 'L3') {
        echo "Section ID: {$s->id} | Name: {$s->name} | Level: '{$s->level}'\n";
    }
}

echo "\nEnrollments level search:\n";
$ens = Enrollment::select('id', 'level')->get();
$counts = [];
foreach ($ens as $e) {
    if (!isset($counts[$e->level])) {
        $counts[$e->level] = 0;
    }
    $counts[$e->level]++;
}
print_r($counts);
