<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\DB;

DB::table('document_requirements')->where('status', 'ok')->update(['status' => 'verified']);
DB::table('document_requirements')->where('status', 'pending_review')->update(['status' => 'pending_verification']);
DB::table('document_requirements')->where('status', 'expired')->update(['status' => 'missing']);

echo "Database cleaned!\n";
