# Production Deployment Guide

## 1) Prerequisites

- PHP 8.2+
- MySQL 8.0+
- A deployed host with PHP support, or use Docker locally
- A valid domain or host for HTTPS

## 2) Database setup

1. Create a MySQL database named `student_monitoring`.
2. Import the schema from `xampp-schema.sql`.
3. Set environment variables:

```bash
export PILOT_DB_HOST=127.0.0.1
export PILOT_DB_PORT=3306
export PILOT_DB_NAME=student_monitoring
export PILOT_DB_USER=root
export PILOT_DB_PASSWORD=
export PILOT_ALLOWED_ORIGINS=https://your-domain.com
```

## 3) Local one-click deploy

Windows:

```powershell
./deploy-local.bat
```

This starts the app in local production mode using the PHP built-in server.

## 4) Docker deploy

```bash
docker compose up --build -d
```

Then open:

```text
http://localhost
```

## 5) Cloud deploy

Use the included `render.yaml` for Render, or configure the same env vars in any PHP-capable host.

## 6) Production hardening checklist

- Move secrets to environment variables.
- Keep HTTPS enabled.
- Restrict CORS to the real frontend domain.
- Replace plaintext demo passwords.
- Use prepared statements and a least-privilege DB user.
- Add login/session validation for production.
