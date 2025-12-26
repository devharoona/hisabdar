import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Settings from './pages/Settings';
import { AppData, Customer, Invoice, Expense, PageView, InvoiceStatus, Payment } from './types';
import { api } from './services/storage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [data, setData] = useState<AppData>({ customers: [], invoices: [], expenses: [], payments: [] });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Load initial data & auth status
  useEffect(() => {
    const storedUser = localStorage.getItem('hisabdar_user');
    const storedToken = localStorage.getItem('hisabdar_token');
    if (storedUser && storedToken) {
      setBusinessName(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  // Load data after authentication
  useEffect(() => {
    if (isAuthenticated) {
      const load = async () => {
        setIsSyncing(true);
        const loaded = await api.loadData();
        setData(loaded);
        setIsSyncing(false);
      };
      load();
    }
  }, [isAuthenticated]);

  // Removed auto-save useEffect. Now we save imperatively via API.

  // --- Auth Actions ---

  const handleLogin = (name: string, token: string) => {
    localStorage.setItem('hisabdar_user', name);
    localStorage.setItem('hisabdar_token', token);
    setBusinessName(name);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('hisabdar_user');
    localStorage.removeItem('hisabdar_token');
    setIsAuthenticated(false);
    setBusinessName('');
    setCurrentPage('dashboard');
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

  // Backup & Restore
  const handleRestoreData = (newData: AppData) => {
      if (window.confirm("This will overwrite all current local data. Are you sure?")) {
          api.restoreData(newData);
          setData(newData);
          alert("Data restored successfully to local storage!");
      }
  };
  
  const handleResetData = () => {
      if(window.confirm("Reset all data to demo state?")) {
          api.resetData();
          window.location.reload();
      }
  }

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
        return <Reports data={data} />;
      case 'settings':
        return <Settings data={data} onRestore={handleRestoreData} onReset={handleResetData} />;
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
      {renderPage()}
    </Layout>
  );
};

export default App;