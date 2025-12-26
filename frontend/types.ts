export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export enum InvoiceStatus {
  PAID = 'Paid',
  PENDING = 'Pending',
  OVERDUE = 'Overdue'
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string; // Denormalized for easier display
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: 'Fuel' | 'Maintenance' | 'Rent' | 'Supplies' | 'Other';
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  notes?: string;
  invoiceId?: string; // Optional link to specific invoice
}

export type PageView = 'dashboard' | 'customers' | 'invoices' | 'expenses' | 'reports' | 'settings';

export interface AppData {
  customers: Customer[];
  invoices: Invoice[];
  expenses: Expense[];
  payments: Payment[];
}