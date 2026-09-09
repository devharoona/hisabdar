const INVOICE_STATUSES = new Set(['Paid', 'Pending', 'Overdue']);
const EXPENSE_CATEGORIES = new Set(['Fuel', 'Maintenance', 'Rent', 'Supplies', 'Other']);

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isNonEmptyString = (value, maxLength = 255) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
const isOptionalString = (value, maxLength = 2000) => value === undefined || (typeof value === 'string' && value.trim().length <= maxLength);
const isDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const isAmount = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 1000000000;

function assertValid(condition, message) {
  if (!condition) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
}

function cleanString(value) { return typeof value === 'string' ? value.trim() : value; }

function sanitizeCustomer(input, { partial = false } = {}) {
  assertValid(isPlainObject(input), 'Invalid customer data');
  const result = {};
  for (const key of ['name', 'phone', 'email', 'address']) if (input[key] !== undefined) result[key] = cleanString(input[key]);
  if (!partial || result.name !== undefined) assertValid(isNonEmptyString(result.name, 120), 'Customer name is required and must be 120 characters or fewer');
  if (result.phone !== undefined) assertValid(isOptionalString(result.phone, 40), 'Invalid phone number');
  if (result.email !== undefined) assertValid(isOptionalString(result.email, 254), 'Invalid email');
  if (result.address !== undefined) assertValid(isOptionalString(result.address, 500), 'Invalid address');
  return result;
}

function sanitizeInvoice(input, { partial = false } = {}) {
  assertValid(isPlainObject(input), 'Invalid invoice data');
  const result = {};
  for (const key of ['customerId', 'customerName', 'date', 'dueDate', 'status', 'notes']) if (input[key] !== undefined) result[key] = cleanString(input[key]);
  if (input.items !== undefined) {
    assertValid(Array.isArray(input.items) && input.items.length > 0 && input.items.length <= 100, 'Invoice must contain between 1 and 100 items');
    result.items = input.items.map((item) => {
      assertValid(isPlainObject(item) && isNonEmptyString(item.description, 500) && isAmount(item.amount), 'Each invoice item needs a description and a positive amount');
      return { id: typeof item.id === 'string' ? item.id.slice(0, 100) : undefined, description: item.description.trim(), amount: item.amount };
    });
    result.totalAmount = result.items.reduce((total, item) => total + item.amount, 0);
  }
  if (!partial || result.customerId !== undefined) assertValid(isNonEmptyString(result.customerId, 100), 'A customer is required');
  if (!partial || result.customerName !== undefined) assertValid(isNonEmptyString(result.customerName, 120), 'Customer name is required');
  if (!partial || result.date !== undefined) assertValid(isDate(result.date), 'Invalid invoice date');
  if (!partial || result.dueDate !== undefined) assertValid(isDate(result.dueDate), 'Invalid due date');
  if (!partial || result.items !== undefined) assertValid(Array.isArray(result.items), 'Invoice items are required');
  if (result.status !== undefined) assertValid(INVOICE_STATUSES.has(result.status), 'Invalid invoice status');
  if (result.notes !== undefined) assertValid(isOptionalString(result.notes), 'Notes are too long');
  return result;
}

function sanitizeExpense(input, { partial = false } = {}) {
  assertValid(isPlainObject(input), 'Invalid expense data');
  const result = {};
  for (const key of ['title', 'amount', 'date', 'category']) if (input[key] !== undefined) result[key] = cleanString(input[key]);
  if (!partial || result.title !== undefined) assertValid(isNonEmptyString(result.title, 200), 'Expense title is required');
  if (!partial || result.amount !== undefined) assertValid(isAmount(result.amount), 'Expense amount must be positive');
  if (!partial || result.date !== undefined) assertValid(isDate(result.date), 'Invalid expense date');
  if (!partial || result.category !== undefined) assertValid(EXPENSE_CATEGORIES.has(result.category), 'Invalid expense category');
  return result;
}

function sanitizePayment(input, { partial = false } = {}) {
  assertValid(isPlainObject(input), 'Invalid payment data');
  const result = {};
  for (const key of ['customerId', 'amount', 'date', 'notes', 'invoiceId']) if (input[key] !== undefined) result[key] = cleanString(input[key]);
  if (!partial || result.customerId !== undefined) assertValid(isNonEmptyString(result.customerId, 100), 'A customer is required');
  if (!partial || result.amount !== undefined) assertValid(isAmount(result.amount), 'Payment amount must be positive');
  if (!partial || result.date !== undefined) assertValid(isDate(result.date), 'Invalid payment date');
  if (result.notes !== undefined) assertValid(isOptionalString(result.notes), 'Notes are too long');
  if (result.invoiceId !== undefined) assertValid(isOptionalString(result.invoiceId, 100), 'Invalid invoice reference');
  return result;
}

module.exports = { assertValid, sanitizeCustomer, sanitizeExpense, sanitizeInvoice, sanitizePayment };
