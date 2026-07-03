# Architecture Overview

Purpose
- Describe the current production architecture for Konpuk v1.0.

Scope
- Frontend architecture, backend architecture, security controls, and runtime boundaries.

Prerequisites
- Familiarity with repository modules `client/` and `server/`.

Instructions
## Frontend
- Stack: React + Vite + TypeScript.
- Routing: `client/src/routes` and page modules in `client/src/pages`.
- Service layer: API and socket clients in `client/src/services`.

## Backend
- Stack: Express + Mongoose.
- Entry points: `server/app.js` (middleware and routes), `server/server.js` (HTTP + Socket.IO startup).
- Route composition: `server/routes/index.js`.

## Security Layer
- JWT authentication middleware.
- Authorization middleware for role and ownership checks.
- CSRF protection using `csurf` with cookie + token flow.
- CORS origin allowlist and rate limiting in `server/app.js`.
- Helmet, sanitize, xss-clean, and hpp protections.

## Data Layer
- MongoDB via Mongoose models in `server/models`.

Verification
- Architecture reflects live module structure and current startup files.

Troubleshooting
- If route behavior diverges, verify route registration order in `server/app.js` and `server/routes/index.js`.
