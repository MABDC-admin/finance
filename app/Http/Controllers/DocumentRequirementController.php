<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Models\AuditEvent;
use App\Models\DocumentRequirement;
use App\Models\Learner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DocumentRequirementController extends Controller
{
    public function update(Request $request, Learner $learner, DocumentRequirement $documentRequirement): RedirectResponse
    {
        abort_unless($documentRequirement->enrollment()->where('learner_id', $learner->id)->exists(), 404);

        $validated = $request->validate([
            'status' => ['required', Rule::enum(DocumentStatus::class)],
            'expires_on' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);
        $before = $this->snapshot($documentRequirement);

        $documentRequirement->update([
            'status' => $validated['status'],
            'expires_on' => $validated['expires_on'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);
        $documentRequirement->refresh();

        AuditEvent::query()->create([
            'actor_id' => $request->user()?->id,
            'event_type' => 'document_requirement.updated',
            'subject_type' => DocumentRequirement::class,
            'subject_id' => $documentRequirement->id,
            'before' => $before,
            'after' => $this->snapshot($documentRequirement),
            'metadata' => [
                'learner_id' => $learner->id,
                'enrollment_id' => $documentRequirement->enrollment_id,
            ],
        ]);

        return redirect()->route('learners.show', $learner);
    }

    /**
     * @return array<string, mixed>
     */
    private function snapshot(DocumentRequirement $documentRequirement): array
    {
        return [
            'document_type' => $documentRequirement->document_type->value,
            'status' => $documentRequirement->status->value,
            'expires_on' => $documentRequirement->expires_on?->toDateString(),
            'notes' => $documentRequirement->notes,
        ];
    }
}
