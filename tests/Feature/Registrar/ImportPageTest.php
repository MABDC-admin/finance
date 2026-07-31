<?php

namespace Tests\Feature\Registrar;

use App\Models\AcademicYear;
use App\Models\ImportBatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImportPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_registrar_can_open_import_page(): void
    {
        $user = User::factory()->create();
        $year = AcademicYear::query()->create([
            'name' => '2026-2027',
            'is_active' => true,
        ]);
        ImportBatch::query()->create([
            'academic_year_id' => $year->id,
            'user_id' => $user->id,
            'original_filename' => 'MABDC 2026-2027.xlsx',
            'file_checksum' => str_repeat('a', 64),
            'imported_rows' => 396,
            'skipped_rows' => 0,
            'warning_count' => 117,
            'warnings' => [
                ['row' => 60, 'code' => 'duplicate_lrn_conflict', 'message' => 'LRN already exists for a different learner identity.'],
            ],
            'status' => 'finished',
        ]);

        $this->actingAs($user)
            ->get('/imports')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Imports/Index')
                ->has('expectedColumns', 18)
                ->where('latestBatch.imported_rows', 396)
                ->where('latestBatch.warning_count', 117)
            );
    }
}
