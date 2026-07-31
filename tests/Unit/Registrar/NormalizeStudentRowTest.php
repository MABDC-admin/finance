<?php

namespace Tests\Unit\Registrar;

use App\Actions\Registrar\NormalizeStudentRow;
use App\Enums\DocumentStatus;
use PHPUnit\Framework\TestCase;

class NormalizeStudentRowTest extends TestCase
{
    public function test_level_is_carried_forward_when_blank(): void
    {
        $normalizer = new NormalizeStudentRow();

        $first = $normalizer->handle([
            'LEVEL' => 'L1',
            'STUDENT NAME' => 'YASAY, NATHANIEL',
        ], null);
        $second = $normalizer->handle([
            'LEVEL' => null,
            'STUDENT NAME' => 'BELGIRA, SIA',
        ], $first['level']);

        $this->assertSame('L1', $first['level']);
        $this->assertSame('L1', $second['level']);
    }

    public function test_headers_and_document_statuses_are_normalized(): void
    {
        $normalizer = new NormalizeStudentRow();

        $row = $normalizer->handle([
            ' UAE ADDRESS' => '  Abu Dhabi  ',
            'PREVIOUS SCHOOL ' => ' Old School ',
            'BIRTH CERT' => 'OK',
            'PASSPORT' => null,
            'VISA' => '',
            'EID' => ' ok ',
            'SCHOOL CREDENTIALS' => 'missing',
            'STUDENT NAME' => '  STA. CRUZ, DAHLIA  ',
        ], 'G1');

        $this->assertSame('Abu Dhabi', $row['uae_address']);
        $this->assertSame('Old School', $row['previous_school']);
        $this->assertSame(DocumentStatus::Ok->value, $row['documents']['birth_certificate']);
        $this->assertSame(DocumentStatus::Missing->value, $row['documents']['passport']);
        $this->assertSame(DocumentStatus::Missing->value, $row['documents']['visa']);
        $this->assertSame(DocumentStatus::Ok->value, $row['documents']['emirates_id']);
        $this->assertSame(DocumentStatus::Missing->value, $row['documents']['school_credentials']);
        $this->assertSame('STA. CRUZ, DAHLIA', $row['full_name']);
    }

    public function test_warnings_are_returned_for_blank_lrn_contacts_address_and_malformed_gender(): void
    {
        $normalizer = new NormalizeStudentRow();

        $row = $normalizer->handle([
            'LEVEL' => 'G3',
            'STUDENT NAME' => 'SAMPLE, LEARNER',
            'LRN' => '',
            'GENDER' => 'DISTRICT 3 CANSAGA CONSOLACION CEBU',
            'MOTHER CONTACT #' => '',
            'FATHER CONTACT #' => null,
            ' UAE ADDRESS' => '',
        ], null);

        $this->assertSame([
            'blank_lrn',
            'blank_mother_contact',
            'blank_father_contact',
            'blank_uae_address',
            'malformed_gender',
        ], $row['warnings']);
    }
}
