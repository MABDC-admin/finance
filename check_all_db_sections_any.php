<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Section;

$sections = Section::all();
echo "All sections in DB:\n";
foreach ($sections as $s) {
    echo "ID: {$s->id} | Year ID: {$s->academic_year_id} | Level: {$s->level} | Name: {$s->name} | Session: {$s->session}\n";
}
