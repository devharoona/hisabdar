# Hisabdar - Business Ledger & Accounting App

MERN stack accounting application for small businesses.

## Tech Stack

- **MongoDB** - Database
- **Express** - Backend API
- **React** - Frontend UI
- **Node.js** - Runtime

## Project Structure

```
hisabdar/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Express + MongoDB + JWT Auth
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)

### Setup

**1. Install MongoDB:**
- Local: https://www.mongodb.com/try/download/community
- Cloud: https://www.mongodb.com/cloud/atlas (free tier)

**2. Backend:**
```bash
cd backend
npm install
# Edit .env with your MongoDB URI
npm start
```

**3. Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**4. Open:** http://localhost:3000

## Features

- 🔐 JWT Authentication
- 👥 Customer Management (Hisab Books)
- 📄 Invoice Creation & Tracking
- 💰 Payment Recording (Jama)
- 💸 Expense Tracking
- 📊 Financial Reports
- 📱 WhatsApp Reminders
- 🖨️ Print/PDF Export
- 💾 Backup/Restore
- 🌙 Dark Theme UI

## Environment Setup

**Backend (.env):**
```env
MONGO_URI=mongodb://localhost:27017/hisabdar
JWT_SECRET=your_secret_key
PORT=3001
```

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:3001/api
```

## Documentation

See `MONGODB_SETUP.md` for detailed setup instructions.
