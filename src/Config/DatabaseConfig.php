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
        $host = getenv('PILOT_DB_HOST');
        $port = getenv('PILOT_DB_PORT');
        $name = getenv('PILOT_DB_NAME');
        $user = getenv('PILOT_DB_USER');
        $password = getenv('PILOT_DB_PASSWORD');

        return new self(
            $host !== false && $host !== '' ? $host : '127.0.0.1',
            $port !== false && $port !== '' ? $port : '3306',
            $name !== false && $name !== '' ? $name : 'student_monitoring',
            $user !== false && $user !== '' ? $user : 'root',
            $password !== false ? $password : '',
        );
    }
    public function dsn(): string
    {
        return "mysql:host={$this->host};port={$this->port};dbname={$this->name};charset=utf8mb4";
    }
}