# Hisabdar Frontend

React + TypeScript + Vite frontend for Hisabdar accounting application.

## Features

- 🔐 User authentication (login/register)
- 👥 Customer management
- 📄 Invoice creation and tracking
- 💰 Expense management
- 📊 Dashboard with analytics
- 📈 Reports and insights
- 🤖 AI-powered payment reminders (Gemini)
- 🖨️ Print/PDF invoice generation
- ✅ Bulk operations with checkboxes

## Prerequisites

- Node.js (v16 or higher)
- Backend server running on `http://localhost:3000`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in `.env.local`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173

## Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS (via inline styles)
- Lucide React (icons)
- Google Gemini AI
- Recharts (analytics)

## API Integration

The frontend connects to the backend API at `http://localhost:3000/api`:

- `/auth/login` - User authentication
- `/auth/register` - User registration
- `/customers` - Customer CRUD
- `/invoices` - Invoice CRUD
- `/expenses` - Expense CRUD
