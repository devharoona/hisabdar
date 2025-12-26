import React, { useState } from 'react';
import { Plus, Search, Trash2, User, FileText, ArrowRightLeft, Download, X, ArrowUpRight, ArrowDownLeft, MessageCircle, Pencil } from 'lucide-react';
import { AppData, Customer, Payment, Invoice, InvoiceStatus } from '../types';

interface CustomersProps {
  data: AppData;
  onAddCustomer: (c: Omit<Customer, 'id'>) => void;
  onDeleteCustomer: (id: string) => void;
  
  // Payment Actions
  onAddPayment: (p: Omit<Payment, 'id'>) => void;
  onEditPayment: (id: string, p: Partial<Payment>) => void;
  onDeletePayment: (id: string) => void;
  
  // Invoice/Sale Actions
  onAddInvoice: (i: Omit<Invoice, 'id'>) => void;
  onEditInvoice: (id: string, i: Partial<Invoice>) => void;
  onDeleteInvoice: (id: string) => void;
}

const Customers: React.FC<CustomersProps> = ({ 
    data, 
    onAddCustomer, 
    onDeleteCustomer, 
    onAddPayment, 
    onEditPayment,
    onDeletePayment,
    onAddInvoice,
    onEditInvoice,
    onDeleteInvoice
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null); // For Ledger View
  
  // Transaction Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  
  // Forms for Transactions
  const [editingId, setEditingId] = useState<string | null>(null); // Tracks if we are editing a specific ID
  
  const [newPayment, setNewPayment] = useState({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [newSale, setNewSale] = useState({ amount: '', date: new Date().toISOString().split('T')[0], description: '' });

  const filteredCustomers = data.customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Helpers ---

  const openAddSale = () => {
      setEditingId(null);
      setNewSale({ amount: '', date: new Date().toISOString().split('T')[0], description: '' });
      setIsSaleModalOpen(true);
  }

  const openEditSale = (inv: Invoice) => {
      setEditingId(inv.id);
      setNewSale({ 
          amount: inv.totalAmount.toString(), 
          date: inv.date, 
          description: inv.items[0]?.description || 'Sale' 
      });
      setIsSaleModalOpen(true);
  }

  const openAddPayment = () => {
      setEditingId(null);
      setNewPayment({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
      setIsPaymentModalOpen(true);
  }

  const openEditPayment = (pay: Payment) => {
      setEditingId(pay.id);
      setNewPayment({
          amount: pay.amount.toString(),
          date: pay.date,
          notes: pay.notes || ''
      });
      setIsPaymentModalOpen(true);
  }

  const sendWhatsAppReminder = (balance: number) => {
      if (!selectedCustomer) return;
      const phone = selectedCustomer.phone.replace(/\D/g, ''); // Strip non-digits
      if (phone.length < 10) {
          alert("Invalid phone number for this customer.");
          return;
      }
      
      const text = `Hello ${selectedCustomer.name}, your pending balance with us is ₹${balance}. Please pay at your earliest convenience. Thank you.`;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  }

  // --- Handlers ---

  const handleSubmitCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name) return;
    onAddCustomer(newCustomer);
    setNewCustomer({ name: '', email: '', phone: '', address: '' });
    setIsAddModalOpen(false);
  };

  // "You Got" (Credit / Payment)
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.amount || !selectedCustomer) return;
    
    const amountVal = parseFloat(newPayment.amount);

    if (editingId) {
        onEditPayment(editingId, {
            amount: amountVal,
            date: newPayment.date,
            notes: newPayment.notes
        });
    } else {
        onAddPayment({
          customerId: selectedCustomer.id,
          amount: amountVal,
          date: newPayment.date,
          notes: newPayment.notes
        });
    }

    setNewPayment({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setIsPaymentModalOpen(false);
    setEditingId(null);
  };

  // "You Gave" (Debit / Sale)
  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newSale.amount || !selectedCustomer) return;

    const amountVal = parseFloat(newSale.amount);
    
    if (editingId) {
        // Editing existing Invoice
        onEditInvoice(editingId, {
            date: newSale.date,
            totalAmount: amountVal,
            items: [{
                id: Date.now().toString(),
                description: newSale.description || 'Udhar / Sale',
                amount: amountVal
            }]
        });
    } else {
        // Creating new Invoice
        onAddInvoice({
            customerId: selectedCustomer.id,
            customerName: selectedCustomer.name,
            date: newSale.date,
            dueDate: newSale.date, // Due immediately for Khata/Hisab entries
            totalAmount: amountVal,
            status: InvoiceStatus.PENDING,
            items: [{
                id: Date.now().toString(),
                description: newSale.description || 'Udhar / Sale',
                amount: amountVal
            }]
        });
    }

    setNewSale({ amount: '', date: new Date().toISOString().split('T')[0], description: '' });
    setIsSaleModalOpen(false);
    setEditingId(null);
  }

  const handlePrintStatement = () => {
    setTimeout(() => window.print(), 100);
  };

  // --- Render Logic ---

  // If a customer is selected, show the Ledger View (Hisab)
  if (selectedCustomer) {
    const customerInvoices = data.invoices.filter(i => i.customerId === selectedCustomer.id);
    const customerPayments = data.payments.filter(p => p.customerId === selectedCustomer.id);
    
    // Combine and sort by date
    const ledger = [
      ...customerInvoices.map(i => ({ 
        id: i.id, 
        date: i.date, 
        type: 'SALE', 
        description: i.items[0]?.description || `Invoice #${i.id.slice(-4)}`, 
        debit: i.totalAmount, 
        credit: 0,
        originalRef: i
      })),
      ...customerPayments.map(p => ({ 
        id: p.id, 
        date: p.date, 
        type: 'PAYMENT', 
        description: p.notes || 'Payment Received', 
        debit: 0, 
        credit: p.amount,
        originalRef: p
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let runningBalance = 0;
    const ledgerWithBalance = ledger.map(entry => {
      runningBalance += (entry.debit - entry.credit);
      return { ...entry, balance: runningBalance };
    });

    const totalDebits = customerInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalCredits = customerPayments.reduce((sum, p) => sum + p.amount, 0);
    const netBalance = totalDebits - totalCredits;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
          <div className="w-full md:w-auto">
            <button onClick={() => setSelectedCustomer(null)} className="text-stone-400 hover:text-white mb-2 flex items-center gap-1 text-sm">
               ← Back to Customers
            </button>
            <h2 className="text-3xl font-bold text-stone-100 flex items-center gap-3">
              {selectedCustomer.name} <span className="text-lg font-normal text-stone-500 bg-stone-800 px-2 py-1 rounded">Hisab</span>
            </h2>
            <p className="text-stone-400">{selectedCustomer.phone} • {selectedCustomer.address}</p>
          </div>
          
          {/* Balance Display on Header for Mobile */}
          <div className="md:hidden w-full bg-stone-900 p-4 rounded-lg border border-stone-800 mb-2 flex justify-between items-center">
             <div>
                <p className="text-stone-400 text-xs uppercase">Net Balance Due</p>
                <p className={`text-2xl font-bold ${netBalance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    ₹{netBalance.toFixed(2)}
                </p>
             </div>
             {netBalance > 0 && (
                 <button 
                    onClick={() => sendWhatsAppReminder(netBalance)}
                    className="bg-green-600 text-white p-2 rounded-full shadow-lg"
                 >
                     <MessageCircle size={20} />
                 </button>
             )}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {netBalance > 0 && (
                 <button 
                    onClick={() => sendWhatsAppReminder(netBalance)}
                    className="hidden md:flex px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg items-center gap-2 transition-colors shadow-lg shadow-green-900/20"
                 >
                     <MessageCircle size={18} /> WhatsApp Reminder
                 </button>
             )}
             <button 
                onClick={handlePrintStatement}
                className="flex-1 md:flex-none px-4 py-2 border border-stone-700 rounded-lg text-stone-300 hover:bg-stone-800 flex items-center justify-center gap-2"
             >
                <Download size={18} /> <span className="md:hidden lg:inline">Statement</span>
             </button>
          </div>
        </div>

        {/* Desktop Balance Cards */}
        <div className="hidden md:grid grid-cols-3 gap-4 no-print">
          <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
            <p className="text-stone-500 text-sm">Total You Gave (Udhar)</p>
            <p className="text-2xl font-bold text-rose-400">₹{totalDebits.toFixed(2)}</p>
          </div>
          <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
            <p className="text-stone-500 text-sm">Total You Got (Jama)</p>
            <p className="text-2xl font-bold text-emerald-400">₹{totalCredits.toFixed(2)}</p>
          </div>
          <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
            <p className="text-stone-500 text-sm">Net Balance Due</p>
            <p className={`text-2xl font-bold ${netBalance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              ₹{netBalance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons Bar (Hisab Style) */}
        <div className="grid grid-cols-2 gap-4 no-print sticky top-0 md:relative z-10 bg-stone-950 py-2 md:py-0">
            <button 
                onClick={openAddSale}
                className="bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-rose-900/20 active:scale-95 transition-all"
            >
                <div className="flex items-center gap-2">
                    <ArrowUpRight size={24} />
                    <span className="font-bold text-lg">You Gave</span>
                </div>
                <span className="text-xs opacity-80">Add Sale / Udhar (Dr)</span>
            </button>

            <button 
                onClick={openAddPayment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
            >
                <div className="flex items-center gap-2">
                    <ArrowDownLeft size={24} />
                    <span className="font-bold text-lg">You Got</span>
                </div>
                <span className="text-xs opacity-80">Add Payment / Jama (Cr)</span>
            </button>
        </div>

        {/* Ledger Table */}
        <div className="bg-stone-900 rounded-xl shadow-lg border border-stone-800 overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                 <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 font-medium">
                    <tr>
                       <th className="p-4">Date</th>
                       <th className="p-4">Details</th>
                       <th className="p-4 text-right text-rose-500 bg-rose-500/5">You Gave</th>
                       <th className="p-4 text-right text-emerald-500 bg-emerald-500/5">You Got</th>
                       <th className="p-4 text-right">Balance</th>
                       <th className="p-4 text-right w-24 no-print">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-stone-800">
                    {ledgerWithBalance.slice().reverse().map((entry, idx) => (
                       <tr key={`${entry.type}-${entry.id}`} className="hover:bg-stone-800/50 transition-colors group">
                          <td className="p-4 text-stone-400 whitespace-nowrap">{entry.date}</td>
                          <td className="p-4">
                             <div className="font-medium text-stone-200">{entry.description}</div>
                             <div className="text-xs text-stone-500">{entry.type === 'SALE' ? 'Invoice/Sale' : 'Payment'}</div>
                          </td>
                          <td className="p-4 text-right text-rose-400 bg-rose-500/5 font-medium">
                              {entry.debit > 0 ? `₹${entry.debit.toFixed(2)}` : '-'}
                          </td>
                          <td className="p-4 text-right text-emerald-400 bg-emerald-500/5 font-medium">
                              {entry.credit > 0 ? `₹${entry.credit.toFixed(2)}` : '-'}
                          </td>
                          <td className="p-4 text-right font-bold text-stone-100">
                             {entry.balance.toFixed(2)}
                          </td>
                          <td className="p-4 text-right no-print">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => entry.type === 'SALE' ? openEditSale(entry.originalRef as Invoice) : openEditPayment(entry.originalRef as Payment)}
                                    className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded"
                                    title="Edit"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button 
                                    onClick={() => entry.type === 'SALE' ? onDeleteInvoice(entry.id) : onDeletePayment(entry.id)}
                                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                              </div>
                          </td>
                       </tr>
                    ))}
                    {ledger.length === 0 && (
                       <tr><td colSpan={6} className="p-8 text-center text-stone-500">No transactions yet. Use buttons above to add.</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Statement Print Template */}
        <div className="hidden print-only p-8 bg-white text-black">
            <h1 className="text-2xl font-bold mb-2">Statement of Account (Hisab)</h1>
            <div className="flex justify-between mb-8">
                <div>
                    <h2 className="font-bold text-lg">{selectedCustomer.name}</h2>
                    <p>{selectedCustomer.address}</p>
                    <p>{selectedCustomer.phone}</p>
                </div>
                <div className="text-right">
                    <p>Date: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
            <table className="w-full border-collapse mb-8">
                <thead>
                    <tr className="border-b border-black bg-gray-100">
                        <th className="text-left py-2 px-2">Date</th>
                        <th className="text-left py-2 px-2">Description</th>
                        <th className="text-right py-2 px-2">Debit (You Gave)</th>
                        <th className="text-right py-2 px-2">Credit (You Got)</th>
                        <th className="text-right py-2 px-2">Balance</th>
                    </tr>
                </thead>
                <tbody>
                {ledgerWithBalance.map((entry, idx) => (
                       <tr key={idx} className="border-b border-gray-200">
                          <td className="py-2 px-2">{entry.date}</td>
                          <td className="py-2 px-2">{entry.description}</td>
                          <td className="py-2 px-2 text-right">{entry.debit > 0 ? entry.debit.toFixed(2) : '-'}</td>
                          <td className="py-2 px-2 text-right">{entry.credit > 0 ? entry.credit.toFixed(2) : '-'}</td>
                          <td className="py-2 px-2 text-right">{entry.balance.toFixed(2)}</td>
                       </tr>
                    ))}
                </tbody>
            </table>
            <div className="text-right">
                <h3 className="text-xl font-bold">Net Balance: ₹{netBalance.toFixed(2)}</h3>
            </div>
        </div>

        {/* Payment Modal (Green) */}
        {isPaymentModalOpen && (
           <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm no-print">
              <div className="bg-stone-900 rounded-2xl shadow-2xl border border-stone-800 w-full max-w-sm">
                 <div className="p-6 border-b border-stone-800 bg-emerald-900/20">
                    <h3 className="text-lg font-bold text-emerald-400">{editingId ? 'Edit Payment' : 'Receive Payment (Jama)'}</h3>
                    <p className="text-sm text-stone-400">{editingId ? 'Update transaction' : `From ${selectedCustomer.name}`}</p>
                 </div>
                 <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
                    <div>
                       <label className="block text-sm font-medium text-stone-300 mb-1">Amount (₹)</label>
                       <input 
                          required
                          type="number" 
                          autoFocus
                          className="w-full p-3 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 outline-none text-lg"
                          value={newPayment.amount}
                          onChange={e => setNewPayment({...newPayment, amount: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-stone-300 mb-1">Date</label>
                       <input 
                          type="date" 
                          className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={newPayment.date}
                          onChange={e => setNewPayment({...newPayment, date: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-stone-300 mb-1">Notes</label>
                       <input 
                          type="text" 
                          placeholder="e.g. Cash, UPI..."
                          className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={newPayment.notes}
                          onChange={e => setNewPayment({...newPayment, notes: e.target.value})}
                       />
                    </div>
                    <div className="flex gap-3 pt-4">
                       <button 
                          type="button"
                          onClick={() => { setIsPaymentModalOpen(false); setEditingId(null); }}
                          className="flex-1 py-2 border border-stone-700 rounded-lg hover:bg-stone-800 text-stone-300"
                       >
                          Cancel
                       </button>
                       <button 
                          type="submit"
                          className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                       >
                          {editingId ? 'Update' : 'Save Payment'}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        )}

        {/* Sale Modal (Red) */}
        {isSaleModalOpen && (
           <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm no-print">
              <div className="bg-stone-900 rounded-2xl shadow-2xl border border-stone-800 w-full max-w-sm">
                 <div className="p-6 border-b border-stone-800 bg-rose-900/20">
                    <h3 className="text-lg font-bold text-rose-400">{editingId ? 'Edit Sale' : 'Give Udhar (Sale)'}</h3>
                    <p className="text-sm text-stone-400">{editingId ? 'Update transaction' : `To ${selectedCustomer.name}`}</p>
                 </div>
                 <form onSubmit={handleSubmitSale} className="p-6 space-y-4">
                    <div>
                       <label className="block text-sm font-medium text-stone-300 mb-1">Amount (₹)</label>
                       <input 
                          required
                          type="number" 
                          autoFocus
                          className="w-full p-3 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-rose-500 outline-none text-lg"
                          value={newSale.amount}
                          onChange={e => setNewSale({...newSale, amount: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-stone-300 mb-1">Details</label>
                       <input 
                          type="text" 
                          placeholder="e.g. Goods, Services..."
                          className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-rose-500 outline-none"
                          value={newSale.description}
                          onChange={e => setNewSale({...newSale, description: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-stone-300 mb-1">Date</label>
                       <input 
                          type="date" 
                          className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-rose-500 outline-none"
                          value={newSale.date}
                          onChange={e => setNewSale({...newSale, date: e.target.value})}
                       />
                    </div>
                    <div className="flex gap-3 pt-4">
                       <button 
                          type="button"
                          onClick={() => { setIsSaleModalOpen(false); setEditingId(null); }}
                          className="flex-1 py-2 border border-stone-700 rounded-lg hover:bg-stone-800 text-stone-300"
                       >
                          Cancel
                       </button>
                       <button 
                          type="submit"
                          className="flex-1 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-500"
                       >
                          {editingId ? 'Update' : 'Save Udhar'}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        )}
      </div>
    );
  }

  // --- Default Customer Grid View ---

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-100">Hisab Books</h2>
          <p className="text-stone-400">Select a customer to view their ledger or add a new one.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-amber-900/20 transition-all"
        >
          <Plus size={18} />
          Add New Hisab
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or phone..." 
          className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-stone-700 text-white rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-stone-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customer List - Unlimited Scrolling Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
        {filteredCustomers.map(customer => {
          const debits = data.invoices.filter(i => i.customerId === customer.id).reduce((sum, i) => sum + i.totalAmount, 0);
          const credits = data.payments.filter(p => p.customerId === customer.id).reduce((sum, p) => sum + p.amount, 0);
          const netBalance = debits - credits;

          return (
            <div 
                key={customer.id} 
                onClick={() => setSelectedCustomer(customer)}
                className="bg-stone-900 p-6 rounded-xl shadow-lg border border-stone-800 hover:border-amber-500/50 cursor-pointer group transition-all flex flex-col justify-between"
            >
              <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-amber-500/10 p-3 rounded-full text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <User size={24} />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDeleteCustomer(customer.id);
                        }} 
                        className="text-stone-500 hover:text-rose-500 p-1 transition-colors z-10"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-stone-100 mb-1">{customer.name}</h3>
                  <p className="text-sm text-stone-400 mb-4 min-h-[20px] truncate">{customer.phone || 'No Phone'}</p>
              </div>
              
              <div>
                  <div className="mt-2 pt-4 border-t border-stone-800 flex justify-between items-center">
                    <span className="text-sm text-stone-500">Net Balance</span>
                    <span className={`font-bold text-lg ${netBalance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      ₹{netBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-stone-500 flex justify-between">
                     <span className="text-rose-400">Gave: ₹{debits}</span>
                     <span className="text-emerald-400">Got: ₹{credits}</span>
                  </div>
              </div>
            </div>
          );
        })}
        {filteredCustomers.length === 0 && (
            <div className="col-span-full text-center py-10 text-stone-500">
                No customers found. Add a new Hisab to get started.
            </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-stone-900 rounded-2xl shadow-2xl border border-stone-800 w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-stone-800">
              <h3 className="text-lg font-bold text-stone-100">Open New Hisab</h3>
            </div>
            <form onSubmit={handleSubmitCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Customer / Business Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Phone</label>
                <input 
                  type="tel" 
                  className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Address / Notes</label>
                <textarea 
                  className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  rows={3}
                  value={newCustomer.address}
                  onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 border border-stone-700 rounded-lg hover:bg-stone-800 font-medium text-stone-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 font-medium transition-colors"
                >
                  Save Hisab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;