<?php

namespace App\Enums;

enum DocumentStatus: string
{
    case Ok = 'ok';
    case Missing = 'missing';
    case Expired = 'expired';
    case PendingReview = 'pending_review';
}
