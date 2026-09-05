# Deployment

## Important limitation

GitHub Pages can host the static HTML, CSS, and JavaScript files, but it cannot execute `api.php` or provide MySQL. A complete deployment therefore needs:

- A GitHub repository for source control.
- A PHP-capable web host for the API.
- A managed MySQL database for production data.

## Recommended topology

```text
GitHub repository
  -> PHP host (api.php + src/)
  -> managed MySQL database
  -> static frontend or the same PHP host
```

For a first public demo, deploy the whole project to a PHP/MySQL host such as a managed cPanel host, Render with a PHP service, or another provider that supports PHP and MySQL. Point the frontend API URL at the deployed API rather than using the relative local `api.php` path.

## Before making the repository public

- Replace demo plaintext passwords with password hashes and a real authentication flow.
- Move database credentials to environment variables.
- Remove real student records from seed data and database exports.
- Configure HTTPS, CORS, CSRF protection, rate limiting, and role authorization.
- Use a separate production database; never expose the local XAMPP database.
- Do not publish `.env`, database dumps, local logs, or private exports.

## GitHub-only preview

A GitHub Pages preview can show the static interface, but database reads and writes will not work until a deployed PHP API is configured. It is suitable only for a UI demonstration.
