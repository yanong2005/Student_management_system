<?php
declare(strict_types=1);
namespace Pilot\Support;
final class Text
{
    public static function nullable(mixed $value): ?string
    {
        $value = is_string($value) ? trim($value) : $value;
        return $value === '' || $value === null ? null : (string) $value;
    }
}