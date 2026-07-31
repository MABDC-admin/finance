<?php

namespace Tests\Feature\Registrar;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Models\AcademicYear;
use App\Models\DocumentRequirement;
use App\Models\Enrollment;
use App\Models\Learner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExportReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_learner_directory_export_respects_filters(): void
    {
        $user = User::factory()->create();
        $year = AcademicYear::query()->create([
            'name' => '2026-2027',
            'is_active' => true,
        ]);
        $this->createLearnerWithDocuments($year, [
            'lrn' => '109806170058',
            'full_name' => 'STA. CRUZ, DAHLIA THERESE S.',
            'normalized_name' => 'STA CRUZ DAHLIA THERESE S',
            'gender' => 'F',
            'mother_contact_number' => '052 564 1750',
            'father_contact_number' => '056 205 1322',
            'uae_address' => 'Abu Dhabi',
        ], 'L1');
        $this->createLearnerWithDocuments($year, [
            'lrn' => '411103250026',
            'full_name' => 'JEYASEELAN, SAMUEL ZANE D.',
            'normalized_name' => 'JEYASEELAN SAMUEL ZANE D',
            'gender' => 'M',
        ], 'G1');

        $response = $this->actingAs($user)
            ->get('/exports/learners?search=dahlia&level=L1&status=active')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $content = $response->streamedContent();
        $this->assertStringContainsString('Level,LRN,"Student Name"', $content);
        $this->assertStringContainsString('L1,109806170058,"STA. CRUZ, DAHLIA THERESE S."', $content);
        $this->assertStringNotContainsString('JEYASEELAN, SAMUEL ZANE D.', $content);
    }

    public function test_missing_documents_export_lists_non_ok_requirements(): void
    {
        $user = User::factory()->create();
        $year = AcademicYear::query()->create([
            'name' => '2026-2027',
            'is_active' => true,
        ]);
        $learner = $this->createLearnerWithDocuments($year, [
            'lrn' => '109806170058',
            'full_name' => 'STA. CRUZ, DAHLIA THERESE S.',
            'normalized_name' => 'STA CRUZ DAHLIA THERESE S',
            'mother_contact_number' => '052 564 1750',
            'father_contact_number' => '056 205 1322',
        ], 'L1');
        DocumentRequirement::query()
            ->whereHas('enrollment', fn ($query) => $query->where('learner_id', $learner->id))
            ->where('document_type', DocumentType::Passport->value)
            ->update(['status' => DocumentStatus::Missing->value, 'notes' => 'Need clear copy.']);

        $response = $this->actingAs($user)
            ->get('/exports/missing-documents?level=L1')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $content = $response->streamedContent();
        $this->assertStringContainsString('Level,LRN,"Student Name",Document,Status', $content);
        $this->assertStringContainsString('L1,109806170058,"STA. CRUZ, DAHLIA THERESE S.",Passport,missing', $content);
        $this->assertStringContainsString('"Need clear copy."', $content);
        $this->assertStringNotContainsString('Birth Certificate,ok', $content);
    }

    /**
     * @param  array<string, mixed>  $learnerAttributes
     */
    private function createLearnerWithDocuments(AcademicYear $year, array $learnerAttributes, string $level): Learner
    {
        $learner = Learner::query()->create($learnerAttributes);
        $enrollment = Enrollment::query()->create([
            'academic_year_id' => $year->id,
            'learner_id' => $learner->id,
            'level' => $level,
            'status' => 'active',
        ]);

        foreach (DocumentType::cases() as $documentType) {
            DocumentRequirement::query()->create([
                'enrollment_id' => $enrollment->id,
                'document_type' => $documentType->value,
                'status' => DocumentStatus::Ok->value,
            ]);
        }

        return $learner;
    }
}
