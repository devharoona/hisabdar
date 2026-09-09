const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  businessName: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
  password: { type: String, required: true, select: false }
}, { timestamps: true, strict: 'throw' });

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  phone: { type: String, trim: true, maxlength: 40 },
  email: { type: String, trim: true, maxlength: 254 },
  address: { type: String, trim: true, maxlength: 500 }
}, { timestamps: true, strict: 'throw' });
customerSchema.index({ userId: 1, id: 1 }, { unique: true });

const invoiceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true, trim: true, maxlength: 120 },
  date: { type: String, required: true },
  dueDate: { type: String, required: true },
  items: [{ id: { type: String, maxlength: 100 }, description: { type: String, required: true, maxlength: 500 }, amount: { type: Number, required: true, min: 0.01 } }],
  totalAmount: { type: Number, required: true, min: 0.01 },
  status: { type: String, required: true, enum: ['Paid', 'Pending', 'Overdue'] },
  notes: { type: String, trim: true, maxlength: 2000 }
}, { timestamps: true, strict: 'throw' });
invoiceSchema.index({ userId: 1, id: 1 }, { unique: true });

const expenseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  amount: { type: Number, required: true, min: 0.01 },
  date: { type: String, required: true },
  category: { type: String, required: true, enum: ['Fuel', 'Maintenance', 'Rent', 'Supplies', 'Other'] }
}, { timestamps: true, strict: 'throw' });
expenseSchema.index({ userId: 1, id: 1 }, { unique: true });

const paymentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customerId: { type: String, required: true },
  amount: { type: Number, required: true, min: 0.01 },
  date: { type: String, required: true },
  notes: { type: String, trim: true, maxlength: 2000 },
  invoiceId: { type: String, maxlength: 100 }
}, { timestamps: true, strict: 'throw' });
paymentSchema.index({ userId: 1, id: 1 }, { unique: true });

module.exports = {
  User: mongoose.model('User', userSchema),
  Customer: mongoose.model('Customer', customerSchema),
  Invoice: mongoose.model('Invoice', invoiceSchema),
  Expense: mongoose.model('Expense', expenseSchema),
  Payment: mongoose.model('Payment', paymentSchema)
};
