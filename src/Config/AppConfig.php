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
        $allowed = [
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'http://localhost:8000',
            'http://127.0.0.1:8000',
            'http://0.0.0.0:8000',
            'https://localhost',
            'https://127.0.0.1',
            'https://*.github.io',
        ];

        $envOrigins = getenv('PILOT_ALLOWED_ORIGINS');
        if (is_string($envOrigins) && $envOrigins !== '') {
            foreach (explode(',', $envOrigins) as $origin) {
                $origin = trim($origin);
                if ($origin !== '') {
                    $allowed[] = $origin;
                }
            }
        }

        $host = $_SERVER['HTTP_HOST'] ?? '';
        if ($host !== '') {
            $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $allowed[] = $scheme . '://' . $host;
        }

        $githubPagesHost = $_SERVER['HTTP_REFERER'] ?? '';
        if ($githubPagesHost !== '') {
            $parsed = parse_url($githubPagesHost, PHP_URL_HOST);
            if (is_string($parsed) && $parsed !== '') {
                $allowed[] = 'https://' . $parsed;
            }
        }

        return array_values(array_unique(array_filter($allowed, static fn (string $origin): bool => $origin !== '')));
    }
}