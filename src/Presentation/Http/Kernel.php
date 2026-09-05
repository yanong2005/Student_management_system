<?php
declare(strict_types=1);
namespace Pilot\Presentation\Http;
use Pilot\Application\Workspace\WorkspaceService;
use Pilot\Infrastructure\Persistence\PdoFactory;
use Pilot\Infrastructure\Persistence\WorkspaceStore;
use Throwable;
final class Kernel
{
    public function handle(): void
    {
        Cors::apply();
        Cors::handlePreflight();
        try {
            $pdo = PdoFactory::make();
        } catch (Throwable $error) {
            JsonResponder::send(503, [
                'error' => 'Database connection failed. Check the InfinityFree MySQL host, database name, username, password, and schema import.',
                'detail' => $error->getMessage(),
            ]);
        }
        $controller = new WorkspaceController(new WorkspaceService(new WorkspaceStore($pdo)));
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if ($method === 'GET') {
            $controller->show();
        } elseif ($method === 'PUT') {
            $controller->update();
        } else {
            JsonResponder::send(405, ['error' => 'Method not allowed.']);
        }
    }
}