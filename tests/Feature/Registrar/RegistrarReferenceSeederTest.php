<?php

namespace Tests\Feature\Registrar;

use App\Enums\DocumentType;
use Database\Seeders\RegistrarReferenceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrarReferenceSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_school_year_is_seeded(): void
    {
        $this->seed(RegistrarReferenceSeeder::class);

        $this->assertDatabaseHas('academic_years', [
            'name' => '2026-2027',
            'is_active' => true,
        ]);
    }

    public function test_reference_document_types_are_available(): void
    {
        $this->assertSame([
            'school_credentials',
            'birth_certificate',
            'passport',
            'visa',
            'emirates_id',
        ], array_map(
            fn (DocumentType $type) => $type->value,
            DocumentType::cases(),
        ));
    }
}
