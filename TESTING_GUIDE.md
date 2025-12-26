# Testing Guide - Hisabdar MERN Stack

## Pre-Testing Checklist

### 1. MongoDB Running
```bash
# Windows: Check Services or run
mongod --version

# Mac/Linux
sudo systemctl status mongodb
```

### 2. Environment Files Configured
- `backend/.env` exists with MONGO_URI, JWT_SECRET, PORT
- `frontend/.env.local` exists with VITE_API_URL

### 3. Dependencies Installed
```bash
cd backend && npm install
cd frontend && npm install
```

## Backend Testing

### Test 1: MongoDB Connection
```bash
cd backend
node test-db.js
```
Expected: ✅ MongoDB connected successfully

### Test 2: Start Backend Server
```bash
npm start
```
Expected: 
```
Server running on http://localhost:3001
MongoDB connected
```

### Test 3: Register User (Postman/curl)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Test Shop","email":"test@test.com","password":"test123"}'
```
Expected: `{"token":"...", "businessName":"Test Shop"}`

### Test 4: Login User
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```
Expected: `{"token":"...", "businessName":"Test Shop"}`

### Test 5: Protected Route (Get Customers)
```bash
curl http://localhost:3001/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
Expected: `[]` (empty array for new user)

### Test 6: Create Customer
```bash
curl -X POST http://localhost:3001/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"id":"c1","name":"Test Customer","phone":"1234567890","email":"customer@test.com","address":"Test Address"}'
```
Expected: Customer object returned

## Frontend Testing

### Test 1: Start Frontend
```bash
cd frontend
npm run dev
```
Expected: Server running on http://localhost:3000

### Test 2: Open Browser
Navigate to: http://localhost:3000

### Test 3: Register New User
1. Click "Don't have an account? Register"
2. Fill in:
   - Business Name: "My Test Shop"
   - Email: "myshop@test.com"
   - Password: "password123"
3. Click "Create Account"

Expected: Redirected to dashboard

### Test 4: Logout and Login
1. Click Logout
2. Login with same credentials
Expected: Successfully logged in

### Test 5: Create Customer
1. Go to "Hisab Books"
2. Click "Add New Hisab"
3. Fill in customer details
4. Click "Save Hisab"

Expected: Customer appears in list

### Test 6: Add Transaction (You Gave)
1. Click on customer
2. Click "You Gave" button
3. Enter amount and details
4. Click "Save Udhar"

Expected: Transaction appears in ledger

### Test 7: Add Payment (You Got)
1. Click "You Got" button
2. Enter amount
3. Click "Save Payment"

Expected: Payment appears, balance updates

### Test 8: Create Invoice
1. Go to "Invoices"
2. Click "New Invoice"
3. Select customer
4. Add items
5. Click "Create Invoice"

Expected: Invoice created

### Test 9: Add Expense
1. Go to "Expenses"
2. Click "Add Expense"
3. Fill details
4. Click "Save Expense"

Expected: Expense appears in list

### Test 10: View Reports
1. Go to "Reports"
Expected: Charts and data display correctly

## Integration Testing

### Test 1: Data Persistence
1. Create customer in frontend
2. Refresh page
3. Check if customer still exists

Expected: Data persists

### Test 2: Multi-User Isolation
1. Register User A
2. Create customer for User A
3. Logout
4. Register User B
5. Check customers list

Expected: User B sees empty list (no User A data)

### Test 3: Token Expiry
1. Login
2. Wait 7 days (or modify JWT expiry to 1 minute for testing)
3. Try to create customer

Expected: Token expired error, redirect to login

### Test 4: Offline Mode
1. Stop backend server
2. Try to create customer in frontend

Expected: Falls back to localStorage

## Browser Console Testing

### Check for Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Perform actions

Expected: No red errors

### Check Network Requests
1. Open DevTools Network tab
2. Create customer
3. Check request/response

Expected: 
- POST to /api/customers
- Status 200
- Response contains customer object

### Check LocalStorage
1. Open DevTools Application tab
2. Check Local Storage
3. Look for:
   - `hisabdar_token`
   - `hisabdar_user`

Expected: Both keys present after login

## Performance Testing

### Test 1: Load Time
1. Clear cache
2. Reload page
3. Check Network tab

Expected: Page loads < 2 seconds

### Test 2: Large Dataset
1. Create 100+ customers
2. Navigate to Hisab Books

Expected: Page remains responsive

## Mobile Testing

### Test 1: Responsive Design
1. Open DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on different screen sizes

Expected: UI adapts correctly

### Test 2: Touch Interactions
1. Test on actual mobile device
2. Try all buttons and forms

Expected: All interactions work

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution:** 
- Check MongoDB is running
- Verify MONGO_URI in .env
- Check firewall settings

### Issue: CORS Error
**Solution:**
- Verify backend is running on port 3001
- Check VITE_API_URL in frontend/.env.local
- Restart both servers

### Issue: Token Not Working
**Solution:**
- Check token in localStorage
- Verify JWT_SECRET matches in backend
- Try logout and login again

### Issue: Data Not Persisting
**Solution:**
- Check MongoDB connection
- Verify API calls in Network tab
- Check backend logs for errors

### Issue: Frontend Not Loading
**Solution:**
- Check console for errors
- Verify all dependencies installed
- Try `npm install` again

## Automated Testing (Future)

### Backend Tests (Jest)
```bash
npm test
```

### Frontend Tests (Vitest)
```bash
npm run test
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

## Production Testing

Before deploying:
- [ ] All tests pass
- [ ] No console errors
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Database backed up
- [ ] Error logging configured
- [ ] Performance optimized
