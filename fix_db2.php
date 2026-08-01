<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\DB;

DB::table('document_requirements')->whereIn('status', ['ok', 'pending_review', 'expired'])->delete();
echo "Bad documents deleted!\n";
