<?php
declare(strict_types=1);
namespace Pilot\Infrastructure\Persistence;
use PDO;
use Pilot\Config\DatabaseConfig;
use Throwable;
final class PdoFactory
{
    public static function make(): PDO
    {
        $config = DatabaseConfig::fromEnvironment();
        try {
            return new PDO($config->dsn(), $config->user, $config->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (Throwable $error) {
            throw $error;
        }
    }
}