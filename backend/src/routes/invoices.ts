import { Router } from 'express';
import { data } from '../store.js';

export const invoicesRouter = Router();

invoicesRouter.get('/', (req, res) => {
  res.json(data.invoices);
});

invoicesRouter.post('/', (req, res) => {
  const invoice = { id: `inv${Date.now()}`, ...req.body };
  data.invoices.push(invoice);
  res.status(201).json(invoice);
});

invoicesRouter.put('/:id', (req, res) => {
  const idx = data.invoices.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.invoices[idx] = { ...data.invoices[idx], ...req.body };
  res.json(data.invoices[idx]);
});

invoicesRouter.delete('/:id', (req, res) => {
  const idx = data.invoices.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.invoices.splice(idx, 1);
  res.status(204).send();
});
