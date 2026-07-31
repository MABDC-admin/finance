<?php

namespace App\Enums;

enum DocumentType: string
{
    case SchoolCredentials = 'school_credentials';
    case BirthCertificate = 'birth_certificate';
    case Passport = 'passport';
    case Visa = 'visa';
    case EmiratesId = 'emirates_id';

    public function label(): string
    {
        return match ($this) {
            self::SchoolCredentials => 'School Credentials',
            self::BirthCertificate => 'Birth Certificate',
            self::Passport => 'Passport',
            self::Visa => 'Visa',
            self::EmiratesId => 'EID',
        };
    }
}
