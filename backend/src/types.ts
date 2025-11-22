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
  customerName: string;
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

export interface User {
  id: string;
  businessName: string;
  password: string;
}

export interface AppData {
  customers: Customer[];
  invoices: Invoice[];
  expenses: Expense[];
}
