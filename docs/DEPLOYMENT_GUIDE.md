# Deployment Guide

Purpose
- Provide standardized deployment instructions for Konpuk frontend and backend.

Scope
- Backend deployment settings, frontend deployment settings, and verification steps.

Prerequisites
- Access to deployment platform accounts.
- Configured production environment variables.

Instructions
## Backend Deployment
- Reference file: [../render.yaml](../render.yaml)
- Service root: `server`
- Build command: `npm install`
- Start command: `npm start`

Required backend variables (minimum)
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL` or `CLIENT_ORIGIN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NODE_ENV=production`

## Frontend Deployment
- Reference files: [../vercel.json](../vercel.json), [../client/vercel.json](../client/vercel.json)
- Build command: `npm --prefix client run build`
- Output directory: `client/dist`

Required frontend variable
- `VITE_API_BASE_URL` (must include `/api`)

## Post-Deployment Verification
1. Load homepage.
2. Verify login and protected route access.
3. Verify API `/api/csrf-token` and authenticated `/api/auth/me` behaviors.
4. Verify image upload path and chat feature flag behavior for target environment.

Verification
- Backend boots without env errors.
- Frontend build passes and routes resolve.

Troubleshooting
- CORS/CSRF issues: confirm backend origin variables match deployed frontend origin.
- Auth issues: verify `JWT_SECRET` is set and consistent for token lifecycle.
