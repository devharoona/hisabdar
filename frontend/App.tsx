import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Settings from './pages/Settings';
import { AppData, Customer, Invoice, Expense, PageView, InvoiceStatus } from './types';
import { api } from './services/api';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [data, setData] = useState<AppData>({ customers: [], invoices: [], expenses: [] });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('hisabdar_user');
    if (storedUser) {
      setBusinessName(storedUser);
      setIsAuthenticated(true);
    }
    api.fetchAll().then(setData).catch(console.error);
  }, []);

  // --- Auth Actions ---

  const handleLogin = (name: string) => {
    localStorage.setItem('hisabdar_user', name);
    setBusinessName(name);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('hisabdar_user');
    setIsAuthenticated(false);
    setBusinessName('');
    setCurrentPage('dashboard');
  };

  // --- Data Actions ---

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    const newCustomer = await api.addCustomer(customer);
    setData(prev => ({ ...prev, customers: [...prev.customers, newCustomer] }));
  };

  const deleteCustomer = async (id: string) => {
    if (window.confirm("Are you sure? This will not delete their existing invoices.")) {
      await api.deleteCustomer(id);
      setData(prev => ({ ...prev, customers: prev.customers.filter(c => c.id !== id) }));
    }
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = await api.addInvoice(invoice);
    setData(prev => ({ ...prev, invoices: [newInvoice, ...prev.invoices] }));
  };

  const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    await api.updateInvoice(id, { status });
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.map(inv => inv.id === id ? { ...inv, status } : inv)
    }));
  };

  const deleteInvoice = async (id: string) => {
    if (window.confirm("Delete this invoice?")) {
      await api.deleteInvoice(id);
      setData(prev => ({ ...prev, invoices: prev.invoices.filter(i => i.id !== id) }));
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense = await api.addExpense(expense);
    setData(prev => ({ ...prev, expenses: [newExpense, ...prev.expenses] }));
  };

  const editExpense = async (id: string, updatedExpense: Omit<Expense, 'id'>) => {
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
        return <Customers data={data} onAddCustomer={addCustomer} onDeleteCustomer={deleteCustomer} />;
      case 'invoices':
        return <Invoices data={data} onAddInvoice={addInvoice} onUpdateStatus={updateInvoiceStatus} onDeleteInvoice={deleteInvoice} />;
      case 'expenses':
        return <Expenses data={data} onAddExpense={addExpense} onEditExpense={editExpense} onDeleteExpense={deleteExpense} />;
      case 'reports':
        return <Reports data={data} />;
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
      {renderPage()}
    </Layout>
  );
};

export default App;