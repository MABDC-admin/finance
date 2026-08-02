<?php
require '/root/registrar_system/vendor/autoload.php';
$app = require_once '/root/registrar_system/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Payment;
use App\Models\Receipt;

$payments = Payment::all();
echo "Total Payments: " . $payments->count() . "\n";
echo "Orphaned Payments (No Receipt):\n";
echo "ID | Student | Amount | Date\n";
echo str_repeat("-", 50) . "\n";

foreach ($payments as $p) {
    $receipt = Receipt::where('payment_id', $p->id)->first();
    if (!$receipt) {
        $studentName = optional(optional($p->enrollment)->learner)->full_name ?? 'Unknown';
        echo "{$p->id} | {$studentName} | {$p->amount} | {$p->created_at}\n";
    }
}
