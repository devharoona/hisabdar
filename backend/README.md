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
npm start
```

## Environment

Create `.env`:
```env
MONGO_URI=mongodb://localhost:27017/hisabdar
JWT_SECRET=your_secret_key
PORT=3001
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
