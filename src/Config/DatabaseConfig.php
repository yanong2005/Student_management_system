<?php
declare(strict_types=1);
namespace Pilot\Config;
final class DatabaseConfig
{
    public function __construct(
        public readonly string $host,
        public readonly string $port,
        public readonly string $name,
        public readonly string $user,
        public readonly string $password,
    ) {
    }
    public static function fromEnvironment(): self
    {
        return new self(
            getenv('PILOT_DB_HOST') ?: '127.0.0.1',
            getenv('PILOT_DB_PORT') ?: '3306',
            getenv('PILOT_DB_NAME') ?: 'student_monitoring',
            getenv('PILOT_DB_USER') ?: 'root',
            getenv('PILOT_DB_PASSWORD') ?: '',
        );
    }
    public function dsn(): string
    {
        return "mysql:host={$this->host};port={$this->port};dbname={$this->name};charset=utf8mb4";
    }
}