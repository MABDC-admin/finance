<?php

namespace Tests\Feature\Registrar;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RegistrarSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_registrar_tables_exist(): void
    {
        foreach ([
            'academic_years',
            'learners',
            'sections',
            'enrollments',
            'document_requirements',
            'import_batches',
            'audit_events',
        ] as $table) {
            $this->assertTrue(Schema::hasTable($table), "{$table} table is missing");
        }
    }

    public function test_workbook_identifiers_are_stored_as_strings(): void
    {
        $this->assertTrue(Schema::hasColumn('learners', 'lrn'));
        $this->assertTrue(Schema::hasColumn('learners', 'mother_contact_number'));
        $this->assertTrue(Schema::hasColumn('learners', 'father_contact_number'));

        $columns = collect(Schema::getColumns('learners'))->keyBy('name');

        $this->assertSame('varchar', $columns['lrn']['type_name']);
        $this->assertSame('varchar', $columns['mother_contact_number']['type_name']);
        $this->assertSame('varchar', $columns['father_contact_number']['type_name']);
    }

    public function test_registrar_indexes_exist(): void
    {
        $learnerIndexes = collect(Schema::getIndexes('learners'));
        $enrollmentIndexes = collect(Schema::getIndexes('enrollments'));
        $documentIndexes = collect(Schema::getIndexes('document_requirements'));

        $this->assertTrue($learnerIndexes->contains(
            fn (array $index) => $index['columns'] === ['lrn']
        ));
        $this->assertTrue($enrollmentIndexes->contains(
            fn (array $index) => $index['unique'] === true && $index['columns'] === ['learner_id', 'academic_year_id']
        ));
        $this->assertTrue($documentIndexes->contains(
            fn (array $index) => $index['unique'] === true && $index['columns'] === ['enrollment_id', 'document_type']
        ));
    }
}
