<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Models\AcademicYear;
use App\Models\DocumentRequirement;
use App\Models\Enrollment;
use App\Models\ImportBatch;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $activeYear = AcademicYear::query()
            ->where('is_active', true)
            ->first(['id', 'name']);
        $enrollmentIds = Enrollment::query()
            ->when($activeYear, fn ($query) => $query->where('academic_year_id', $activeYear->id))
            ->pluck('id');
        $latestImport = ImportBatch::query()
            ->when($activeYear, fn ($query) => $query->where('academic_year_id', $activeYear->id))
            ->latest()
            ->first([
                'id',
                'original_filename',
                'imported_rows',
                'skipped_rows',
                'warning_count',
                'warnings',
                'status',
                'created_at',
            ]);

        return Inertia::render('Dashboard', [
            'activeYear' => $activeYear,
            'totals' => [
                'learners' => Enrollment::query()
                    ->when($activeYear, fn ($query) => $query->where('academic_year_id', $activeYear->id))
                    ->distinct('learner_id')
                    ->count('learner_id'),
                'enrollments' => $enrollmentIds->count(),
                'document_requirements' => DocumentRequirement::query()
                    ->whereIn('enrollment_id', $enrollmentIds)
                    ->count(),
            ],
            'documentTotals' => $this->documentTotals($enrollmentIds),
            'byLevel' => Enrollment::query()
                ->selectRaw('level, COUNT(*) as learners')
                ->when($activeYear, fn ($query) => $query->where('academic_year_id', $activeYear->id))
                ->groupBy('level')
                ->orderBy('level')
                ->get()
                ->map(fn (Enrollment $enrollment) => [
                    'level' => $enrollment->level,
                    'learners' => (int) $enrollment->learners,
                ]),
            'latestImport' => $latestImport,
            'duplicateLrnWarnings' => collect($latestImport?->warnings ?? [])
                ->where('code', 'duplicate_lrn_conflict')
                ->values(),
        ]);
    }

    /**
     * @param  Collection<int, int>  $enrollmentIds
     * @return array<string, int>
     */
    private function documentTotals($enrollmentIds): array
    {
        $counts = DocumentRequirement::query()
            ->selectRaw('status, COUNT(*) as total')
            ->whereIn('enrollment_id', $enrollmentIds)
            ->groupBy('status')
            ->pluck('total', 'status');

        return [
            'ok' => (int) ($counts[DocumentStatus::Ok->value] ?? 0),
            'missing' => (int) ($counts[DocumentStatus::Missing->value] ?? 0),
            'expired' => (int) ($counts[DocumentStatus::Expired->value] ?? 0),
            'pending_review' => (int) ($counts[DocumentStatus::PendingReview->value] ?? 0),
        ];
    }
}
