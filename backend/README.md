# Hisabdar Backend

Node.js + Express + TypeScript REST API for Hisabdar accounting application.

## Features

- 🔐 User authentication (register/login)
- 👥 Customer management API
- 📄 Invoice management API
- 💰 Expense tracking API
- 🔄 CORS enabled for frontend
- 💾 In-memory data storage
- ⚡ Fast development with tsx

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Server runs on http://localhost:3000

## Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
  ```json
  { "businessName": "string", "password": "string" }
  ```
- `POST /api/auth/login` - Login user
  ```json
  { "businessName": "string", "password": "string" }
  ```

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

## Tech Stack

- Node.js
- Express.js
- TypeScript
- tsx (TypeScript execution)
- CORS

## Testing

Run the test script:
```bash
node test.js
```

## Project Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── customers.ts
│   │   ├── invoices.ts
│   │   └── expenses.ts
│   ├── server.ts
│   ├── store.ts
│   └── types.ts
├── package.json
└── tsconfig.json
```
