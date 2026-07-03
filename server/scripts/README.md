# Server Scripts

## seed-dev-accounts.js

This script seeds official development-only accounts for local development.

### Accounts created/updated

- Admin
  - email: `dev-admin@example.com`
  - password: `AdminPass123!`
  - role: `admin`
  - emailVerified: `true`
  - isActive: `true`

- Seller
  - email: `dev-seller@example.com`
  - password: `SellerPass123!`
  - role: `seller`
  - sellerVerificationStatus: `verified`
  - emailVerified: `true`
  - isActive: `true`

- Buyer
  - email: `dev-buyer@example.com`
  - password: `BuyerPass123!`
  - role: `user`
  - emailVerified: `true`
  - isActive: `true`

### How to run

```bash
cd server
set NODE_ENV=development&& npm run seed:dev
```

### Safety guard

The script checks `NODE_ENV` and exits if it is not `development`. Production environments are protected and will not be modified.
