# Vercel Production Hardening Design

## Goal

Deploy Hisabdar as a single Vercel project with a static Vite frontend and a same-origin Node.js serverless API backed by MongoDB Atlas, while closing the identified reliability, security, and test gaps.

## Architecture

Vercel serves `frontend/dist` at `/`. A root `api/index.js` serverless entrypoint imports the Express application without starting a long-lived listener; Vercel invokes this app for `/api/*` requests. The frontend uses a relative `/api` base URL in production, so browser requests share the site origin and do not rely on permissive CORS.

MongoDB Atlas is the sole persistent store. `MONGO_URI`, `JWT_SECRET`, and optional `GEMINI_API_KEY` are Vercel server-side environment variables. The only browser-exposed value is the relative API path, which contains no secret.

## Components

### API runtime

- Split Express application creation from process startup.
- Reuse a cached MongoDB connection across Vercel function invocations and fail requests cleanly when Atlas is unavailable.
- Retain `/health` as a database-aware readiness endpoint.
- Read proxy trust only from an explicit `TRUST_PROXY` environment flag. Rate limiting uses the resulting client IP and is documented as instance-local; Vercel Firewall is the production edge rate-limit layer.
- Keep strict input validation and record ownership rules.

### Frontend data flow

- Centralize client HTTP handling in the storage service.
- On API load failure, show an error state and preserve no fabricated demo data. The application must not render or mutate local seed data in production.
- On `401`, clear the stored token and force the sign-in screen.
- Align the registration form password minimum with the API's 12-character policy.
- Load the Reports page lazily so Recharts does not inflate the initial dashboard bundle.

### Testing

- Use Node's built-in test runner plus Supertest for API behavior.
- Test health/readiness, CORS rejection, authentication rejection, validation, and ownership-scoped CRUD behavior with mocked model boundaries where a live Atlas database is not available in CI.
- Add unit tests for client response handling and API-failure behavior where practical.
- Run backend tests, frontend type checking, production build, and dependency audits in GitHub Actions.

### Vercel configuration

- Add `vercel.json` with a Vite build command/output directory and a rewrite that routes `/api/:path*` to the Node function.
- Add an `api/index.js` function entrypoint and Vercel-specific environment documentation.
- Use Vercel Git integration for preview and production deployments; CI validates code before the Vercel deployment workflow runs.
- Do not add Docker as a Vercel deployment mechanism. Docker is not used by Vercel Functions and would add a second, untested runtime path.

## Error handling and security

- API failures are visible to the user and logged server-side; no automatic local-data fallback exists in production.
- Password/token errors return generic messages and clear invalid sessions.
- CORS defaults to the same deployed site origin, with explicit `CORS_ORIGIN` support for local and separate-origin development.
- Deployment documentation requires Atlas network access for Vercel, a 32+ character JWT secret, and separate preview versus production database credentials.

## Acceptance criteria

1. The Vercel build produces the Vite frontend and deploys `/api/health` as a serverless endpoint.
2. Production browser requests use `/api` and never contain a Gemini or database secret.
3. A failed API load displays an actionable error and never displays seed records.
4. Registration prevents passwords shorter than 12 characters before submission.
5. Automated CI runs API tests, TypeScript checks, build, and dependency audits.
6. The initial application bundle no longer contains the Reports/Recharts chunk.
7. Documentation includes exact Vercel and Atlas environment-variable setup and deployment validation steps.
