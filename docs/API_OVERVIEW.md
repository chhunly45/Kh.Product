# API Overview

Purpose
- Summarize the backend API surface for Konpuk v1.0.

Scope
- Route groups, auth requirements, and compatibility notes.

Prerequisites
- Backend running and reachable at `/api`.

Instructions
## Base Path
- `/api`

## Route Groups
- `/auth`
- `/categories`
- `/products`
- `/favorites`
- `/upload`
- `/banners`
- `/chats`
- `/conversations` (compatibility alias to chat routes)
- `/reports`
- `/notifications`
- `/reviews`
- `/locations`
- `/seller-analytics`
- `/traffic-analytics`
- `/promotions`
- `/verification`
- `/admin`
- `/users`

## Security Expectations
- Protected routes require `Authorization: Bearer <token>`.
- CSRF token flow required for state-changing operations.

Verification
- Route registrations match `server/routes/index.js`.

Troubleshooting
- 401/403: verify token validity and role requirements.
- 429: verify rate-limit configuration and request cadence.
