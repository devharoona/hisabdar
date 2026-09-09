# Hisabdar Backend

## Tech Stack
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs

## Setup

```bash
npm install
npm test
npm start
```

## Environment

Copy `.env.example` to `.env` and set:
```env
MONGO_URI=mongodb://localhost:27017/hisabdar
JWT_SECRET=a-long-random-secret-of-at-least-32-characters
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Auth
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user

### Protected (Requires JWT)
- GET/POST `/api/customers`
- DELETE `/api/customers/:id`
- GET/POST `/api/invoices`
- PUT/DELETE `/api/invoices/:id`
- GET/POST `/api/expenses`
- PUT/DELETE `/api/expenses/:id`
- GET/POST `/api/payments`
- PUT/DELETE `/api/payments/:id`

### Operations

- `GET /health` returns `200` only when MongoDB is connected.
- Production requires `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, and `CORS_ORIGIN`.
- Optional AI assistance uses `GEMINI_API_KEY` on the server; do not put this key in frontend environment variables.
