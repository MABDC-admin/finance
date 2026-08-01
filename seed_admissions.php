<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\AcademicYear;
use App\Models\AdmissionApplication;

$activeYear = AcademicYear::where('is_active', true)->first();
if (!$activeYear) {
    die("No active academic year found.\n");
}

$applicants = [
    ['Jane', 'Doe', 'A.', 'jane.doe@example.com', '+971501234567', 'application_started', 'Grade 1', 'new'],
    ['Mark', 'Smith', 'B.', 'mark.s@example.com', '+971509876543', 'for_document_review', 'Grade 5', 'transferee'],
    ['Emma', 'Johnson', 'C.', 'emma.j@example.com', '+971551122334', 'for_assessment', 'KG2', 'new'],
    ['Liam', 'Williams', 'D.', 'liam.w@example.com', '+971522233445', 'approved_for_enrollment', 'Grade 3', 'returning'],
    ['Olivia', 'Brown', 'E.', 'olivia.b@example.com', '+971566677889', 'inquiry', 'Grade 7', 'new'],
    ['Noah', 'Jones', 'F.', 'noah.j@example.com', '+971588899000', 'waitlisted', 'Grade 1', 'new'],
];

foreach ($applicants as $appData) {
    AdmissionApplication::create([
        'academic_year_id' => $activeYear->id,
        'first_name' => $appData[0],
        'last_name' => $appData[1],
        'middle_name' => $appData[2],
        'date_of_birth' => now()->subYears(rand(5, 12))->toDateString(),
        'email' => $appData[3],
        'contact_number' => $appData[4],
        'status' => $appData[5],
        'level_applied_for' => $appData[6],
        'classification' => $appData[7],
        'metadata' => [
            'program' => 'Regular',
        ]
    ]);
}

echo "Successfully seeded " . count($applicants) . " applicants!\n";
