<?php
declare(strict_types=1);
namespace Pilot\Presentation\Http;
use Pilot\Config\AppConfig;
final class Cors
{
    public static function apply(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');
        header('Access-Control-Allow-Credentials: true');

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin !== '') {
            $allowedOrigins = AppConfig::allowedOrigins();
            foreach ($allowedOrigins as $allowedOrigin) {
                if ($allowedOrigin === '*' || $allowedOrigin === $origin) {
                    header("Access-Control-Allow-Origin: $allowedOrigin");
                    break;
                }
            }
        }
    }
    public static function handlePreflight(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}