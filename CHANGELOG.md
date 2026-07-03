# Changelog

## v1.0.0 - 2026-07-03

- Commit: ca519641c35c91b8f315a0bd8899105687cfcec1

### Highlights
- Finalized production release baseline with authenticated runtime stabilization.
- Applied boot request optimizations to avoid duplicate mount-time fetch pressure.
- Added socket initialization gating for release-safe runtime behavior.
- Completed clean-room verification confirming no active `/socket.io` storm and no HTTP 429 in isolated runtime.

### Breaking Changes
- None.

### Migration Notes
- No data migration required.
- For release-safe behavior, ensure `VITE_ENABLE_SOCKET=false` unless realtime chat/socket features are intentionally enabled for the target environment.
