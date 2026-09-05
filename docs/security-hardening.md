# Security Hardening Checklist

## Core protections

- Use HTTPS in production
- Store secrets in environment variables only
- Validate and sanitize all user input
- Hash passwords with Laravel's secure hash engine
- Use prepared statements and ORM queries
- Limit database privileges to application-only access

## Role and access control

- Administrator: full system access
- Teacher: manage assigned records and grades
- Student: view own records and limited profile access
- Enforce authorization in controllers or policies

## Session and API protection

- Protect browser sessions with secure cookies
- Use CSRF tokens for state-changing requests
- Apply rate limiting for login and API abuse attempts
- Restrict CORS to trusted origins
- Avoid exposing raw database errors to end users

## Data protection

- Do not store plain-text passwords
- Mask private identifiers when displaying data in dashboards
- Log actions for auditing
- Implement backups for the database
- Restrict export features for sensitive records

## Operational security

- Run automated tests for auth, user management, and grade updates
- Use environment-specific configuration files
- Keep framework and dependencies updated
- Review logs for failed logins and unauthorized access attempts
- Add monitoring for suspicious or repeated requests

## Summary

The recommended upgrade to Laravel + Vue 3 will improve the app's maintainability and security far beyond the current custom JavaScript approach. The most important move is to remove ad hoc authentication and API logic and replace it with a framework that already provides safer defaults.
