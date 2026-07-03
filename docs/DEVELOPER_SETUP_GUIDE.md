# Developer Setup Guide

Purpose
- Provide consistent onboarding for contributors working on Konpuk v1.0.

Scope
- Local setup, run commands, test commands, and validation checks.

Prerequisites
- Node.js 18+, npm, MongoDB, Git.

Instructions
## Install
1. `npm --prefix server install`
2. `npm --prefix client install`

## Configure Environment
1. `Copy-Item server/.env.example server/.env`
2. Set `MONGODB_URI` for local DB.
3. Set `CLIENT_ORIGIN=http://localhost:5173`.

## Run Services
1. Backend: `npm --prefix server run dev`
2. Frontend: `npm --prefix client run dev`

## Optional Dev Seed
- `set NODE_ENV=development&& set DEV_SEED=true&& npm --prefix server run seed:dev`

## Tests and Build
- Backend integration: `npm --prefix server run test:integration`
- Backend seller checks: `npm --prefix server run test:seller`
- Frontend test: `npm --prefix client run test`
- Frontend build: `npm --prefix client run build`

Verification
- Login flow works locally.
- Frontend build completes.

Troubleshooting
- If seed fails, verify `NODE_ENV=development` and `DEV_SEED=true`.
- If CORS/CSRF fails, check backend origin vars and frontend API base URL.
