# Marketplace-Kh

A marketplace application with separate frontend, backend, and database modules.

# KH-Product

A marketplace application with separate frontend, backend, and database modules.

## Deployment

Below are copy-paste friendly steps and example env values to deploy the project (backend, frontend) and provision a MongoDB Atlas cluster.

1) MongoDB Atlas (choose a free or paid tier)

- Create a new cluster in MongoDB Atlas.
- Create a database user with a strong password.
- In Network Access, allow access from your deployment platform (or `0.0.0.0/0` for quick testing).
- Get the connection string and replace `<user>`, `<password>`, and `<cluster>` in the examples below.

Example `MONGO_URI`:

```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/marketplace-kh?retryWrites=true&w=majority
```

2) Backend (Render or Railway)

- Use the `server/` folder as the service root. The server expects environment variables listed in `server/.env.production.example`.
- Local quick test:

```bash
cd server
cp .env.production.example .env
# edit .env to set MONGO_URI, JWT_SECRET, CLIENT_ORIGIN
npm install
npm run dev   # or: npm start for production
```

- Recommended backend env variables (set in Render/Railway UI):

```
PORT=4000
MONGO_URI=<mongo_connection_string>
CLIENT_ORIGIN=https://<your-vercel-domain>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10
UPLOAD_DIR=uploads
NODE_ENV=production
```

Render quick notes:
- You can add a `render.yaml` (included at repo root) and create a Web Service that points to the `server` folder.
- Build: `npm install` (inside `server`), Start: `npm start`.

Railway quick notes:
- Create a new project -> Deploy from GitHub -> select `server` folder.
- Add the same environment variables in Railway's dashboard.

3) Frontend (Vercel)

- Create a new Vercel project connecting your GitHub repo.
- Set the project root to `client` (if Vercel asks for a root).
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable (Vercel project settings):

```
VITE_API_BASE_URL=https://<your-backend-domain>/api
```

- Note: `client/src/services/api.ts` uses `import.meta.env.VITE_API_BASE_URL` and `withCredentials: true`.
	Ensure `CLIENT_ORIGIN` on the server matches your Vercel domain, and enable CORS to allow credentials.

4) Smoke tests / verification

- After deployment set `VITE_API_BASE_URL` and `CLIENT_ORIGIN` correctly.
- Visit the Vercel URL and verify pages load and API calls succeed (use browser devtools network tab to check cookie and CORS headers).

5) If you want me to generate platform-specific env JSON or copy/paste entries for Render / Railway / Vercel, tell me which provider and I will produce them ready to paste.

- `client` — frontend application
- `server` — backend application
- `database` — schema, migrations, and seed data
- `docs` — project documentation

## Getting started

Add your frontend, backend, and database implementations in the appropriate folders.
