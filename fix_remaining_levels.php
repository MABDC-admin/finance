<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Section;
use App\Models\Enrollment;
use App\Models\AcademicYear;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\DB;

$activeYear = AcademicYear::where('is_active', true)->firstOrFail();
$filePath = '/mnt/c/Users/DENNIS/Downloads/MABDC 2026-2027 (3).xlsx';

echo "Loading workbook to fix levels: {$filePath}...\n";
$spreadsheet = IOFactory::load($filePath);

$sheetsToProcess = [
    'L1', 'L2',
    'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12'
];

DB::transaction(function () use ($spreadsheet, $sheetsToProcess, $activeYear) {
    foreach ($sheetsToProcess as $sheetName) {
        $sheet = $spreadsheet->getSheetByName($sheetName);
        if (!$sheet) continue;

        $morningSection = Section::where('level', $sheetName)->where('session', 'morning')->where('academic_year_id', $activeYear->id)->first();
        $afternoonSection = Section::where('level', $sheetName)->where('session', 'afternoon')->where('academic_year_id', $activeYear->id)->first();

        $rows = $sheet->toArray(null, true, true, false);
        $currentSession = null;
        $updatedCount = 0;

        foreach ($rows as $row) {
            foreach ($row as $cellValue) {
                if ($cellValue === null) continue;
                $val = trim((string)$cellValue);
                if ($val === '') continue;

                if (stripos($val, 'MORNING') !== false) {
                    $currentSession = 'morning';
                    continue;
                }
                if (stripos($val, 'AFTERNOON') !== false) {
                    $currentSession = 'afternoon';
                    continue;
                }

                if ($currentSession !== null && strpos($val, ',') !== false) {
                    $targetSection = ($currentSession === 'morning') ? $morningSection : $afternoonSection;
                    
                    // Match student
                    $parts = explode(',', $val);
                    $lastName = trim($parts[0]);
                    $firstName = trim($parts[1] ?? '');
                    
                    $firstNameClean = preg_replace('/\s+/', ' ', $firstName);
                    $firstNameNoSpaces = str_replace(' ', '', $firstName);

                    // Find enrollment for this active year directly
                    $enrollment = Enrollment::query()
                        ->where('academic_year_id', $activeYear->id)
                        ->whereHas('learner', function($q) use ($lastName, $firstNameClean, $firstNameNoSpaces) {
                            $q->where('full_name', 'like', '%' . $lastName . '%')
                              ->where(function($query) use ($firstNameClean, $firstNameNoSpaces) {
                                  $query->where('full_name', 'like', '%' . $firstNameClean . '%')
                                        ->orWhere('full_name', 'like', '%' . $firstNameNoSpaces . '%')
                                        ->orWhere('full_name', 'like', '%' . mb_substr($firstNameClean, 0, 5, 'UTF-8') . '%');
                              });
                        })
                        ->first();

                    if ($enrollment) {
                        $enrollment->update([
                            'level' => $sheetName,
                            'section_id' => $targetSection ? $targetSection->id : null
                        ]);
                        $updatedCount++;
                    }
                }
            }
        }
        echo "Level [{$sheetName}]: Synced {$updatedCount} active enrollments.\n";
    }
});

// Final check on remaining L3-L12 level enrollments in the active year
$remaining = Enrollment::where('academic_year_id', $activeYear->id)
    ->whereIn('level', ['L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12'])
    ->get();

echo "\nRemaining active enrollments with L3-L12 levels: " . $remaining->count() . "\n";
foreach ($remaining as $r) {
    echo "ID: {$r->id} | Learner: {$r->learner->full_name} | Level: {$r->level}\n";
}
