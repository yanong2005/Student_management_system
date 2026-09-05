#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-8000}"
php -S 0.0.0.0:${PORT} -t .
