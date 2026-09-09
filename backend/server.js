require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Customer, Invoice, Expense, Payment } = require('./models');
const { authMiddleware, getJwtSecret } = require('./auth');
const { assertValid, sanitizeCustomer, sanitizeExpense, sanitizeInvoice, sanitizePayment } = require('./validation');

const app = express();
const PORT = Number(process.env.API_PORT || process.env.PORT || 3001);
const dbConnectTimeoutMs = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000);
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.CORS_ORIGIN || (isProduction ? '' : 'http://localhost:3000'))
  .split(',').map((origin) => origin.trim()).filter(Boolean);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error('PORT must be a valid TCP port');
if (isProduction && !process.env.MONGO_URI) throw new Error('MONGO_URI must be set in production');
if (isProduction && allowedOrigins.length === 0) throw new Error('CORS_ORIGIN must be set in production');
getJwtSecret();

app.disable('x-powered-by');
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin is not allowed by CORS'));
}, methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '100kb' }));

const loginAttempts = new Map();
function limitLogin(req, res, next) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const current = loginAttempts.get(key) || { count: 0, startedAt: now };
  if (now - current.startedAt > 15 * 60 * 1000) Object.assign(current, { count: 0, startedAt: now });
  current.count += 1;
  loginAttempts.set(key, current);
  if (current.count > 10) return res.status(429).json({ error: 'Too many authentication attempts. Try again later.' });
  return next();
}

const publicUser = (user) => ({ id: user._id.toString(), businessName: user.businessName });
const publicRecord = (record) => {
  const object = record.toObject ? record.toObject() : record;
  const { _id, __v, userId, ...safe } = object;
  return safe;
};
async function assertCustomerOwned(customerId, userId) {
  assertValid(await Customer.exists({ id: customerId, userId }), 'Customer was not found');
}

app.get('/health', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'unavailable' }));

app.post('/api/auth/register', limitLogin, async (req, res, next) => {
  try {
    const { businessName, email, password } = req.body || {};
    assertValid(typeof businessName === 'string' && businessName.trim().length >= 2 && businessName.trim().length <= 120, 'Business name must be 2 to 120 characters');
    assertValid(typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254, 'A valid email is required');
    assertValid(typeof password === 'string' && password.length >= 12 && password.length <= 128, 'Password must be 12 to 128 characters');
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedBusinessName = businessName.trim();
    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { businessName: normalizedBusinessName }] });
    if (existingUser) return res.status(409).json({ error: 'An account with that email or business name already exists' });
    const user = await User.create({ businessName: normalizedBusinessName, email: normalizedEmail, password: await bcrypt.hash(password, 12) });
    const token = jwt.sign({ userId: user._id.toString() }, getJwtSecret(), { expiresIn: '7d', issuer: 'hisabdar', audience: 'hisabdar-web' });
    return res.status(201).json({ token, ...publicUser(user) });
  } catch (error) { return next(error); }
});

app.post('/api/auth/login', limitLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    assertValid(typeof email === 'string' && typeof password === 'string', 'Email and password are required');
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ userId: user._id.toString() }, getJwtSecret(), { expiresIn: '7d', issuer: 'hisabdar', audience: 'hisabdar-web' });
    return res.json({ token, ...publicUser(user) });
  } catch (error) { return next(error); }
});

// All accounting records are scoped to the authenticated business. IDs and totals are server-owned.
app.get('/api/customers', authMiddleware, async (req, res, next) => { try { res.json((await Customer.find({ userId: req.userId }).sort({ createdAt: -1 })).map(publicRecord)); } catch (error) { next(error); } });
app.post('/api/customers', authMiddleware, async (req, res, next) => { try { const customer = await Customer.create({ ...sanitizeCustomer(req.body), id: crypto.randomUUID(), userId: req.userId }); res.status(201).json(publicRecord(customer)); } catch (error) { next(error); } });
app.put('/api/customers/:id', authMiddleware, async (req, res, next) => { try { const customer = await Customer.findOneAndUpdate({ id: req.params.id, userId: req.userId }, sanitizeCustomer(req.body, { partial: true }), { new: true, runValidators: true }); if (!customer) return res.status(404).json({ error: 'Customer not found' }); return res.json(publicRecord(customer)); } catch (error) { return next(error); } });
app.delete('/api/customers/:id', authMiddleware, async (req, res, next) => { try { const customer = await Customer.findOneAndDelete({ id: req.params.id, userId: req.userId }); if (!customer) return res.status(404).json({ error: 'Customer not found' }); return res.status(204).send(); } catch (error) { return next(error); } });

app.get('/api/invoices', authMiddleware, async (req, res, next) => { try { res.json((await Invoice.find({ userId: req.userId }).sort({ date: -1, createdAt: -1 })).map(publicRecord)); } catch (error) { next(error); } });
app.post('/api/invoices', authMiddleware, async (req, res, next) => { try { const invoiceData = sanitizeInvoice(req.body); await assertCustomerOwned(invoiceData.customerId, req.userId); const invoice = await Invoice.create({ ...invoiceData, id: crypto.randomUUID(), userId: req.userId }); res.status(201).json(publicRecord(invoice)); } catch (error) { next(error); } });
app.put('/api/invoices/:id', authMiddleware, async (req, res, next) => { try { const changes = sanitizeInvoice(req.body, { partial: true }); if (changes.customerId) await assertCustomerOwned(changes.customerId, req.userId); const invoice = await Invoice.findOneAndUpdate({ id: req.params.id, userId: req.userId }, changes, { new: true, runValidators: true }); if (!invoice) return res.status(404).json({ error: 'Invoice not found' }); return res.json(publicRecord(invoice)); } catch (error) { return next(error); } });
app.delete('/api/invoices/:id', authMiddleware, async (req, res, next) => { try { const invoice = await Invoice.findOneAndDelete({ id: req.params.id, userId: req.userId }); if (!invoice) return res.status(404).json({ error: 'Invoice not found' }); return res.status(204).send(); } catch (error) { return next(error); } });

app.get('/api/expenses', authMiddleware, async (req, res, next) => { try { res.json((await Expense.find({ userId: req.userId }).sort({ date: -1, createdAt: -1 })).map(publicRecord)); } catch (error) { next(error); } });
app.post('/api/expenses', authMiddleware, async (req, res, next) => { try { const expense = await Expense.create({ ...sanitizeExpense(req.body), id: crypto.randomUUID(), userId: req.userId }); res.status(201).json(publicRecord(expense)); } catch (error) { next(error); } });
app.put('/api/expenses/:id', authMiddleware, async (req, res, next) => { try { const expense = await Expense.findOneAndUpdate({ id: req.params.id, userId: req.userId }, sanitizeExpense(req.body, { partial: true }), { new: true, runValidators: true }); if (!expense) return res.status(404).json({ error: 'Expense not found' }); return res.json(publicRecord(expense)); } catch (error) { return next(error); } });
app.delete('/api/expenses/:id', authMiddleware, async (req, res, next) => { try { const expense = await Expense.findOneAndDelete({ id: req.params.id, userId: req.userId }); if (!expense) return res.status(404).json({ error: 'Expense not found' }); return res.status(204).send(); } catch (error) { return next(error); } });

app.get('/api/payments', authMiddleware, async (req, res, next) => { try { res.json((await Payment.find({ userId: req.userId }).sort({ date: -1, createdAt: -1 })).map(publicRecord)); } catch (error) { next(error); } });
app.post('/api/payments', authMiddleware, async (req, res, next) => { try { const paymentData = sanitizePayment(req.body); await assertCustomerOwned(paymentData.customerId, req.userId); if (paymentData.invoiceId) assertValid(await Invoice.exists({ id: paymentData.invoiceId, userId: req.userId }), 'Invoice was not found'); const payment = await Payment.create({ ...paymentData, id: crypto.randomUUID(), userId: req.userId }); res.status(201).json(publicRecord(payment)); } catch (error) { next(error); } });
app.put('/api/payments/:id', authMiddleware, async (req, res, next) => { try { const changes = sanitizePayment(req.body, { partial: true }); if (changes.customerId) await assertCustomerOwned(changes.customerId, req.userId); if (changes.invoiceId) assertValid(await Invoice.exists({ id: changes.invoiceId, userId: req.userId }), 'Invoice was not found'); const payment = await Payment.findOneAndUpdate({ id: req.params.id, userId: req.userId }, changes, { new: true, runValidators: true }); if (!payment) return res.status(404).json({ error: 'Payment not found' }); return res.json(publicRecord(payment)); } catch (error) { return next(error); } });
app.delete('/api/payments/:id', authMiddleware, async (req, res, next) => { try { const payment = await Payment.findOneAndDelete({ id: req.params.id, userId: req.userId }); if (!payment) return res.status(404).json({ error: 'Payment not found' }); return res.status(204).send(); } catch (error) { return next(error); } });

app.post('/api/ai/generate', authMiddleware, async (req, res, next) => {
  try {
    const { prompt } = req.body || {};
    assertValid(typeof prompt === 'string' && prompt.length > 0 && prompt.length <= 2000, 'Invalid AI request');
    if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI assistance is not configured' });
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) return res.status(502).json({ error: 'AI assistance is temporarily unavailable' });
    const body = await response.json();
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(502).json({ error: 'AI assistance returned an empty response' });
    return res.json({ text });
  } catch (error) { return next(error); }
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((error, req, res, next) => {
  if (error.message === 'Origin is not allowed by CORS') return res.status(403).json({ error: error.message });
  if (error.code === 11000) return res.status(409).json({ error: 'A record with that value already exists' });
  const status = error.statusCode || (error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500);
  if (status >= 500) console.error(error);
  return res.status(status).json({ error: status >= 500 ? 'Internal server error' : error.message });
});

let connectionPromise;
async function connectDb() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hisabdar', { serverSelectionTimeoutMS: dbConnectTimeoutMs })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }
  return connectionPromise;
}

async function start() {
  await connectDb();
  const server = app.listen(PORT, () => console.log(`Hisabdar API listening on port ${PORT}`));
  const shutdown = async (signal) => { console.log(`${signal} received; shutting down`); server.close(async () => { await mongoose.disconnect(); process.exit(0); }); };
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
}

if (require.main === module) start().catch((error) => { console.error('Unable to start API:', error.message); process.exit(1); });
module.exports = { app, connectDb, start };
