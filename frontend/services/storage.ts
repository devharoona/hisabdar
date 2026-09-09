import { AppData, Customer, Expense, Invoice, Payment } from '../types';
import { API_URL } from './apiConfig';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('hisabdar_token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

function clearSessionOnUnauthorized(status: number) {
  if (status !== 401) return;
  localStorage.removeItem('hisabdar_user');
  localStorage.removeItem('hisabdar_token');
  window.dispatchEvent(new Event('hisabdar:unauthorized'));
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers }
    });
  } catch {
    throw new ApiError('Unable to reach Hisabdar. Check your connection and try again.', 0);
  }

  const body = await response.json().catch(() => ({}));
  clearSessionOnUnauthorized(response.status);
  if (!response.ok) throw new ApiError(body.error || 'Request failed. Please try again.', response.status);
  return body as T;
}

const recordPath = (type: string, id: string) => `/${type}/${encodeURIComponent(id)}`;

export const api = {
  async loadData(): Promise<AppData> {
    const [customers, invoices, expenses, payments] = await Promise.all([
      request<Customer[]>('/customers'),
      request<Invoice[]>('/invoices'),
      request<Expense[]>('/expenses'),
      request<Payment[]>('/payments')
    ]);
    return { customers, invoices, expenses, payments };
  },

  createCustomer: (customer: Omit<Customer, 'id'>) => request<Customer>('/customers', { method: 'POST', body: JSON.stringify(customer) }),
  deleteCustomer: (id: string) => request<void>(recordPath('customers', id), { method: 'DELETE' }),

  createInvoice: (invoice: Omit<Invoice, 'id'>) => request<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(invoice) }),
  updateInvoice: (id: string, updates: Partial<Invoice>) => request<Invoice>(recordPath('invoices', id), { method: 'PUT', body: JSON.stringify(updates) }),
  deleteInvoice: (id: string) => request<void>(recordPath('invoices', id), { method: 'DELETE' }),

  createExpense: (expense: Omit<Expense, 'id'>) => request<Expense>('/expenses', { method: 'POST', body: JSON.stringify(expense) }),
  updateExpense: (id: string, updates: Partial<Expense>) => request<Expense>(recordPath('expenses', id), { method: 'PUT', body: JSON.stringify(updates) }),
  deleteExpense: (id: string) => request<void>(recordPath('expenses', id), { method: 'DELETE' }),

  createPayment: (payment: Omit<Payment, 'id'>) => request<Payment>('/payments', { method: 'POST', body: JSON.stringify(payment) }),
  updatePayment: (id: string, updates: Partial<Payment>) => request<Payment>(recordPath('payments', id), { method: 'PUT', body: JSON.stringify(updates) }),
  deletePayment: (id: string) => request<void>(recordPath('payments', id), { method: 'DELETE' })
};
