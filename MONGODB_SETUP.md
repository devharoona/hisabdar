# MERN Stack Setup - Hisabdar

## Stack Overview

- **M**ongoDB - Database
- **E**xpress - Backend Framework
- **R**eact - Frontend Library
- **N**ode.js - Runtime

## Prerequisites

1. Node.js 16+ installed
2. MongoDB installed or MongoDB Atlas account

## MongoDB Setup

### Option 1: Local MongoDB

**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB runs as Windows service automatically
4. Use URI: `mongodb://localhost:27017/hisabdar`

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Option 2: MongoDB Atlas (Cloud - Free)

1. Sign up: https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP: 0.0.0.0/0 (allow all)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/hisabdar
   ```

## Installation

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/hisabdar
JWT_SECRET=hisabdar_secret_2024_change_in_production
PORT=3001
```

Start backend:
```bash
npm start
```

Should see:
```
Server running on http://localhost:3001
MongoDB connected
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:3001/api
```

Start frontend:
```bash
npm run dev
```

Open: http://localhost:3000

## Usage

1. **Register:** Create account with business name, email, password
2. **Login:** Sign in with credentials
3. **Add Customers:** Create customer accounts
4. **Record Transactions:** Track sales (You Gave) and payments (You Got)
5. **Manage Expenses:** Record business expenses
6. **View Reports:** See financial analytics

## Features

### Authentication
- JWT token-based auth
- Secure password hashing (bcrypt)
- 7-day token expiry
- Protected API routes

### Data Isolation
- Each user has separate data
- Multi-tenant architecture
- Secure user sessions

### UI Features
- Dark theme design
- Mobile responsive
- Print statements
- WhatsApp integration
- CSV export
- Backup/restore

## Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED
```
**Solution:** Ensure MongoDB is running
```bash
# Windows: Check Services
# Mac/Linux:
sudo systemctl status mongodb
```

### Port Already in Use
```
Error: Port 3001 already in use
```
**Solution:** Change PORT in backend/.env

### CORS Error
```
Access-Control-Allow-Origin error
```
**Solution:** Backend already has CORS enabled, check API_URL in frontend/.env.local

## Production Deployment

### Backend
1. Use MongoDB Atlas
2. Change JWT_SECRET to strong random string
3. Set NODE_ENV=production
4. Deploy to Heroku/Railway/Render

### Frontend
1. Update VITE_API_URL to production backend URL
2. Build: `npm run build`
3. Deploy dist/ folder to Vercel/Netlify

## Security Notes

- Change JWT_SECRET in production
- Use strong passwords
- Enable MongoDB authentication
- Use HTTPS in production
- Whitelist specific IPs in MongoDB Atlas
- Never commit .env files

## Tech Details

### Backend Dependencies
- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT tokens
- cors - Cross-origin requests
- dotenv - Environment variables

### Frontend Dependencies
- react - UI library
- typescript - Type safety
- vite - Build tool
- lucide-react - Icons
- recharts - Charts

## Database Schema

### Users
```javascript
{
  businessName: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Customers
```javascript
{
  id: String,
  userId: ObjectId,
  name: String,
  phone: String,
  email: String,
  address: String
}
```

### Invoices
```javascript
{
  id: String,
  userId: ObjectId,
  customerId: String,
  customerName: String,
  date: String,
  dueDate: String,
  items: Array,
  totalAmount: Number,
  status: String,
  notes: String
}
```

### Expenses
```javascript
{
  id: String,
  userId: ObjectId,
  title: String,
  amount: Number,
  date: String,
  category: String
}
```

### Payments
```javascript
{
  id: String,
  userId: ObjectId,
  customerId: String,
  amount: Number,
  date: String,
  notes: String,
  invoiceId: String
}
```
