# Student Monitoring System

For public hosting and GitHub deployment, see [docs/deployment.md](docs/deployment.md). GitHub Pages alone cannot run the PHP/MySQL backend.

## Run locally

On Windows, double-click [run-student-monitoring.vbs](run-student-monitoring.vbs). It runs independently of VS Code, starts the server silently, waits for the page to become ready, and opens the application automatically. The visible [start-student-monitoring.bat](start-student-monitoring.bat) launcher is also available for troubleshooting.

To open the system on a phone or tablet, keep the computer and device on the same Wi-Fi network, run [show-student-monitoring-mobile-url.bat](show-student-monitoring-mobile-url.bat), and open the displayed address on the phone. Do not use `127.0.0.1` on the phone; that address refers to the phone itself. If Windows Firewall prompts, allow PHP on Private networks.

To remove the need to start it manually after a desktop restart, run [install-student-monitoring-startup.vbs](install-student-monitoring-startup.vbs) once. Windows will then start the PHP server automatically when you sign in. The startup task starts the server silently; use the launcher when you want the browser opened immediately.

The equivalent manual command is:

```powershell
php -S 127.0.0.1:8000 -t .
```

Then open <http://127.0.0.1:8000/>. Keep MySQL running and import [xampp-schema.sql](xampp-schema.sql) into the `student_monitoring` database before using the API. The default connection is `127.0.0.1:3306`, user `root`, with an empty password; override it with `PILOT_DB_HOST`, `PILOT_DB_PORT`, `PILOT_DB_NAME`, `PILOT_DB_USER`, and `PILOT_DB_PASSWORD` when needed.

Student status is derived from the configured academic period in [AppConfig.php](src/Config/AppConfig.php) and [constants.js](assets/js/shared/constants.js). Inactive means the student is not enrolled in the current semester; it does not disable the student's account or prevent login.

At the start of a new term, update `CURRENT_ACADEMIC_YEAR` and `CURRENT_SEMESTER` in both configuration files. A student created during the first semester starts with first-semester enrollment and no second-semester enrollment; after switching the system to `2nd Semester`, that student becomes `Inactive` until an administrator marks second-semester enrollment as `Enrolled`.

To stop only this development server, double-click [stop-student-monitoring.bat](stop-student-monitoring.bat). The silent launcher keeps PHP detached, so you can close the PHP command window, VS Code, or the terminal without stopping the web application. MySQL is separate: keep the XAMPP MySQL service running for database-backed features.

## Recommended modernization path

This project is best upgraded to a secure, maintainable full-stack architecture based on Laravel and Vue 3.

### Why this stack

- Laravel provides a strong PHP backend with built-in security, validation, routing, and ORM.
- Vue 3 keeps the interface responsive and modular without the complexity of a very large JavaScript app.
- MySQL matches the existing database structure and is already aligned with the project files.
- The separation of concerns makes the system easier to extend, test, and deploy.

### Target architecture

- Backend: Laravel 11
- Frontend: Vue 3 + Vite
- Database: MySQL
- Auth: Laravel Breeze or Jetstream
- Authorization: Laravel Policies or Spatie Permission
- API: REST endpoints with resource responses
- Security: CSRF, session protection, validation, role checks, input sanitization, rate limiting

## Suggested migration plan

1. Create a new Laravel project in a separate folder or repository.
2. Translate the current MySQL schema into Laravel migrations.
3. Create models for users, students, teachers, subjects, courses, and grades.
4. Implement authentication and role-based authorization.
5. Replace the custom `fetch` logic with Laravel API routes and controllers.
6. Build the dashboard using Vue components.
7. Add automated tests before production release.

## Current project findings

The project already contains a PHP API layer in [api.php](api.php) and client-side logic in [database-client.js](database-client.js). This indicates a strong PHP + MySQL foundation, so Laravel is the most natural secure upgrade rather than rewriting the entire app in a completely different stack.

## Security baseline

The new version should enforce:

- password hashing with Laravel's built-in hashing
- role-based access control
- request validation on every endpoint
- CSRF protection for browser sessions
- secure CORS rules
- rate limiting on login and API routes
- audit logs for sensitive changes
- least-privilege database access

## Recommended long-term goal

Keep the business domain in a structured Laravel backend and move the UI to a reusable Vue 3 front end. This produces a more maintainable system that remains secure, scalable, and easier to debug.
