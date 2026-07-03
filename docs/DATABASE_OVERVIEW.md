# Database Overview

Purpose
- Document current database model footprint for Konpuk v1.0.

Scope
- MongoDB usage and key model domains.

Prerequisites
- Backend source access.

Instructions
## Database Engine
- MongoDB with Mongoose ODM.

## Core Model Domains
- User and identity: `User`, `Admin`, `SellerVerification`
- Marketplace: `Product`, `Category`, `Image`, `Promotion`, `Banner`
- Engagement: `Favorite`, `Review`, `Report`, `Notification`-like model patterns
- Messaging: `Chat`, `Message`
- Analytics/traffic: `PageView`, `Search`, `Visitor`, `Transaction`, `AuditLog`

## Index and Maintenance Utilities
- Text index repair: `npm --prefix server run repair:text-index`
- Email index repair: `npm --prefix server run fix:email-index`
- Seller backfill: `npm --prefix server run backfill:sellers`

Verification
- Model list aligns with `server/models/`.

Troubleshooting
- If schema drift is detected, update this overview with migration or index notes.
