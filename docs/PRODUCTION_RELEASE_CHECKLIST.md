# Production Release Checklist

Purpose
- Define the final release gate for Konpuk production baselines.

Scope
- Code hygiene, build verification, security checks, documentation, and release metadata.

Prerequisites
- Release candidate branch prepared.

Instructions
## 1. Repository Hygiene
- Working tree clean.
- No temporary scripts or investigation artifacts tracked.

## 2. Build and Runtime
- Frontend: `npm --prefix client run build` passes.
- Backend: `npm --prefix server run start` boots with production env.

## 3. Security
- Env templates contain placeholders only.
- No hardcoded credentials or tokens in tracked files.
- Auth, CSRF, CORS, and rate limiting behavior verified.

## 4. Documentation
- Update changelog and release notes.
- Verify README documentation index links.
- Ensure deployment and environment guides match current config.

## 5. Tag and Push
- Create release commit.
- Create semantic tag.
- Push commit and tags.

Verification
- `git status` returns clean.
- release tag resolves to expected commit.

Troubleshooting
- If any gate fails, do not tag; fix and re-run checklist.
