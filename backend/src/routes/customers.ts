import { Router } from 'express';
import { data } from '../store.js';

export const customersRouter = Router();

customersRouter.get('/', (req, res) => {
  res.json(data.customers);
});

customersRouter.post('/', (req, res) => {
  const customer = { id: `c${Date.now()}`, ...req.body };
  data.customers.push(customer);
  res.status(201).json(customer);
});

customersRouter.put('/:id', (req, res) => {
  const idx = data.customers.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.customers[idx] = { ...data.customers[idx], ...req.body };
  res.json(data.customers[idx]);
});

customersRouter.delete('/:id', (req, res) => {
  const idx = data.customers.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.customers.splice(idx, 1);
  res.status(204).send();
});
