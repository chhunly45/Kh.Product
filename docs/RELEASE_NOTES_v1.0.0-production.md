# Release Notes v1.0.0-production

## Authentication Fixes
- Corrected development seed user alignment so login credentials are valid in memory-db verification runs.
- Stabilized auth hydration flow to avoid unnecessary profile fetches without a token.
- Preserved JWT/session behavior and protected-route enforcement.

## Runtime Stability Improvements
- Eliminated authenticated boot request duplication by tightening mount-time data loading paths.
- Reduced shell-triggered repeated calls that previously amplified rate-limit pressure.
- Verified clean-room runtime no longer reproduces request storm behavior.

## Boot Request Optimization
- Split and constrained header boot-fetch behavior to avoid duplicate category/count fetches.
- Removed redundant profile bootstrap call from dashboard path and keyed dashboard load by seller identity.

## Socket Initialization Improvements
- Added feature flag gate for socket initialization via `VITE_ENABLE_SOCKET`.
- Defaulted release runtime to socket disabled for Seller Profile v1 (`VITE_ENABLE_SOCKET=false`).
- Hardened socket lifecycle guards (single instance path, connect guard, listener cleanup on disconnect).

## Environment Verification Results
- Repository code verification: no remaining release blocker in clean-room run.
- Isolated runtime (`backend:5100`, `frontend:5174`) produced:
  - `0` `/socket.io` requests
  - `0` HTTP `429`
- Prior socket storm failures were classified as stale external/local development runtime sessions.

## Build Verification
- Final production build completed successfully (`npm run build`).
