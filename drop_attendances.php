<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

Schema::dropIfExists('attendances');
DB::table('migrations')->where('migration', 'like', '%create_attendances_table%')->delete();
echo "Table dropped and migrations cleared.\n";
