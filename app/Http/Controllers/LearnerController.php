<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Models\AuditEvent;
use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\Learner;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearnerController extends Controller
{
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::query()
            ->where('is_active', true)
            ->first(['id', 'name']);
        $filters = [
            'search' => trim((string) $request->query('search', '')),
            'level' => trim((string) $request->query('level', '')),
            'status' => trim((string) $request->query('status', '')),
        ];

        $learners = Learner::query()
            ->with(['enrollments' => function ($query) use ($activeYear) {
                $query
                    ->when($activeYear, fn ($query) => $query->where('academic_year_id', $activeYear->id))
                    ->with(['academicYear:id,name', 'documentRequirements']);
            }])
            ->when($filters['search'] !== '', function (Builder $query) use ($filters) {
                $search = $filters['search'];
                $normalizedSearch = preg_replace('/[^A-Z0-9]+/', ' ', strtoupper($search));

                $query->where(function (Builder $query) use ($search, $normalizedSearch) {
                    if (is_numeric(str_replace([' ', '-'], '', $search))) {
                        $query->where('lrn', 'like', "{$search}%");
                    } else {
                        $query->where('normalized_name', 'like', "{$normalizedSearch}%")
                            ->orWhere('full_name', 'like', "%{$search}%")
                            ->orWhere('normalized_name', 'like', "%{$normalizedSearch}%");
                    }
                });
            })
            ->when($filters['level'] !== '', function (Builder $query) use ($activeYear, $filters) {
                $query->whereHas('enrollments', fn (Builder $query) => $query
                    ->when($activeYear, fn ($query) => $query->where('academic_year_id', $activeYear->id))
                    ->where('level', $filters['level']));
            })
            ->when($filters['status'] !== '', function (Builder $query) use ($activeYear, $filters) {
                $query->whereHas('enrollments', fn (Builder $query) => $query
                    ->when($activeYear, fn ($query) => $query->where('academic_year_id', $activeYear->id))
                    ->where('status', $filters['status']));
            })
            ->orderBy('full_name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Learner $learner) => $this->learnerPayload($learner));

        return Inertia::render('Learners/Index', [
            'activeYear' => $activeYear,
            'filters' => $filters,
            'learners' => $learners,
            'levels' => $this->levelOptions($activeYear),
            'statuses' => $this->statusOptions($activeYear),
        ]);
    }

    public function show(Learner $learner): Response
    {
        $activeYear = AcademicYear::query()
            ->where('is_active', true)
            ->first(['id', 'name']);

        $learner->load(['enrollments' => function ($query) use ($activeYear) {
            $query
                ->when($activeYear, fn ($query) => $query->where('academic_year_id', $activeYear->id))
                ->with(['academicYear:id,name', 'documentRequirements']);
        }]);

        return Inertia::render('Learners/Show', [
            'activeYear' => $activeYear,
            'learner' => $this->learnerPayload($learner, true),
        ]);
    }

    public function edit(Learner $learner): Response
    {
        $activeYear = AcademicYear::query()
            ->where('is_active', true)
            ->first(['id', 'name']);

        $learner->load(['enrollments' => function ($query) use ($activeYear) {
            $query
                ->when($activeYear, fn ($query) => $query->where('academic_year_id', $activeYear->id))
                ->with(['academicYear:id,name', 'documentRequirements']);
        }]);

        return Inertia::render('Learners/Edit', [
            'activeYear' => $activeYear,
            'learner' => $this->learnerPayload($learner),
        ]);
    }

    public function update(Request $request, Learner $learner): RedirectResponse
    {
        $validated = $request->validate([
            'lrn' => ['nullable', 'string', 'max:64'],
            'full_name' => ['required', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:32'],
            'mother_maiden_name' => ['nullable', 'string', 'max:255'],
            'mother_contact_number' => ['nullable', 'string', 'max:255'],
            'mother_email' => ['nullable', 'email', 'max:255'],
            'father_name' => ['nullable', 'string', 'max:255'],
            'father_contact_number' => ['nullable', 'string', 'max:255'],
            'father_email' => ['nullable', 'email', 'max:255'],
            'philippine_address' => ['nullable', 'string', 'max:2000'],
            'uae_address' => ['nullable', 'string', 'max:2000'],
            'previous_school' => ['nullable', 'string', 'max:255'],
            'metadata' => ['nullable', 'array'],
        ]);
        $before = $this->learnerSnapshot($learner);

        $metadata = array_merge($learner->metadata ?? [], $validated['metadata'] ?? []);
        unset($validated['metadata']);

        $learner->update(array_merge($validated, [
            'normalized_name' => $this->normalizeName($validated['full_name']),
            'metadata' => $metadata,
        ]));
        $learner->refresh();

        AuditEvent::query()->create([
            'actor_id' => $request->user()?->id,
            'event_type' => 'learner.updated',
            'subject_type' => Learner::class,
            'subject_id' => $learner->id,
            'before' => $before,
            'after' => $this->learnerSnapshot($learner),
        ]);

        return redirect()->route('learners.show', $learner);
    }

    public function disable(Request $request, Learner $learner): RedirectResponse
    {
        $activeYear = AcademicYear::query()
            ->where('is_active', true)
            ->first(['id', 'name']);
        $enrollment = $learner->enrollments()
            ->when($activeYear, fn ($query) => $query->where('academic_year_id', $activeYear->id))
            ->latest('id')
            ->firstOrFail();
        $before = $this->enrollmentSnapshot($enrollment);
        $metadata = $enrollment->metadata ?? [];

        $enrollment->update([
            'status' => 'disabled',
            'metadata' => array_merge($metadata, [
                'disabled_at' => now()->toDateTimeString(),
                'disabled_by' => $request->user()?->id,
            ]),
        ]);
        $enrollment->refresh();

        AuditEvent::query()->create([
            'actor_id' => $request->user()?->id,
            'event_type' => 'learner.disabled',
            'subject_type' => Enrollment::class,
            'subject_id' => $enrollment->id,
            'before' => $before,
            'after' => $this->enrollmentSnapshot($enrollment),
            'metadata' => [
                'learner_id' => $learner->id,
                'academic_year_id' => $enrollment->academic_year_id,
            ],
        ]);

        return redirect()->route('learners.index');
    }

    public function destroy(Request $request, Learner $learner): RedirectResponse
    {
        $before = $this->learnerSnapshot($learner);
        $learnerId = $learner->id;

        $learner->delete();

        AuditEvent::query()->create([
            'actor_id' => $request->user()?->id,
            'event_type' => 'learner.deleted',
            'subject_type' => Learner::class,
            'subject_id' => $learnerId,
            'before' => $before,
        ]);

        return redirect()->route('learners.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function learnerPayload(Learner $learner, bool $includeProfile = false): array
    {
        $enrollment = $learner->enrollments->first();
        $documentRequirements = $enrollment?->documentRequirements ?? collect();
        $summary = [
            'ok' => $documentRequirements->whereIn('status', [DocumentStatus::Verified, DocumentStatus::Ok])->count(),
            'missing' => $documentRequirements->where('status', DocumentStatus::Missing)->count(),
            'pending_review' => $documentRequirements->whereIn('status', [DocumentStatus::PendingVerification, DocumentStatus::PendingReview, DocumentStatus::Submitted])->count(),
            'total' => $documentRequirements->where('status', '!=', DocumentStatus::NotApplicable)->count(),
        ];

        $payload = [
            'id' => $learner->id,
            'lrn' => $learner->lrn,
            'full_name' => $learner->full_name,
            'birth_date' => $learner->birth_date?->toDateString(),
            'gender' => $learner->gender,
            'mother_maiden_name' => $learner->mother_maiden_name,
            'mother_contact_number' => $learner->mother_contact_number,
            'mother_email' => $learner->mother_email,
            'father_name' => $learner->father_name,
            'father_contact_number' => $learner->father_contact_number,
            'father_email' => $learner->father_email,
            'uae_address' => $learner->uae_address,
            'philippine_address' => $learner->philippine_address,
            'previous_school' => $learner->previous_school,
            'current_enrollment' => $enrollment ? [
                'id' => $enrollment->id,
                'level' => $enrollment->level,
                'status' => $enrollment->status,
                'academic_year' => $enrollment->academicYear?->name,
            ] : null,
            'document_summary' => $summary,
        ];

        if (! $includeProfile) {
            return $payload;
        }

        return array_merge($payload, [
            'mother_maiden_name' => $learner->mother_maiden_name,
            'mother_email' => $learner->mother_email,
            'father_name' => $learner->father_name,
            'father_email' => $learner->father_email,
            'philippine_address' => $learner->philippine_address,
            'previous_school' => $learner->previous_school,
            'metadata' => $learner->metadata ?? [],
            'document_requirements' => $documentRequirements
                ->sortBy(fn ($requirement) => array_search($requirement->document_type, DocumentType::cases(), true))
                ->values()
                ->map(fn ($requirement) => [
                    'id' => $requirement->id,
                    'document_type' => $requirement->document_type->value,
                    'label' => $requirement->document_type->label(),
                    'status' => $requirement->status->value,
                    'verified_at' => $requirement->verified_at?->toDateTimeString(),
                    'expires_on' => $requirement->expires_on?->toDateString(),
                    'notes' => $requirement->notes,
                ]),
        ]);
    }

    /**
     * @return list<string>
     */
    private function levelOptions(?AcademicYear $activeYear): array
    {
        return Enrollment::query()
            ->when($activeYear, fn ($query) => $query->where('academic_year_id', $activeYear->id))
            ->whereNotNull('level')
            ->distinct()
            ->orderBy('level')
            ->pluck('level')
            ->all();
    }

    /**
     * @return list<string>
     */
    private function statusOptions(?AcademicYear $activeYear): array
    {
        return Enrollment::query()
            ->when($activeYear, fn ($query) => $query->where('academic_year_id', $activeYear->id))
            ->whereNotNull('status')
            ->distinct()
            ->orderBy('status')
            ->pluck('status')
            ->all();
    }

    private function normalizeName(string $name): string
    {
        $normalized = preg_replace('/[^A-Z0-9]+/', ' ', strtoupper($name)) ?? '';

        return preg_replace('/\s+/', ' ', trim($normalized)) ?? '';
    }

    /**
     * @return array<string, mixed>
     */
    private function learnerSnapshot(Learner $learner): array
    {
        return [
            'lrn' => $learner->lrn,
            'full_name' => $learner->full_name,
            'normalized_name' => $learner->normalized_name,
            'birth_date' => $learner->birth_date?->toDateString(),
            'gender' => $learner->gender,
            'mother_maiden_name' => $learner->mother_maiden_name,
            'mother_contact_number' => $learner->mother_contact_number,
            'mother_email' => $learner->mother_email,
            'father_name' => $learner->father_name,
            'father_contact_number' => $learner->father_contact_number,
            'father_email' => $learner->father_email,
            'philippine_address' => $learner->philippine_address,
            'uae_address' => $learner->uae_address,
            'previous_school' => $learner->previous_school,
            'metadata' => $learner->metadata,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function enrollmentSnapshot(Enrollment $enrollment): array
    {
        return [
            'academic_year_id' => $enrollment->academic_year_id,
            'learner_id' => $enrollment->learner_id,
            'level' => $enrollment->level,
            'status' => $enrollment->status,
            'session' => $enrollment->session,
            'enrolled_on' => $enrollment->enrolled_on?->toDateString(),
            'metadata' => $enrollment->metadata,
        ];
    }
}
