<?php
require '/root/registrar_system/vendor/autoload.php';
$app = require_once '/root/registrar_system/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Receipt;

$receipts = Receipt::orderBy('id')->get();
echo "ID | Payment ID | Receipt Number | Issued Date\n";
echo str_repeat("-", 50) . "\n";
foreach ($receipts as $r) {
    echo "{$r->id} | {$r->payment_id} | {$r->receipt_number} | {$r->issued_date}\n";
}
