import { AppData, Customer, Expense, Invoice, InvoiceStatus, Payment } from '../types';

const STORAGE_KEY = 'hisabdar_data_v3';
// To use the backend, set this environment variable in your build system or .env file
// e.g., VITE_API_URL=http://localhost:3001/api
const API_URL = import.meta.env.VITE_API_URL || '';

const getAuthHeaders = () => {
  const token = localStorage.getItem('hisabdar_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const INITIAL_DATA: AppData = {
  customers: [
    { id: 'c1', name: 'Al-Madina Supermarket', phone: '0300-1234567', email: 'contact@almadina.com', address: 'Shop 4, Main Market, Sadar' },
    { id: 'c2', name: 'Mohammad Ibrahim', phone: '0321-9876543', email: 'ibrahim.m@gmail.com', address: 'House 12, Street 5, Gulshan Colony' },
    { id: 'c3', name: 'Fatima Begum (Tailors)', phone: '0333-5551212', email: '', address: 'Near City Mosque, Old Town' },
    { id: 'c4', name: 'Rahim Construction', phone: '0345-1122334', email: 'rahim.builds@outlook.com', address: 'Plot 88, Industrial Estate' },
    { id: 'c5', name: 'Zainab Styles', phone: '0312-4455667', email: 'zainab@styles.com', address: 'Fashion Avenue, Mall Road' }
  ],
  invoices: [
    {
      id: 'inv101',
      customerId: 'c1',
      customerName: 'Al-Madina Supermarket',
      date: new Date(Date.now() - 86400000 * 15).toISOString().split('T')[0], 
      dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
      items: [
        { id: 'i1', description: 'Wholesale Rice Bags (50kg)', amount: 25000 },
        { id: 'i2', description: 'Cooking Oil Cartons', amount: 15000 }
      ],
      totalAmount: 40000,
      status: InvoiceStatus.OVERDUE
    },
    {
      id: 'inv102',
      customerId: 'c2',
      customerName: 'Mohammad Ibrahim',
      date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], 
      dueDate: new Date(Date.now() + 86400000 * 25).toISOString().split('T')[0],
      items: [{ id: 'i3', description: 'Home Repair Services', amount: 5500 }],
      totalAmount: 5500,
      status: InvoiceStatus.PENDING
    },
    {
      id: 'inv103',
      customerId: 'c4',
      customerName: 'Rahim Construction',
      date: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0], 
      dueDate: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
      items: [{ id: 'i4', description: 'Cement Bags x100', amount: 120000 }],
      totalAmount: 120000,
      status: InvoiceStatus.PAID
    },
    {
      id: 'inv104',
      customerId: 'c3',
      customerName: 'Fatima Begum (Tailors)',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], 
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      items: [{ id: 'i5', description: 'Fabric Supply (Cotton)', amount: 8500 }],
      totalAmount: 8500,
      status: InvoiceStatus.PENDING
    }
  ],
  expenses: [
    { id: 'e1', title: 'Shop Rent', amount: 25000, date: new Date().toISOString().split('T')[0], category: 'Rent' },
    { id: 'e2', title: 'Electricity Bill', amount: 4500, date: new Date().toISOString().split('T')[0], category: 'Other' },
    { id: 'e3', title: 'Tea & Refreshments', amount: 1200, date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], category: 'Supplies' },
    { id: 'e4', title: 'Bike Fuel', amount: 500, date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], category: 'Fuel' }
  ],
  payments: [
    { id: 'p1', customerId: 'c4', amount: 120000, date: new Date(Date.now() - 86400000 * 12).toISOString().split('T')[0], invoiceId: 'inv103', notes: 'Bank Transfer - Meezan' },
    { id: 'p2', customerId: 'c1', amount: 10000, date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0], notes: 'Partial Cash Payment' }
  ]
};

// --- Internal Local Storage Helper ---
const getLocalData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  try {
    const parsed = JSON.parse(stored);
    if (!parsed.payments) parsed.payments = [];
    return parsed;
  } catch {
    return INITIAL_DATA;
  }
};

const saveLocalData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// --- API Interface ---

export const api = {
  // General Data Load
  loadData: async (): Promise<AppData> => {
    if (API_URL) {
      try {
        const headers = getAuthHeaders();
        const [customers, invoices, expenses, payments] = await Promise.all([
          fetch(`${API_URL}/customers`, { headers }).then(async r => {
            if (!r.ok) throw new Error('Failed to load customers');
            return r.json();
          }),
          fetch(`${API_URL}/invoices`, { headers }).then(async r => {
            if (!r.ok) throw new Error('Failed to load invoices');
            return r.json();
          }),
          fetch(`${API_URL}/expenses`, { headers }).then(async r => {
            if (!r.ok) throw new Error('Failed to load expenses');
            return r.json();
          }),
          fetch(`${API_URL}/payments`, { headers }).then(async r => {
            if (!r.ok) throw new Error('Failed to load payments');
            return r.json();
          })
        ]);
        return { customers, invoices, expenses, payments };
      } catch (e) {
        console.error("API Load Failed, falling back to local", e);
        return getLocalData();
      }
    }
    return getLocalData();
  },

  // Customers
  createCustomer: async (c: Omit<Customer, 'id'>): Promise<Customer> => {
    const id = `c${Date.now()}`;
    const customer = { ...c, id };
    
    if (API_URL) {
      await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(customer)
      });
    } else {
      const data = getLocalData();
      data.customers.push(customer);
      saveLocalData(data);
    }
    return customer;
  },
  
  deleteCustomer: async (id: string): Promise<void> => {
    if (API_URL) {
      await fetch(`${API_URL}/customers/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    } else {
      const data = getLocalData();
      data.customers = data.customers.filter(c => c.id !== id);
      saveLocalData(data);
    }
  },

  // Invoices
  createInvoice: async (inv: Omit<Invoice, 'id'>): Promise<Invoice> => {
    const id = `inv${Date.now()}`;
    const invoice = { ...inv, id };
    
    if (API_URL) {
       await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(invoice)
      });
    } else {
      const data = getLocalData();
      data.invoices.unshift(invoice);
      saveLocalData(data);
    }
    return invoice;
  },

  updateInvoice: async (id: string, updates: Partial<Invoice>): Promise<void> => {
    if (API_URL) {
      await fetch(`${API_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
    } else {
      const data = getLocalData();
      data.invoices = data.invoices.map(i => i.id === id ? { ...i, ...updates } : i);
      saveLocalData(data);
    }
  },

  deleteInvoice: async (id: string): Promise<void> => {
    if (API_URL) {
      await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    } else {
      const data = getLocalData();
      data.invoices = data.invoices.filter(i => i.id !== id);
      saveLocalData(data);
    }
  },

  // Expenses
  createExpense: async (exp: Omit<Expense, 'id'>): Promise<Expense> => {
    const id = `exp${Date.now()}`;
    const expense = { ...exp, id };
    
    if (API_URL) {
      await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(expense)
      });
    } else {
      const data = getLocalData();
      data.expenses.unshift(expense);
      saveLocalData(data);
    }
    return expense;
  },

  updateExpense: async (id: string, updates: Partial<Expense>): Promise<void> => {
     if (API_URL) {
      await fetch(`${API_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
    } else {
      const data = getLocalData();
      data.expenses = data.expenses.map(e => e.id === id ? { ...e, ...updates } : e);
      saveLocalData(data);
    }
  },

  deleteExpense: async (id: string): Promise<void> => {
    if (API_URL) {
      await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    } else {
      const data = getLocalData();
      data.expenses = data.expenses.filter(e => e.id !== id);
      saveLocalData(data);
    }
  },

  // Payments
  createPayment: async (pay: Omit<Payment, 'id'>): Promise<Payment> => {
    const id = `pay${Date.now()}`;
    const payment = { ...pay, id };
    
    if (API_URL) {
      await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payment)
      });
    } else {
      const data = getLocalData();
      data.payments.push(payment);
      saveLocalData(data);
    }
    return payment;
  },

  updatePayment: async (id: string, updates: Partial<Payment>): Promise<void> => {
    if (API_URL) {
       await fetch(`${API_URL}/payments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
    } else {
       const data = getLocalData();
       data.payments = data.payments.map(p => p.id === id ? { ...p, ...updates } : p);
       saveLocalData(data);
    }
  },

  deletePayment: async (id: string): Promise<void> => {
    if (API_URL) {
      await fetch(`${API_URL}/payments/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    } else {
      const data = getLocalData();
      data.payments = data.payments.filter(p => p.id !== id);
      saveLocalData(data);
    }
  },
  
  // Full Restore (Only local for now)
  restoreData: (data: AppData) => {
      saveLocalData(data);
  },
  
  resetData: () => {
      saveLocalData(INITIAL_DATA);
  }
};