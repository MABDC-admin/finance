<?php

namespace App\Enums;

enum ApplicationStatus: string
{
    case Inquiry = 'inquiry';
    case ApplicationStarted = 'application_started';
    case ForDocumentReview = 'for_document_review';
    case IncompleteRequirements = 'incomplete_requirements';
    case ForAssessment = 'for_assessment';
    case ApprovedForEnrollment = 'approved_for_enrollment';
    case Waitlisted = 'waitlisted';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::Inquiry => 'Inquiry',
            self::ApplicationStarted => 'Application Started',
            self::ForDocumentReview => 'For Document Review',
            self::IncompleteRequirements => 'Incomplete Requirements',
            self::ForAssessment => 'For Assessment',
            self::ApprovedForEnrollment => 'Approved for Enrollment',
            self::Waitlisted => 'Waitlisted',
            self::Rejected => 'Rejected',
        };
    }
}
