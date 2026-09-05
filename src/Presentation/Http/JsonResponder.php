<?php
declare(strict_types=1);
namespace Pilot\Presentation\Http;
final class JsonResponder
{
    /** @param array<string, mixed> $payload */
    public static function send(int $status, array $payload): never
    {
        http_response_code($status);
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }
}