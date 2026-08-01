<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationStatus;
use App\Models\AcademicYear;
use App\Models\AdmissionApplication;
use App\Models\Learner;
use App\Models\Enrollment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdmissionController extends Controller
{
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::query()
            ->where('is_active', true)
            ->first(['id', 'name']);

        $applications = AdmissionApplication::query()
            ->when($activeYear, fn ($q) => $q->where('academic_year_id', $activeYear->id))
            ->orderBy('created_at', 'desc')
            ->get();

        $statuses = collect(ApplicationStatus::cases())->map(fn ($status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ]);

        return Inertia::render('Admissions/Index', [
            'activeYear' => $activeYear,
            'applications' => $applications,
            'statuses' => $statuses,
        ]);
    }

    public function updateStatus(Request $request, AdmissionApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $application->update([
            'status' => $validated['status'],
        ]);

        return redirect()->back();
    }

    public function enroll(Request $request, AdmissionApplication $application): RedirectResponse
    {
        if ($application->learner_id) {
            return redirect()->back()->with('error', 'Applicant is already enrolled.');
        }

        $learner = Learner::create([
            'full_name' => $application->full_name,
            'normalized_name' => preg_replace('/\s+/', ' ', trim(preg_replace('/[^A-Z0-9]+/', ' ', strtoupper($application->full_name)))),
            'birth_date' => $application->date_of_birth,
            'mother_contact_number' => $application->contact_number, // Default to main contact
            'metadata' => [
                'enrollment_type' => $application->classification->value,
                'date_admitted' => now()->toDateString(),
                'contact_preferences' => [
                    'primary_email' => $application->email,
                    'primary_mobile' => $application->contact_number,
                ],
                'academic' => [
                    'program' => $application->metadata['program'] ?? 'Regular',
                ]
            ],
        ]);

        Enrollment::create([
            'academic_year_id' => $application->academic_year_id,
            'learner_id' => $learner->id,
            'level' => $application->level_applied_for,
            'status' => 'enrolled',
            'enrolled_on' => now(),
            'metadata' => [],
        ]);

        $application->update([
            'learner_id' => $learner->id,
        ]);

        return redirect()->route('learners.show', $learner->id);
    }
}
