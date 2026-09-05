<?php
declare(strict_types=1);
namespace Pilot\Presentation\Http;
use Pilot\Application\Workspace\WorkspaceService;
use Pilot\Config\AppConfig;
use RuntimeException;
use Throwable;
final class WorkspaceController
{
    public function __construct(private readonly WorkspaceService $workspace)
    {
    }
    public function show(): void
    {
        $id = $_GET['id'] ?? 'main';
        if (!preg_match(AppConfig::WORKSPACE_ID_PATTERN, (string) $id)) {
            JsonResponder::send(400, ['error' => 'Invalid state id.']);
        }
        try {
            $result = $this->workspace->load((string) $id);
            echo json_encode($result, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (RuntimeException $error) {
            JsonResponder::send($error->getCode() >= 400 && $error->getCode() < 600 ? $error->getCode() : 500, ['error' => $error->getMessage()]);
        } catch (Throwable $error) {
            JsonResponder::send(500, ['error' => 'Failed to fetch data.']);
        }
    }
    public function update(): void
    {
        $raw = file_get_contents('php://input');
        if (strlen($raw) > AppConfig::MAX_PAYLOAD_BYTES) {
            JsonResponder::send(413, ['error' => 'State payload is too large.']);
        }
        try {
            $payload = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (Throwable $error) {
            JsonResponder::send(400, ['error' => 'Request body must be valid JSON.']);
        }
        $id = $payload['id'] ?? 'main';
        if (!preg_match(AppConfig::WORKSPACE_ID_PATTERN, (string) $id)) {
            JsonResponder::send(400, ['error' => 'Invalid state id.']);
        }
        if (!is_array($payload) || !is_array($payload['state'] ?? null)) {
            JsonResponder::send(400, ['error' => 'Invalid state payload.']);
        }
        try {
            $result = $this->workspace->save($payload);
            echo json_encode($result);
            exit;
        } catch (RuntimeException $error) {
            JsonResponder::send($error->getCode() >= 400 && $error->getCode() < 600 ? $error->getCode() : 500, ['error' => $error->getMessage()]);
        } catch (Throwable $error) {
            JsonResponder::send(500, ['error' => 'Failed to save data.']);
        }
    }
}