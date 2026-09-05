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
        header('Access-Control-Allow-Headers: Content-Type, Accept');
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if (in_array($origin, AppConfig::allowedOrigins(), true)) {
            header("Access-Control-Allow-Origin: $origin");
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