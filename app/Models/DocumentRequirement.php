<?php

namespace App\Models;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'document_type',
        'status',
        'verified_at',
        'expires_on',
        'notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'document_type' => DocumentType::class,
            'status' => DocumentStatus::class,
            'verified_at' => 'datetime',
            'expires_on' => 'date',
            'metadata' => 'array',
        ];
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }
}
