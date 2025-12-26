require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Customer, Invoice, Expense, Payment } = require('./models');
const { authMiddleware, JWT_SECRET } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hisabdar';

app.use(cors());
app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Auth Routes ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { businessName, email, password } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { businessName }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ businessName, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, businessName: user.businessName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, businessName: user.businessName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Protected Routes ---

app.get('/api/customers', authMiddleware, async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.userId });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', authMiddleware, async (req, res) => {
  try {
    const customer = new Customer({ ...req.body, userId: req.userId });
    await customer.save();
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', authMiddleware, async (req, res) => {
  try {
    await Customer.deleteOne({ id: req.params.id, userId: req.userId });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/invoices', authMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.userId });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', authMiddleware, async (req, res) => {
  try {
    const invoice = new Invoice({ ...req.body, userId: req.userId });
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/invoices/:id', authMiddleware, async (req, res) => {
  try {
    await Invoice.updateOne({ id: req.params.id, userId: req.userId }, req.body);
    res.json({ message: 'Invoice updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/invoices/:id', authMiddleware, async (req, res) => {
  try {
    await Invoice.deleteOne({ id: req.params.id, userId: req.userId });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/expenses', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', authMiddleware, async (req, res) => {
  try {
    const expense = new Expense({ ...req.body, userId: req.userId });
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/expenses/:id', authMiddleware, async (req, res) => {
  try {
    await Expense.updateOne({ id: req.params.id, userId: req.userId }, req.body);
    res.json({ message: 'Expense updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', authMiddleware, async (req, res) => {
  try {
    await Expense.deleteOne({ id: req.params.id, userId: req.userId });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/payments', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', authMiddleware, async (req, res) => {
  try {
    const payment = new Payment({ ...req.body, userId: req.userId });
    await payment.save();
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/payments/:id', authMiddleware, async (req, res) => {
  try {
    await Payment.updateOne({ id: req.params.id, userId: req.userId }, req.body);
    res.json({ message: 'Payment updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/payments/:id', authMiddleware, async (req, res) => {
  try {
    await Payment.deleteOne({ id: req.params.id, userId: req.userId });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
