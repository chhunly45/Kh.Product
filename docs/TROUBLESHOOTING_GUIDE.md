# Troubleshooting Guide

Purpose
- Provide quick resolution paths for common development and production-adjacent issues.

Scope
- Startup, auth, CSRF/CORS, rate limiting, and build issues.

Prerequisites
- Access to local logs and environment configuration.

Instructions
## Backend Fails to Start
- Verify `server/.env` exists and includes `MONGODB_URI`, `JWT_SECRET`, and origin settings.
- Check MongoDB reachability.

## Frontend Cannot Reach API
- Verify `VITE_API_BASE_URL` includes `/api`.
- Confirm backend CORS origin includes frontend origin.

## 401 on Authenticated Endpoints
- Verify token storage and Authorization header format.
- Re-login to refresh stale tokens.

## CSRF Token Errors
- Ensure `/api/csrf-token` succeeds before protected POST/PUT/PATCH/DELETE requests.
- Verify cookies are accepted and origin/referrer matches allowlist.

## Rate Limit 429 Responses
- Reduce repeated polling/retry loops.
- Verify environment-specific rate-limit values.

## Build Warnings/Failures
- Run `npm --prefix client run build` and inspect warning output.
- Resolve TypeScript errors before release cut.

Verification
- Issue is reproducible and cleared after corrective steps.

Troubleshooting
- If unresolved, capture request/response logs and environment snapshot for escalation.
