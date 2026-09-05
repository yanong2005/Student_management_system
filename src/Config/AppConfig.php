<?php
declare(strict_types=1);
namespace Pilot\Config;
final class AppConfig
{
    public const WORKSPACE_ID_PATTERN = '/^[a-zA-Z0-9_-]{1,64}$/';
    public const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024;
    public const PASSING_GRADE = 75;
    public const CURRENT_ACADEMIC_YEAR = '2026-2027';
    public const CURRENT_SEMESTER = '1st Semester';
    public const ENROLLMENT_STATES = ['Enrolled', 'Not enrolled'];
    public const COLLECTIONS = ['users', 'students', 'teachers', 'subjects', 'courses', 'grades'];
    /** @return list<string> */
    public static function allowedOrigins(): array
    {
        return ['http://localhost:5500', 'http://127.0.0.1:5500'];
    }
}