# Konpuk v1.0

Purpose
- Single entry point for all engineering and operational documentation for the v1.0 production baseline.

Scope
- Covers repository overview, quick start, and links to all core project documents.

Prerequisites
- Node.js 18+
- npm 9+
- MongoDB (local or hosted)
- Git

Instructions

## 1) Repository Overview
- Frontend: `client/` (React + Vite + TypeScript)
- Backend: `server/` (Express + MongoDB/Mongoose)
- Documentation: `docs/`

## 2) Quick Start (Developer)
1. Install dependencies:
   - `npm --prefix server install`
   - `npm --prefix client install`
2. Create backend env file from development template:
   - Windows PowerShell: `Copy-Item server/.env.example server/.env`
3. Start backend:
   - `npm --prefix server run dev`
4. Start frontend:
   - `npm --prefix client run dev`
5. Open the local frontend URL shown by Vite.

## 3) Build Verification
- Frontend production build:
  - `npm --prefix client run build`
- Backend production start:
  - `npm --prefix server run start`

## 4) Documentation Index
Release and governance
- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Release Notes v1.0.0: [docs/RELEASE_NOTES_v1.0.0-production.md](docs/RELEASE_NOTES_v1.0.0-production.md)
- Release Notes (Canonical): [docs/RELEASE_NOTES.md](docs/RELEASE_NOTES.md)

Core engineering references
- Project Bible: [docs/PROJECT_BIBLE.md](docs/PROJECT_BIBLE.md)
- Design Bible: [docs/DESIGN_BIBLE.md](docs/DESIGN_BIBLE.md)
- AI Engineering Bible: [docs/AI_ENGINEERING_BIBLE.md](docs/AI_ENGINEERING_BIBLE.md)
- Architecture Overview: [docs/ARCHITECTURE_OVERVIEW.md](docs/ARCHITECTURE_OVERVIEW.md)
- Repository Structure: [docs/REPOSITORY_STRUCTURE.md](docs/REPOSITORY_STRUCTURE.md)
- API Overview: [docs/API_OVERVIEW.md](docs/API_OVERVIEW.md)
- Database Overview: [docs/DATABASE_OVERVIEW.md](docs/DATABASE_OVERVIEW.md)

Operations and setup
- Deployment Guide: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
- Environment Guide: [docs/ENVIRONMENT_GUIDE.md](docs/ENVIRONMENT_GUIDE.md)
- Developer Setup Guide: [docs/DEVELOPER_SETUP_GUIDE.md](docs/DEVELOPER_SETUP_GUIDE.md)
- Troubleshooting Guide: [docs/TROUBLESHOOTING_GUIDE.md](docs/TROUBLESHOOTING_GUIDE.md)
- Production Release Checklist: [docs/PRODUCTION_RELEASE_CHECKLIST.md](docs/PRODUCTION_RELEASE_CHECKLIST.md)
- Scripts Guide: [server/scripts/README.md](server/scripts/README.md)

Legacy product requirements
- Original PRD: [docs/PRD.md](docs/PRD.md)

Verification
- `README.md` links resolve to existing files in this repository.
- Quick start commands align with `client/package.json` and `server/package.json` scripts.

Troubleshooting
- If backend fails at boot due to env validation, verify values in `server/.env` against [docs/ENVIRONMENT_GUIDE.md](docs/ENVIRONMENT_GUIDE.md).
- If frontend API calls fail, verify `VITE_API_BASE_URL` and backend CORS origin settings.
