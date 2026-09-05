# Framework Upgrade Blueprint

## Selected framework

Laravel + Vue 3 + MySQL

## Why this choice fits the project

This project already depends on a PHP backend and a MySQL-style schema. The architecture is closer to a classic web application than a single-page app built from scratch. Laravel gives the team the structure needed for secure admin systems and long-term maintenance.

## Proposed architecture

### Backend

- Laravel 11
- Eloquent ORM
- Controllers for authentication, students, teachers, grades, courses, and dashboard analytics
- Middleware for roles and route protection
- Validation requests for all forms
- Policies to secure actions by role

### Frontend

- Vue 3 with Vite
- Component-based dashboard pages
- Centralized API client
- Pinia for state management if the app grows
- Token/session handling through Laravel auth or API middleware

### Database

- MySQL
- Migrations instead of manual SQL patches
- seeders for demo accounts
- relationships for users, students, teachers, courses, and subjects

## Recommended directory structure

```text
app/
  Http/
    Controllers/
    Middleware/
  Models/
  Policies/
config/
database/
  migrations/
  seeders/
resources/
  js/
    components/
    pages/
    stores/
    api/
  css/
routes/
  api.php
  web.php
```

## Security priorities

- Enforce HTTPS in production
- Use Laravel's built-in password hashing
- Validate every request
- Restrict endpoints by role
- Protect all write operations with CSRF or token validation
- Add rate limits to login and password reset routes
- Log suspicious activity
- Use environment variables for secrets and database credentials

## Migration strategy

1. Audit existing forms and API routes.
2. Map each current feature to a Laravel module.
3. Build the authentication and role system first.
4. Port student data and teacher data into migrations.
5. Rebuild dashboard logic on the new front end.
6. Replace custom JavaScript state handling with clean API responses.
7. Add tests for login, authorization, and core student operations.

## Expected benefits

- cleaner code structure
- easier debugging
- safer authentication and authorization
- less custom logic in client-side scripts
- faster onboarding for future developers
- stronger long-term maintainability
