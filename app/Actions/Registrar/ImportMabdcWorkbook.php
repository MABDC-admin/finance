<?php

namespace App\Actions\Registrar;

use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\ImportBatch;
use App\Models\Learner;
use App\Models\User;
use Illuminate\Support\Arr;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportMabdcWorkbook
{
    public function __construct(
        private readonly NormalizeStudentRow $normalizeStudentRow,
    ) {}

    public function handle(
        string $path,
        AcademicYear $academicYear,
        ?User $user = null,
        string $sheetName = 'MABDC 2026-2027',
    ): ImportBatch {
        $batch = ImportBatch::query()->create([
            'academic_year_id' => $academicYear->id,
            'user_id' => $user?->id,
            'original_filename' => basename($path),
            'file_checksum' => hash_file('sha256', $path),
            'source_sheet' => $sheetName,
            'status' => 'running',
            'started_at' => now(),
            'warnings' => [],
        ]);

        $spreadsheet = IOFactory::load($path);
        $sheet = $spreadsheet->getSheetByName($sheetName);

        if ($sheet === null) {
            return $this->finishBatch($batch, 0, 0, [[
                'row' => null,
                'code' => 'missing_sheet',
                'message' => "Sheet [{$sheetName}] was not found.",
            ]], 'failed');
        }

        $rows = $sheet->toArray(null, true, true, false);
        $headers = array_map(
            fn (mixed $header): string => trim((string) $header),
            array_shift($rows) ?? [],
        );

        $previousLevel = null;
        $importedRows = 0;
        $skippedRows = 0;
        $warnings = [];
        $totalRows = 0;

        foreach ($rows as $offset => $values) {
            $excelRow = $offset + 2;

            if ($this->isBlankRow($values)) {
                continue;
            }

            $totalRows++;
            $rawRow = $this->combineRow($headers, $values);
            $normalized = $this->normalizeStudentRow->handle($rawRow, $previousLevel);
            $previousLevel = $normalized['level'];

            if ($normalized['full_name'] === null) {
                $skippedRows++;
                $warnings[] = [
                    'row' => $excelRow,
                    'code' => 'blank_student_name',
                    'message' => 'Row skipped because Student Name is blank.',
                ];

                continue;
            }

            foreach ($normalized['warnings'] as $warning) {
                $warnings[] = [
                    'row' => $excelRow,
                    'code' => $warning,
                    'message' => $this->warningMessage($warning),
                ];
            }

            $hasLrnConflict = $this->hasLrnConflict($normalized);

            if ($hasLrnConflict) {
                $warnings[] = [
                    'row' => $excelRow,
                    'code' => 'duplicate_lrn_conflict',
                    'message' => 'LRN already exists for a different learner identity.',
                ];
            }

            $learner = $this->upsertLearner($normalized, $hasLrnConflict);
            $enrollment = Enrollment::query()->updateOrCreate(
                [
                    'learner_id' => $learner->id,
                    'academic_year_id' => $academicYear->id,
                ],
                [
                    'level' => $normalized['level'],
                    'status' => 'active',
                    'metadata' => [
                        'source' => 'mabdc_workbook',
                        'source_row' => $excelRow,
                    ],
                ],
            );

            foreach ($normalized['documents'] as $documentType => $status) {
                $enrollment->documentRequirements()->updateOrCreate(
                    ['document_type' => $documentType],
                    ['status' => $status],
                );
            }

            $importedRows++;
        }

        return $this->finishBatch($batch, $importedRows, $skippedRows, $warnings, 'finished', $totalRows);
    }

    /**
     * @param  list<mixed>  $values
     */
    private function isBlankRow(array $values): bool
    {
        return collect($values)->every(fn (mixed $value): bool => trim((string) $value) === '');
    }

    /**
     * @param  list<string>  $headers
     * @param  list<mixed>  $values
     * @return array<string, mixed>
     */
    private function combineRow(array $headers, array $values): array
    {
        $row = [];

        foreach ($headers as $index => $header) {
            if ($header === '') {
                continue;
            }

            $row[$header] = $values[$index] ?? null;
        }

        return $row;
    }

    /**
     * @param  array<string, mixed>  $normalized
     */
    private function upsertLearner(array $normalized, bool $hasLrnConflict): Learner
    {
        $attributes = $hasLrnConflict ? [] : array_filter([
            'lrn' => $normalized['lrn'],
        ]);

        if ($attributes === []) {
            $attributes = [
                'normalized_name' => $normalized['normalized_name'],
                'birth_date' => $normalized['birth_date'],
            ];
        }

        return Learner::query()->updateOrCreate($attributes, [
            'lrn' => $normalized['lrn'],
            'full_name' => $normalized['full_name'],
            'normalized_name' => $normalized['normalized_name'],
            'birth_date' => $normalized['birth_date'],
            'gender' => $normalized['gender'],
            'mother_contact_number' => $normalized['mother_contact_number'],
            'mother_maiden_name' => $normalized['mother_maiden_name'],
            'father_contact_number' => $normalized['father_contact_number'],
            'father_name' => $normalized['father_name'],
            'philippine_address' => $normalized['philippine_address'],
            'uae_address' => $normalized['uae_address'],
            'previous_school' => $normalized['previous_school'],
            'metadata' => Arr::whereNotNull([
                'source' => 'mabdc_workbook',
            ]),
        ]);
    }

    /**
     * @param  array<string, mixed>  $normalized
     */
    private function hasLrnConflict(array $normalized): bool
    {
        if ($normalized['lrn'] === null) {
            return false;
        }

        return Learner::query()
            ->where('lrn', $normalized['lrn'])
            ->get(['normalized_name', 'birth_date'])
            ->contains(function (Learner $learner) use ($normalized): bool {
                return $learner->normalized_name !== $normalized['normalized_name']
                    || $learner->birth_date?->toDateString() !== $normalized['birth_date'];
            });
    }

    /**
     * @param  list<array{row: int|null, code: string, message: string}>  $warnings
     */
    private function finishBatch(
        ImportBatch $batch,
        int $importedRows,
        int $skippedRows,
        array $warnings,
        string $status,
        int $totalRows = 0,
    ): ImportBatch {
        $batch->update([
            'total_rows' => $totalRows,
            'imported_rows' => $importedRows,
            'skipped_rows' => $skippedRows,
            'warning_count' => count($warnings),
            'warnings' => $warnings,
            'status' => $status,
            'finished_at' => now(),
        ]);

        return $batch->refresh();
    }

    private function warningMessage(string $warning): string
    {
        return match ($warning) {
            'blank_lrn' => 'LRN is blank.',
            'blank_mother_contact' => 'Mother contact number is blank.',
            'blank_father_contact' => 'Father contact number is blank.',
            'blank_uae_address' => 'UAE address is blank.',
            'malformed_gender' => 'Gender is not M/F/Male/Female.',
            'duplicate_lrn_conflict' => 'LRN already exists for a different learner identity.',
            default => $warning,
        };
    }
}
