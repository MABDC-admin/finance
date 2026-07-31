<?php

namespace App\Imports;

use App\Actions\Registrar\ImportMabdcWorkbook;
use App\Models\AcademicYear;
use App\Models\ImportBatch;
use App\Models\User;

class MabdcWorkbookImport
{
    public function __construct(
        private readonly ImportMabdcWorkbook $importMabdcWorkbook,
    ) {}

    public function import(string $path, AcademicYear $academicYear, ?User $user = null): ImportBatch
    {
        return $this->importMabdcWorkbook->handle($path, $academicYear, $user);
    }
}
