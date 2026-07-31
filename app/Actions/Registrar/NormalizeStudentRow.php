<?php

namespace App\Actions\Registrar;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use Carbon\CarbonImmutable;
use DateTimeInterface;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class NormalizeStudentRow
{
    /**
     * @param  array<string, mixed>  $row
     * @return array{
     *     level: ?string,
     *     lrn: ?string,
     *     full_name: ?string,
     *     normalized_name: ?string,
     *     birth_date: ?string,
     *     gender: ?string,
     *     mother_contact_number: ?string,
     *     mother_maiden_name: ?string,
     *     father_contact_number: ?string,
     *     father_name: ?string,
     *     philippine_address: ?string,
     *     uae_address: ?string,
     *     previous_school: ?string,
     *     documents: array<string, string>,
     *     warnings: list<string>
     * }
     */
    public function handle(array $row, ?string $previousLevel): array
    {
        $row = $this->normalizeKeys($row);
        $level = $this->cleanString($row['LEVEL'] ?? null) ?: $previousLevel;
        $fullName = $this->cleanString($row['STUDENT NAME'] ?? null);
        $lrn = $this->cleanString($row['LRN'] ?? null);
        $gender = $this->normalizeGender($row['GENDER'] ?? null);

        $normalized = [
            'level' => $level,
            'lrn' => $lrn,
            'full_name' => $fullName,
            'normalized_name' => $fullName ? $this->normalizeName($fullName) : null,
            'birth_date' => $this->normalizeDate($row['BIRTH DATE'] ?? null),
            'gender' => $gender,
            'mother_contact_number' => $this->cleanString($row['MOTHER CONTACT #'] ?? null),
            'mother_maiden_name' => $this->cleanString($row['MOTHERS MAIDEN NAME'] ?? null),
            'father_contact_number' => $this->cleanString($row['FATHER CONTACT #'] ?? null),
            'father_name' => $this->cleanString($row['FATHER'] ?? null),
            'philippine_address' => $this->cleanString($row['PHIL. ADDRESS'] ?? null),
            'uae_address' => $this->cleanString($row['UAE ADDRESS'] ?? null),
            'previous_school' => $this->cleanString($row['PREVIOUS SCHOOL'] ?? null),
            'documents' => [
                DocumentType::SchoolCredentials->value => $this->normalizeDocumentStatus($row['SCHOOL CREDENTIALS'] ?? null),
                DocumentType::BirthCertificate->value => $this->normalizeDocumentStatus($row['BIRTH CERT'] ?? null),
                DocumentType::Passport->value => $this->normalizeDocumentStatus($row['PASSPORT'] ?? null),
                DocumentType::Visa->value => $this->normalizeDocumentStatus($row['VISA'] ?? null),
                DocumentType::EmiratesId->value => $this->normalizeDocumentStatus($row['EID'] ?? null),
            ],
            'warnings' => [],
        ];

        foreach ([
            'blank_lrn' => 'lrn',
            'blank_mother_contact' => 'mother_contact_number',
            'blank_father_contact' => 'father_contact_number',
            'blank_uae_address' => 'uae_address',
        ] as $warning => $field) {
            if ($normalized[$field] === null) {
                $normalized['warnings'][] = $warning;
            }
        }

        if (($row['GENDER'] ?? null) !== null && $this->cleanString($row['GENDER']) !== null && $gender === null) {
            $normalized['warnings'][] = 'malformed_gender';
        }

        return $normalized;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>
     */
    private function normalizeKeys(array $row): array
    {
        $normalized = [];

        foreach ($row as $key => $value) {
            $normalized[strtoupper(trim((string) $key))] = $value;
        }

        return $normalized;
    }

    private function cleanString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof DateTimeInterface) {
            return $value->format('Y-m-d');
        }

        $cleaned = preg_replace('/\s+/', ' ', trim((string) $value));

        return $cleaned === '' ? null : $cleaned;
    }

    private function normalizeName(string $name): string
    {
        return strtoupper(preg_replace('/\s+/', ' ', trim($name)));
    }

    private function normalizeDate(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($value instanceof DateTimeInterface) {
            return CarbonImmutable::instance($value)->toDateString();
        }

        if (is_numeric($value)) {
            return CarbonImmutable::instance(ExcelDate::excelToDateTimeObject((float) $value))->toDateString();
        }

        $cleaned = $this->cleanString($value);

        return $cleaned ? CarbonImmutable::parse($cleaned)->toDateString() : null;
    }

    private function normalizeGender(mixed $value): ?string
    {
        $cleaned = $this->cleanString($value);

        return match ($cleaned ? strtoupper($cleaned) : null) {
            'M', 'MALE' => 'M',
            'F', 'FEMALE' => 'F',
            default => null,
        };
    }

    private function normalizeDocumentStatus(mixed $value): string
    {
        return strtoupper((string) $this->cleanString($value)) === 'OK'
            ? DocumentStatus::Ok->value
            : DocumentStatus::Missing->value;
    }
}
