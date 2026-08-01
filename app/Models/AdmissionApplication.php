<?php

namespace App\Models;

use App\Enums\ApplicationClassification;
use App\Enums\ApplicationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class AdmissionApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'academic_year_id',
        'learner_id',
        'first_name',
        'last_name',
        'middle_name',
        'date_of_birth',
        'email',
        'contact_number',
        'level_applied_for',
        'classification',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'classification' => ApplicationClassification::class,
            'status' => ApplicationStatus::class,
            'metadata' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (AdmissionApplication $application) {
            if (empty($application->uuid)) {
                $application->uuid = (string) Str::uuid();
            }
        });
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function learner(): BelongsTo
    {
        return $this->belongsTo(Learner::class);
    }
    
    public function getFullNameAttribute(): string
    {
        $parts = array_filter([$this->first_name, $this->middle_name, $this->last_name]);
        return implode(' ', $parts);
    }
}
