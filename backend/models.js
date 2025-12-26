const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  businessName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const customerSchema = new mongoose.Schema({
  id: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  phone: String,
  email: String,
  address: String
});

const invoiceSchema = new mongoose.Schema({
  id: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerId: String,
  customerName: String,
  date: String,
  dueDate: String,
  items: Array,
  totalAmount: Number,
  status: String,
  notes: String
});

const expenseSchema = new mongoose.Schema({
  id: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  amount: Number,
  date: String,
  category: String
});

const paymentSchema = new mongoose.Schema({
  id: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerId: String,
  amount: Number,
  date: String,
  notes: String,
  invoiceId: String
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Customer: mongoose.model('Customer', customerSchema),
  Invoice: mongoose.model('Invoice', invoiceSchema),
  Expense: mongoose.model('Expense', expenseSchema),
  Payment: mongoose.model('Payment', paymentSchema)
};
