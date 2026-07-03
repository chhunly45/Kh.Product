# Project Bible

Purpose
- Define the official product and engineering baseline for Konpuk v1.0.

Scope
- Product mission, release baseline, constraints, and governance references.

Prerequisites
- Familiarity with project goals and release process.

Instructions
## Product Mission
- Konpuk is a Cambodia-focused marketplace for buyers and sellers.

## v1.0 Baseline
- Frontend: React + Vite + TypeScript.
- Backend: Express + MongoDB + JWT auth + CSRF + rate limiting.
- Deployment model: frontend static hosting + backend web service.

## Delivery Constraints
- No production secrets committed to repository.
- Environment-driven configuration only.
- Release notes and changelog must be updated for every release.

## Governance References
- Changelog: [../CHANGELOG.md](../CHANGELOG.md)
- Release notes: [RELEASE_NOTES.md](RELEASE_NOTES.md)
- Architecture: [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md)

Verification
- Baseline matches deployed v1.0 architecture and release notes.

Troubleshooting
- If baseline changes, update this file and linked engineering docs in the same pull request.
