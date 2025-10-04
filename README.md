# Travel Planner — Client (React)

A modern React client for the Travel Planner application. Build itineraries, collaborate with friends, see live weather and forecasts, and manage trips with a delightful UI.

This package is the client half of the project. It expects the API server to run alongside it.

## Quick start

1. Clone both repos (client + server) and install dependencies

```bash
# Client
npm install

# In a separate terminal, start the server first
# (see server README for details)
```

2. Create a client `.env` (you can start from `.env.example`)

```dotenv
# API base for production or when FORCE_API_URL is set
REACT_APP_API_URL=http://localhost:5000/api

# In development the client uses CRA proxy (/api -> http://localhost:5000)
# unless you explicitly set REACT_APP_FORCE_API_URL=true
# REACT_APP_FORCE_API_URL=true

# Optional (client-side fallbacks; server also exposes /api/public-config)
REACT_APP_CLOUDINARY_CLOUD_NAME=
REACT_APP_CLOUDINARY_UPLOAD_PRESET=

# Optional Google OAuth (used by GoogleAuth component)
REACT_APP_GOOGLE_CLIENT_ID=
```

3. Start the dev servers

```bash
# Start API server first (port 5000)
# Then start the client (port 3000)
npm start
```

Open http://localhost:3000

## How the client discovers configuration

- In development, API calls go to `/api/*` and are proxied to `http://localhost:5000` via the `proxy` field in `package.json`.
- You can force the client to use `REACT_APP_API_URL` even in development by setting `REACT_APP_FORCE_API_URL=true`.
- Cloudinary configuration is fetched at runtime from the server at `GET /api/public-config` (non‑sensitive), with build‑time env as a fallback.

## Features

- AI‑ready trip planning UX (search, destinations, itinerary views)
- Real‑time collaboration (Socket.IO)
- Weather
  - Current conditions + 5‑day forecast
  - °C/°F toggle and "last updated" indicator
  - Geolocation support and quick city chips
- Media
  - Cloudinary for avatars and images (client fetches config at runtime)
- Polished UI
  - Tailwind CSS and custom components

## Scripts

```bash
npm start       # Start CRA dev server
npm run build   # Production build
npm test        # CRA test runner (if tests are present)
```

## Environment variables (client)

| Variable | Purpose | Required |
|---------|---------|----------|
| REACT_APP_API_URL | API base used in production or when forcing in dev | Recommended |
| REACT_APP_FORCE_API_URL | Force using REACT_APP_API_URL in development (disables proxy) | Optional |
| REACT_APP_CLOUDINARY_CLOUD_NAME | Fallback cloud name (server runtime config preferred) | Optional |
| REACT_APP_CLOUDINARY_UPLOAD_PRESET | Fallback unsigned preset (if you use unsigned uploads) | Optional |
| REACT_APP_GOOGLE_CLIENT_ID | Enables GoogleAuth button | Optional |

Notes:
- Secrets (API keys, Cloudinary secrets) must NOT be embedded in the client. The server should handle signed operations.
- The client supports unsigned uploads only if you configure a secure preset with limited permissions.

## Server expectations

The client expects these endpoints (see server project):

- `GET /api/health` — health check
- `GET /api/public-config` — public runtime config: `{ cloudinaryCloudName, cloudinaryUploadPreset }`
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me` (client also falls back to `/api/users/*` if 404)
- Weather: `/api/weather/current/:city`, `/api/weather/forecast/:city`, `/api/weather/coordinates?lat=..&lon=..`
- Trips, Guides, Places, etc. (see `src/services/api.js` for the full list)

## Common issues & troubleshooting

- 404 on `/api/auth/login` in dev
  - Make sure the server is running on port 5000 and the client dev server (port 3000) was restarted after editing `package.json` `proxy`.
  - The client will try `/api/auth/login` and automatically fall back to `/api/users/login` on 404.
- CORS or PATCH preflight errors
  - Server must allow `PATCH` (already configured in the provided server code). Using CRA proxy avoids CORS in development.
- Cloudinary crash: "You must supply a cloudName" 
  - The client now lazy‑initializes Cloudinary and uses `/api/public-config`. It gracefully renders initials when config is not ready.

## Project structure (high level)

```
src/
  components/         # Reusable UI
  context/            # Auth & Socket contexts
  hooks/              # React hooks
  pages/              # Route-level components (Home, Planner, Guides, etc.)
  services/           # API, Cloudinary, sockets, public config loader
  styles/             # Tailwind config (tailwind.config.js)
public/
  index.html
```

## Code style & conventions

- The project uses Create React App with Tailwind.
- Prefer the proxy in development (`/api`) to avoid CORS pain.
- Avoid console logs in production; consider adding a small logger if you need structured logs.

## Deployment

1. Build the client:

```bash
npm run build
```

2. Serve the `build/` folder behind your preferred static host (Netlify, Vercel, NGINX, S3+CloudFront, etc.). Ensure the server API is reachable from the client (configure `REACT_APP_API_URL`).

## Security

- Never commit secrets. The client only uses `REACT_APP_*` variables, which are public at build time.
- Keep uploads server‑side signed when possible; only use unsigned presets with strict restrictions.

---

Made with ❤️ for travel planning.
