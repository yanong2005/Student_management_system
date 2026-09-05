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

    public static function isAllowedOrigin(string $origin): bool
    {
        if ($origin === '') {
            return false;
        }

        foreach (self::allowedOrigins() as $allowedOrigin) {
            if ($allowedOrigin === '*') {
                return true;
            }

            if ($allowedOrigin === $origin) {
                return true;
            }

            $pattern = str_replace('\*', '.*', preg_quote($allowedOrigin, '/'));
            if (@preg_match('/^' . $pattern . '$/i', $origin) === 1) {
                return true;
            }
        }

        $host = parse_url($origin, PHP_URL_HOST);
        return is_string($host) && preg_match('/\.github\.io$/i', $host) === 1;
    }
}