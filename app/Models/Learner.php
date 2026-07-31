<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Learner extends Model
{
    use HasFactory;

    protected $fillable = [
        'lrn',
        'full_name',
        'normalized_name',
        'birth_date',
        'gender',
        'mother_contact_number',
        'mother_maiden_name',
        'father_contact_number',
        'father_name',
        'philippine_address',
        'uae_address',
        'previous_school',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'metadata' => 'array',
        ];
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }
}
