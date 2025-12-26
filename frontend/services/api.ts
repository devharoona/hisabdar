import { AppData, Customer, Invoice, Expense } from '../types';

const API_URL = 'http://localhost:3000/api';

export const api = {
  async fetchAll(): Promise<AppData> {
    const [customers, invoices, expenses] = await Promise.all([
      fetch(`${API_URL}/customers`).then(r => r.json()),
      fetch(`${API_URL}/invoices`).then(r => r.json()),
      fetch(`${API_URL}/expenses`).then(r => r.json())
    ]);
    return { customers, invoices, expenses };
  },

  async addCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const res = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    return res.json();
  },

  async deleteCustomer(id: string): Promise<void> {
    await fetch(`${API_URL}/customers/${id}`, { method: 'DELETE' });
  },

  async addInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    const res = await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice)
    });
    return res.json();
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const res = await fetch(`${API_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteInvoice(id: string): Promise<void> {
    await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE' });
  },

  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const res = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    return res.json();
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const res = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteExpense(id: string): Promise<void> {
    await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
  }
};
