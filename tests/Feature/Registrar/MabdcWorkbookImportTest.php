<?php

namespace Tests\Feature\Registrar;

use App\Actions\Registrar\ImportMabdcWorkbook;
use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Models\AcademicYear;
use App\Models\DocumentRequirement;
use App\Models\Enrollment;
use App\Models\ImportBatch;
use App\Models\Learner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class MabdcWorkbookImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_mabdc_master_workbook_imports_learners_enrollments_and_documents(): void
    {
        $year = AcademicYear::query()->create([
            'name' => '2026-2027',
            'is_active' => true,
        ]);
        $workbookPath = $this->createWorkbookFixture([
            [
                'L1',
                '109806170058',
                'STA. CRUZ, DAHLIA THERESE S.',
                '2020-11-15',
                null,
                'F ',
                '052 564 1750',
                'Geralyn Soriano',
                '056 205 1322',
                'Julius Sta. Cruz',
                'Pangasinan',
                'Abu Dhabi',
                null,
                null,
                'OK',
                null,
                'OK',
                'OK',
            ],
            [
                null,
                null,
                'BELGIRA, SIA FAITH T.',
                '2022-01-31',
                null,
                'F',
                null,
                'Marie Cris Tabuyo',
                null,
                'Jasley Belgira',
                'Tarlac City',
                null,
                null,
                null,
                null,
                null,
                null,
                'OK',
            ],
        ]);

        $batch = app(ImportMabdcWorkbook::class)->handle($workbookPath, $year);

        $this->assertInstanceOf(ImportBatch::class, $batch);
        $this->assertSame('finished', $batch->status);
        $this->assertSame(2, $batch->imported_rows);
        $this->assertSame(0, $batch->skipped_rows);
        $this->assertSame(4, $batch->warning_count);
        $this->assertDatabaseCount('learners', 2);
        $this->assertDatabaseCount('enrollments', 2);
        $this->assertDatabaseCount('document_requirements', 10);
        $this->assertDatabaseHas('learners', [
            'lrn' => '109806170058',
            'full_name' => 'STA. CRUZ, DAHLIA THERESE S.',
            'gender' => 'F',
        ]);
        $this->assertDatabaseHas('learners', [
            'lrn' => null,
            'full_name' => 'BELGIRA, SIA FAITH T.',
            'uae_address' => null,
        ]);
        $this->assertTrue(Enrollment::query()->where('level', 'L1')->whereHas(
            'learner',
            fn ($query) => $query->where('full_name', 'BELGIRA, SIA FAITH T.')
        )->exists());
        $this->assertTrue(DocumentRequirement::query()->where([
            'document_type' => DocumentType::BirthCertificate->value,
            'status' => DocumentStatus::Ok->value,
        ])->exists());
        $this->assertContains('blank_lrn', collect($batch->warnings)->pluck('code')->all());
        $this->assertContains('blank_uae_address', collect($batch->warnings)->pluck('code')->all());
    }

    public function test_import_skips_blank_and_missing_name_rows(): void
    {
        $year = AcademicYear::query()->create([
            'name' => '2026-2027',
            'is_active' => true,
        ]);
        $workbookPath = $this->createWorkbookFixture([
            array_fill(0, 18, null),
            ['G1', '123', null, null, null, 'M'],
            ['G1', '456', 'VALID, LEARNER', null, null, 'M'],
        ]);

        $batch = app(ImportMabdcWorkbook::class)->handle($workbookPath, $year);

        $this->assertSame(1, $batch->imported_rows);
        $this->assertSame(1, $batch->skipped_rows);
        $this->assertDatabaseCount('learners', 1);
        $this->assertContains('blank_student_name', collect($batch->warnings)->pluck('code')->all());
    }

    public function test_duplicate_lrn_conflicts_are_preserved_as_separate_learners_with_warnings(): void
    {
        $year = AcademicYear::query()->create([
            'name' => '2026-2027',
            'is_active' => true,
        ]);
        $workbookPath = $this->createWorkbookFixture([
            ['G1', '411103250026', 'HERNANDEZ, ALEXA MARIE D.', '2020-07-16', null, 'F'],
            [null, '411103250026', 'JEYASEELAN, SAMUEL ZANE D.', '2019-11-14', null, 'M'],
        ]);

        $batch = app(ImportMabdcWorkbook::class)->handle($workbookPath, $year);

        $this->assertSame(2, $batch->imported_rows);
        $this->assertSame(2, Learner::query()->where('lrn', '411103250026')->count());
        $this->assertSame(2, Enrollment::query()->count());
        $this->assertContains('duplicate_lrn_conflict', collect($batch->warnings)->pluck('code')->all());
    }

    /**
     * @param  list<list<mixed>>  $rows
     */
    private function createWorkbookFixture(array $rows): string
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('MABDC 2026-2027');
        $sheet->fromArray([
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
            ' UAE ADDRESS',
            'PREVIOUS SCHOOL ',
            'SCHOOL CREDENTIALS',
            'BIRTH CERT',
            'PASSPORT',
            'VISA',
            'EID',
        ]);
        $sheet->fromArray($rows, null, 'A2');

        $path = tempnam(sys_get_temp_dir(), 'mabdc-import-').'.xlsx';
        (new Xlsx($spreadsheet))->save($path);

        return $path;
    }
}
