<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_year_id',
        'learner_id',
        'section_id',
        'level',
        'status',
        'session',
        'enrolled_on',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'enrolled_on' => 'date',
            'metadata' => 'array',
        ];
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function learner(): BelongsTo
    {
        return $this->belongsTo(Learner::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function documentRequirements(): HasMany
    {
        return $this->hasMany(DocumentRequirement::class);
    }
}
