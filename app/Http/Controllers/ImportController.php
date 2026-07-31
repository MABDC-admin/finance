<?php

namespace App\Http\Controllers;

use App\Actions\Registrar\ImportMabdcWorkbook;
use App\Http\Requests\ImportWorkbookRequest;
use App\Models\AcademicYear;
use App\Models\ImportBatch;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ImportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Imports/Index', [
            'activeYear' => AcademicYear::query()
                ->where('is_active', true)
                ->first(['id', 'name']),
            'expectedColumns' => [
                'LEVEL',
                'LRN',
                'STUDENT NAME',
                'BIRTH DATE',
                'AGE',
                'GENDER',
                'MOTHER CONTACT #',
                'MOTHERS MAIDEN NAME',
                'FATHER CONTACT #',
                'FATHER',
                'PHIL. ADDRESS',
                'UAE ADDRESS',
                'PREVIOUS SCHOOL',
                'SCHOOL CREDENTIALS',
                'BIRTH CERT',
                'PASSPORT',
                'VISA',
                'EID',
            ],
            'latestBatch' => ImportBatch::query()
                ->latest()
                ->first([
                    'id',
                    'original_filename',
                    'source_sheet',
                    'total_rows',
                    'imported_rows',
                    'skipped_rows',
                    'warning_count',
                    'warnings',
                    'status',
                    'created_at',
                    'finished_at',
                ]),
        ]);
    }

    public function store(ImportWorkbookRequest $request, ImportMabdcWorkbook $importWorkbook): RedirectResponse
    {
        $path = $request->file('workbook')->store('imports');
        $academicYear = AcademicYear::query()->where('is_active', true)->firstOrFail();

        $batch = $importWorkbook->handle(
            storage_path('app/private/'.$path),
            $academicYear,
            $request->user(),
        );

        return redirect()
            ->back()
            ->with('status', "Imported {$batch->imported_rows} learner records.");
    }
}
