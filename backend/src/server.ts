import express from 'express';
import cors from 'cors';
import { customersRouter } from './routes/customers.js';
import { invoicesRouter } from './routes/invoices.js';
import { expensesRouter } from './routes/expenses.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Hisabdar API running' });
});

app.use('/api/customers', customersRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/expenses', expensesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
