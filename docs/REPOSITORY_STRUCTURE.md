# Repository Structure

Purpose
- Provide a stable map of top-level and critical subdirectories for Konpuk v1.0.

Scope
- Operationally relevant folders, scripts, and docs.

Prerequisites
- Repository checkout.

Instructions
## Top-Level
- `client/` frontend application
- `server/` backend application
- `docs/` engineering and release documentation
- `database/` database artifacts (currently minimal)
- `deploy/` deployment snippets

## Backend Highlights
- `server/routes/` API route modules
- `server/controllers/` request handlers
- `server/services/` domain services
- `server/middleware/` auth/security/validation middleware
- `server/models/` Mongoose models
- `server/scripts/` maintenance and verification scripts

## Frontend Highlights
- `client/src/pages/` route pages
- `client/src/components/` shared UI
- `client/src/services/` API and socket integrations
- `client/src/hooks/` state and lifecycle hooks
- `client/src/routes/` route definitions

Verification
- Directory list matches current repository tree.

Troubleshooting
- If structure changes, update this file and README index in the same commit.
