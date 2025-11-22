import { AppData, Customer, Expense, Invoice, InvoiceStatus } from '../types';

const STORAGE_KEY = 'easybooks_data_v1';

const INITIAL_DATA: AppData = {
  customers: [
    { id: 'c1', name: 'Acme Corp', phone: '555-0101', email: 'contact@acme.com', address: '123 Industry Way' },
    { id: 'c2', name: 'John Doe', phone: '555-0102', email: 'john@example.com', address: '456 Maple Ave' },
  ],
  invoices: [
    {
      id: 'inv1',
      customerId: 'c1',
      customerName: 'Acme Corp',
      date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], // 5 days ago
      dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
      items: [{ id: 'i1', description: 'Consulting Services', amount: 500 }],
      totalAmount: 500,
      status: InvoiceStatus.PENDING
    },
    {
      id: 'inv2',
      customerId: 'c2',
      customerName: 'John Doe',
      date: new Date(Date.now() - 86400000 * 20).toISOString().split('T')[0], 
      dueDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
      items: [{ id: 'i2', description: 'Website Repair', amount: 150 }],
      totalAmount: 150,
      status: InvoiceStatus.PAID
    }
  ],
  expenses: [
    { id: 'e1', title: 'Office Rent', amount: 1000, date: new Date().toISOString().split('T')[0], category: 'Rent' },
    { id: 'e2', title: 'Internet', amount: 60, date: new Date().toISOString().split('T')[0], category: 'Other' }
  ]
};

export const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return INITIAL_DATA;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse storage", e);
    return INITIAL_DATA;
  }
};

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};