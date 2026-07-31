<?php

namespace App\Http\Controllers;

use App\Actions\Registrar\ImportMabdcWorkbook;
use App\Http\Requests\ImportWorkbookRequest;
use App\Models\AcademicYear;
use Illuminate\Http\RedirectResponse;

class ImportController extends Controller
{
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
