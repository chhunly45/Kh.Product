# Environment Guide

Purpose
- Define environment-variable standards for local development and production.

Scope
- Backend and frontend variables, templates, and safety rules.

Prerequisites
- Access to env template files and deployment settings.

Instructions
## Source of Truth
- Development template: [../server/.env.example](../server/.env.example)
- Production template: [../server/.env.production.example](../server/.env.production.example)

## Backend Variables
- `PORT`
- `MONGODB_URI` or `MONGO_URI`
- `CLIENT_ORIGIN` or `CLIENT_URL` (also supports `FRONTEND_URL` / `FRONTEND`)
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_IN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX`
- `UPLOAD_DIR`
- `NODE_ENV`
- `DEV_SEED` (development only)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER` (optional)
- `RESEND_API_KEY` (production email provider)
- `EMAIL_FROM`

## Frontend Variables
- `VITE_API_BASE_URL`
- `VITE_ENABLE_SOCKET` (recommended `false` for v1 release-safe runtime unless intentionally enabled)

## Safety Rules
- Never commit real credentials, keys, tokens, or production URIs.
- Use placeholders in all tracked example files.
- Keep `.env` untracked.

Verification
- Environment files use placeholders in tracked templates.
- Runtime starts with expected configuration.

Troubleshooting
- If backend cannot connect DB, verify `MONGODB_URI` format and network access.
- If frontend cannot reach API, verify `VITE_API_BASE_URL` includes `/api`.
