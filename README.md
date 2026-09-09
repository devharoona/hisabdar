# Hisabdar

Business ledger and accounting application for small businesses.

## Architecture

```text
Browser
  │
  ├── Vite + React static frontend (Vercel)
  │       │ relative /api requests
  │
  └── Node.js serverless API (Vercel /api/[...path])
          │
          └── MongoDB Atlas
```

The frontend and API share the same Vercel origin in production. API requests therefore use `/api` and do not expose database or AI credentials to the browser.

## Environment variables

Set these in Vercel Project Settings → Environment Variables. Do not commit their values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB Atlas connection string. Allow Vercel network access in Atlas. |
| `JWT_SECRET` | Yes | Random secret with at least 32 characters. |
| `GEMINI_API_KEY` | No | Enables server-side AI reminders and insights. |
| `CORS_ORIGIN` | Local/separate origin only | Comma-separated browser origins allowed to call the API. Same-origin Vercel use does not need it. |
| `TRUST_PROXY` | Optional | Set `true` only when running behind a trusted reverse proxy. |

Use distinct Atlas databases and JWT secrets for Preview and Production. Vercel Firewall should provide production edge rate limiting; the API's login limiter is instance-local and is only a secondary safeguard.

## Run locally

Prerequisite: Node.js 18.17+ and a MongoDB instance (Atlas or local).

```bash
npm install --prefix backend
cd frontend && npm install && npm run dev
```

In a second terminal, start the API:

```bash
API_PORT=4000 MONGO_URI="mongodb+srv://..." JWT_SECRET="a-random-secret-with-at-least-32-characters" node api/local-server.js
```

The frontend defaults to `http://localhost:4000/api`. To use another API origin locally, create `frontend/.env.local` with `VITE_API_URL=http://localhost:4000/api`.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the GitHub repository. Keep the repository root as the project root.
3. Add `MONGO_URI` and `JWT_SECRET` for Production and Preview. Add optional `GEMINI_API_KEY` only if AI assistance is wanted.
4. In MongoDB Atlas, permit connections from Vercel and create separate databases/users for preview and production.
5. Deploy. Vercel builds `frontend/dist` and exposes the Node function at `/api/*` automatically.

GitHub Actions runs tests, type checks, production build, and dependency audits on pull requests and `main`. Vercel Git integration creates previews from branches and production deployments from `main`.

## Validate a deployment

```bash
curl -i https://your-project.vercel.app/api/health
```

Expect `200 {"status":"ok"}` when Atlas is connected. Then create an account and add a customer. To test outage behavior, temporarily use an invalid API URL in a preview build: the application must show its data-load error panel and must not render demo records.

## Checks

```bash
npm test --prefix backend
npm exec --prefix frontend -- tsc --noEmit -p tsconfig.json
npm run build --prefix frontend
```
