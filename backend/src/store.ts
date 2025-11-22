import { AppData, InvoiceStatus, User } from './types.js';

export const users: User[] = [];


export const data: AppData = {
  customers: [
    { id: 'c1', name: 'Ab Rashid', phone: '55555-10101', email: 'contact@rashid.com', address: '123 Kunzer Way' },
    { id: 'c2', name: 'Gh Mohammad', phone: '555-0102', email: 'ghmohd@example.com', address: '456 Hevanabad' },
  ],
  invoices: [
    {
      id: 'inv1',
      customerId: 'c1',
      customerName: 'Ab Rashid',
      date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
      items: [{ id: 'i1', description: 'Consulting Services', amount: 500 }],
      totalAmount: 500,
      status: InvoiceStatus.PENDING
    },
    {
      id: 'inv2',
      customerId: 'c2',
      customerName: 'Gh Mohammad',
      date: new Date(Date.now() - 86400000 * 20).toISOString().split('T')[0],
      dueDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
      items: [{ id: 'i2', description: 'House Repair', amount: 10000 }],
      totalAmount: 10000,
      status: InvoiceStatus.PAID
    }
  ],
  expenses: [
    { id: 'e1', title: 'Office Rent', amount: 1000, date: new Date().toISOString().split('T')[0], category: 'Rent' },
    { id: 'e2', title: 'Internet', amount: 60, date: new Date().toISOString().split('T')[0], category: 'Other' }
  ]
};
