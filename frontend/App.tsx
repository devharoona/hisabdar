import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Expenses from './pages/Expenses';
import Login from './pages/Login';
import Settings from './pages/Settings';
import { AppData, Customer, Invoice, Expense, PageView, InvoiceStatus, Payment } from './types';
import { ApiError, api } from './services/storage';

const Reports = lazy(() => import('./pages/Reports'));

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [data, setData] = useState<AppData>({ customers: [], invoices: [], expenses: [], payments: [] });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const clearSession = useCallback(() => {
    localStorage.removeItem('hisabdar_user');
    localStorage.removeItem('hisabdar_token');
    setIsAuthenticated(false);
    setBusinessName('');
    setCurrentPage('dashboard');
  }, []);

  // Load initial data & auth status
  useEffect(() => {
    const storedUser = localStorage.getItem('hisabdar_user');
    const storedToken = localStorage.getItem('hisabdar_token');
    if (storedUser && storedToken) {
      setBusinessName(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('hisabdar:unauthorized', clearSession);
    return () => window.removeEventListener('hisabdar:unauthorized', clearSession);
  }, [clearSession]);

  // Load data after authentication
  const loadData = useCallback(async () => {
    setIsSyncing(true);
    setLoadError('');
    try {
      setData(await api.loadData());
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      setData({ customers: [], invoices: [], expenses: [], payments: [] });
      setLoadError(error instanceof Error ? error.message : 'Unable to load your business data.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) void loadData();
  }, [isAuthenticated, loadData]);

  // Removed auto-save useEffect. Now we save imperatively via API.

  // --- Auth Actions ---

  const handleLogin = (name: string, token: string) => {
    localStorage.setItem('hisabdar_user', name);
    localStorage.setItem('hisabdar_token', token);
    setBusinessName(name);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearSession();
  };

  // --- Data Actions (Async) ---

  // Customers
  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    const newCustomer = await api.createCustomer(customer);
    // Optimistic update or reload
    setData(prev => ({ ...prev, customers: [...prev.customers, newCustomer] }));
  };

  const deleteCustomer = async (id: string) => {
    if (window.confirm("Are you sure? This will not delete their existing invoices.")) {
      await api.deleteCustomer(id);
      setData(prev => ({ ...prev, customers: prev.customers.filter(c => c.id !== id) }));
    }
  };

  // Invoices (Sales/Udhar)
  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = await api.createInvoice(invoice);
    setData(prev => ({ ...prev, invoices: [newInvoice, ...prev.invoices] }));
  };

  const editInvoice = async (id: string, updatedInvoice: Partial<Invoice>) => {
      await api.updateInvoice(id, updatedInvoice);
      setData(prev => ({
          ...prev,
          invoices: prev.invoices.map(inv => inv.id === id ? { ...inv, ...updatedInvoice } : inv)
      }));
  };

  const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    // If marking as PAID, also create a Payment record automatically
    if (status === InvoiceStatus.PAID) {
        const inv = data.invoices.find(i => i.id === id);
        if (inv && inv.status !== InvoiceStatus.PAID) {
            const paymentData = {
                customerId: inv.customerId,
                amount: inv.totalAmount,
                date: new Date().toISOString().split('T')[0],
                invoiceId: inv.id,
                notes: `Payment for Invoice #${inv.id}`
            };
            
            const newPayment = await api.createPayment(paymentData);
            await api.updateInvoice(id, { status });

            setData(prev => ({
                ...prev,
                invoices: prev.invoices.map(i => i.id === id ? { ...i, status } : i),
                payments: [...prev.payments, newPayment]
            }));
            return;
        }
    }

    await api.updateInvoice(id, { status });
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.map(inv => inv.id === id ? { ...inv, status } : inv)
    }));
  };

  const deleteInvoice = async (id: string) => {
    if (window.confirm("Delete this invoice/transaction?")) {
      await api.deleteInvoice(id);
      setData(prev => ({ ...prev, invoices: prev.invoices.filter(i => i.id !== id) }));
    }
  };

  // Payments (Jama)
  const addPayment = async (payment: Omit<Payment, 'id'>) => {
      const newPayment = await api.createPayment(payment);
      setData(prev => ({ ...prev, payments: [...prev.payments, newPayment] }));
  };

  const editPayment = async (id: string, updatedPayment: Partial<Payment>) => {
      await api.updatePayment(id, updatedPayment);
      setData(prev => ({
          ...prev,
          payments: prev.payments.map(p => p.id === id ? { ...p, ...updatedPayment } : p)
      }));
  };

  const deletePayment = async (id: string) => {
      if (window.confirm("Delete this payment?")) {
          await api.deletePayment(id);
          setData(prev => ({ ...prev, payments: prev.payments.filter(p => p.id !== id) }));
      }
  };

  // Expenses
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense = await api.createExpense(expense);
    setData(prev => ({ ...prev, expenses: [newExpense, ...prev.expenses] }));
  };

  const editExpense = async (id: string, updatedExpense: Partial<Expense>) => {
    await api.updateExpense(id, updatedExpense);
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(exp => exp.id === id ? { ...exp, ...updatedExpense } : exp)
    }));
  };

  const deleteExpense = async (id: string) => {
    if (window.confirm("Delete this expense record?")) {
      await api.deleteExpense(id);
      setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
    }
  };

  // --- Router Render ---

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard data={data} />;
      case 'customers':
        return <Customers 
          data={data} 
          onAddCustomer={addCustomer} 
          onDeleteCustomer={deleteCustomer} 
          onAddPayment={addPayment} 
          onEditPayment={editPayment}
          onDeletePayment={deletePayment}
          onAddInvoice={addInvoice} 
          onEditInvoice={editInvoice}
          onDeleteInvoice={deleteInvoice}
        />;
      case 'invoices':
        return <Invoices data={data} onAddInvoice={addInvoice} onUpdateStatus={updateInvoiceStatus} onDeleteInvoice={deleteInvoice} />;
      case 'expenses':
        return <Expenses data={data} onAddExpense={addExpense} onEditExpense={editExpense} onDeleteExpense={deleteExpense} />;
      case 'reports':
        return <Suspense fallback={<div className="p-6 text-stone-400">Loading reports…</div>}><Reports data={data} /></Suspense>;
      case 'settings':
        return <Settings data={data} />;
      default:
        return <Dashboard data={data} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={(p) => setCurrentPage(p)}
      onLogout={handleLogout}
      businessName={businessName}
    >
      {isSyncing && <div className="fixed top-0 left-0 w-full h-1 bg-amber-500 animate-pulse z-50"></div>}
      {loadError ? (
        <div className="m-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-100" role="alert">
          <h2 className="font-semibold">Your data could not be loaded</h2>
          <p className="mt-1 text-sm text-rose-200">{loadError}</p>
          <button onClick={() => void loadData()} className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium hover:bg-rose-500">Try again</button>
        </div>
      ) : renderPage()}
    </Layout>
  );
};

export default App;
