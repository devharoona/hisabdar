import { Router } from 'express';
import { users } from '../store.js';

export const authRouter = Router();

authRouter.post('/register', (req, res) => {
  const { businessName, password } = req.body;
  
  if (users.find(u => u.businessName === businessName)) {
    return res.status(400).json({ error: 'Business name already exists' });
  }
  
  const user = { id: `u${Date.now()}`, businessName, password };
  users.push(user);
  res.status(201).json({ id: user.id, businessName: user.businessName });
});

authRouter.post('/login', (req, res) => {
  const { businessName, password } = req.body;
  const user = users.find(u => u.businessName === businessName && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  res.json({ id: user.id, businessName: user.businessName });
});
