# AI Engineering Bible

Purpose
- Define safe, repeatable standards for AI-assisted engineering changes.

Scope
- Code changes, release hygiene, documentation quality, and security safeguards.

Prerequisites
- Contributor access to repository and CI checks.

Instructions
## Change Rules
- No undocumented behavior changes.
- No secret material in code, docs, or tracked env files.
- Keep changes small, reviewable, and linked to explicit requirements.

## Documentation Rules
- Update README index when adding or renaming docs.
- Keep changelog and release notes synchronized with shipped behavior.

## Security Rules
- Use environment variables for credentials.
- Validate auth, authorization, CSRF, and rate-limiting paths after security-related edits.

## Release Rules
- Confirm clean working tree before tagging.
- Ensure production build succeeds before final release sign-off.

Verification
- Pull requests include code changes, verification evidence, and doc updates where applicable.

Troubleshooting
- If instructions conflict, prioritize security and production stability, then update docs to remove ambiguity.
