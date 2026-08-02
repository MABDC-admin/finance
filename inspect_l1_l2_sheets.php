<?php
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

$filePath = '/mnt/c/Users/DENNIS/Downloads/MABDC 2026-2027 (3).xlsx';
$spreadsheet = IOFactory::load($filePath);

foreach (['L1', 'L2'] as $sheetName) {
    echo "\n--- Sheet: {$sheetName} ---\n";
    $sheet = $spreadsheet->getSheetByName($sheetName);
    if (!$sheet) {
        echo "Missing sheet {$sheetName}\n";
        continue;
    }
    $rows = $sheet->toArray(null, true, true, false);
    $slice = array_slice($rows, 0, 10);
    foreach ($slice as $idx => $r) {
        $nonEmpty = array_filter($r, fn($v) => trim((string)$v) !== '');
        echo "[Row {$idx}]: " . implode(' | ', $nonEmpty) . "\n";
    }
}
