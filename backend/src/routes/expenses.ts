import { Router } from 'express';
import { data } from '../store.js';

export const expensesRouter = Router();

expensesRouter.get('/', (req, res) => {
  res.json(data.expenses);
});

expensesRouter.post('/', (req, res) => {
  const expense = { id: `e${Date.now()}`, ...req.body };
  data.expenses.push(expense);
  res.status(201).json(expense);
});

expensesRouter.put('/:id', (req, res) => {
  const idx = data.expenses.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.expenses[idx] = { ...data.expenses[idx], ...req.body };
  res.json(data.expenses[idx]);
});

expensesRouter.delete('/:id', (req, res) => {
  const idx = data.expenses.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.expenses.splice(idx, 1);
  res.status(204).send();
});
