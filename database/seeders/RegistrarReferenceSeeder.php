<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use Illuminate\Database\Seeder;

class RegistrarReferenceSeeder extends Seeder
{
    public function run(): void
    {
        AcademicYear::query()->update(['is_active' => false]);

        AcademicYear::query()->updateOrCreate(
            ['name' => '2026-2027'],
            [
                'starts_on' => '2026-08-01',
                'ends_on' => '2027-07-31',
                'is_active' => true,
            ],
        );
    }
}
