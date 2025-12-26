import React, { useState } from 'react';
import { Plus, Download, CheckCircle, Trash2, Square, CheckSquare } from 'lucide-react';
import { AppData, Invoice, InvoiceItem, InvoiceStatus } from '../types';

interface InvoicesProps {
  data: AppData;
  onAddInvoice: (inv: Omit<Invoice, 'id'>) => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
  onDeleteInvoice: (id: string) => void;
}

const Invoices: React.FC<InvoicesProps> = ({ data, onAddInvoice, onUpdateStatus, onDeleteInvoice }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Form State
  const [newInv, setNewInv] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [] as InvoiceItem[],
  });
  const [currentItem, setCurrentItem] = useState({ desc: '', amount: '' });

  // --- Selection Logic ---

  const handleSelectAll = () => {
    if (selectedIds.size === data.invoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.invoices.map(i => i.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} invoices?`)) {
      selectedIds.forEach(id => onDeleteInvoice(id));
      setSelectedIds(new Set());
    }
  };

  // --- Invoice Logic ---

  const handleAddItem = () => {
    if (!currentItem.desc || !currentItem.amount) return;
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: currentItem.desc,
      amount: parseFloat(currentItem.amount)
    };
    setNewInv({ ...newInv, items: [...newInv.items, newItem] });
    setCurrentItem({ desc: '', amount: '' });
  };

  const handleRemoveItem = (itemId: string) => {
    setNewInv({
      ...newInv,
      items: newInv.items.filter(i => i.id !== itemId)
    });
  };

  const handleSaveInvoice = () => {
    if (!newInv.customerId) {
      alert("Please select a customer first.");
      return;
    }

    let finalItems = [...newInv.items];
    if (currentItem.desc && currentItem.amount) {
      finalItems.push({
        id: Date.now().toString(),
        description: currentItem.desc,
        amount: parseFloat(currentItem.amount)
      });
    }

    if (finalItems.length === 0) {
      alert("Please add at least one item to the invoice.");
      return;
    }
    
    const customer = data.customers.find(c => c.id === newInv.customerId);
    const total = finalItems.reduce((sum, i) => sum + i.amount, 0);
    
    onAddInvoice({
      customerId: newInv.customerId,
      customerName: customer?.name || 'Unknown',
      date: newInv.date,
      dueDate: newInv.dueDate || newInv.date,
      items: finalItems,
      totalAmount: total,
      status: InvoiceStatus.PENDING
    });
    
    setIsCreateOpen(false);
    setNewInv({ customerId: '', date: new Date().toISOString().split('T')[0], dueDate: '', items: [] });
    setCurrentItem({ desc: '', amount: '' });
  };

  const handlePrint = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const printCustomer = selectedInvoice ? data.customers.find(c => c.id === selectedInvoice.customerId) : null;
  const businessName = localStorage.getItem('hisabdar_user') || 'My Business';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-stone-100">Invoices</h2>
          <p className="text-stone-400">Create, track, and manage payments.</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.size > 0 && (
            <button 
              onClick={handleDeleteSelected}
              className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all animate-in fade-in slide-in-from-right-4"
            >
              <Trash2 size={18} />
              Delete ({selectedIds.size})
            </button>
          )}
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-amber-900/20 transition-all"
          >
            <Plus size={18} />
            New Invoice
          </button>
        </div>
      </div>

      <div className="bg-stone-900 rounded-xl shadow-lg border border-stone-800 overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-950 text-stone-400 border-b border-stone-800">
              <tr>
                <th className="p-4 w-12">
                  <button onClick={handleSelectAll} className="text-stone-400 hover:text-white">
                    {selectedIds.size > 0 && selectedIds.size === data.invoices.length ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                </th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium text-right">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {data.invoices.map(inv => (
                <tr 
                  key={inv.id} 
                  className={`transition-colors cursor-pointer ${selectedIds.has(inv.id) ? 'bg-amber-900/10' : 'hover:bg-stone-800/50'}`}
                  onClick={() => handleSelectOne(inv.id)}
                >
                  <td className="p-4">
                    <div className={`text-stone-400 ${selectedIds.has(inv.id) ? 'text-amber-500' : ''}`}>
                       {selectedIds.has(inv.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-stone-100">{inv.customerName}</td>
                  <td className="p-4 text-stone-400">{inv.date}</td>
                  <td className="p-4 text-stone-400">{inv.dueDate}</td>
                  <td className="p-4 text-right font-semibold text-stone-200">₹{inv.totalAmount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inv.status === InvoiceStatus.PAID ? 'bg-emerald-500/10 text-emerald-400' :
                      inv.status === InvoiceStatus.OVERDUE ? 'bg-rose-500/10 text-rose-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                      {inv.status !== InvoiceStatus.PAID && (
                        <button 
                          title="Mark Paid"
                          onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(inv.id, InvoiceStatus.PAID);
                          }}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button 
                        title="Print/PDF"
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrint(inv);
                        }}
                        className="p-1.5 text-stone-400 hover:bg-stone-700 rounded transition-colors"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500">No invoices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 no-print backdrop-blur-sm">
          <div className="bg-stone-900 rounded-2xl shadow-2xl border border-stone-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-stone-800">
              <h3 className="text-lg font-bold text-stone-100">Create New Invoice</h3>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {data.customers.length === 0 && (
                <div className="bg-amber-500/10 text-amber-400 p-4 rounded-lg border border-amber-500/20 text-sm">
                  You don't have any customers yet. Go to the Customers tab to add one before creating an invoice.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">Customer</label>
                  <select 
                    className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    value={newInv.customerId}
                    onChange={(e) => setNewInv({...newInv, customerId: e.target.value})}
                    disabled={data.customers.length === 0}
                  >
                    <option value="">Select Customer...</option>
                    {data.customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Date</label>
                    <input 
                      type="date" 
                      className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                      value={newInv.date}
                      onChange={(e) => setNewInv({...newInv, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Due Date</label>
                    <input 
                      type="date" 
                      className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                      value={newInv.dueDate}
                      onChange={(e) => setNewInv({...newInv, dueDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl space-y-3 border border-stone-800">
                <h4 className="text-sm font-semibold text-stone-100">Add Items</h4>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Description (e.g. Web Design)" 
                    className="flex-1 p-2 bg-stone-900 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    value={currentItem.desc}
                    onChange={(e) => setCurrentItem({...currentItem, desc: e.target.value})}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddItem();
                    }}
                  />
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-24 p-2 bg-stone-900 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    value={currentItem.amount}
                    onChange={(e) => setCurrentItem({...currentItem, amount: e.target.value})}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddItem();
                    }}
                  />
                  <button 
                    onClick={handleAddItem}
                    className="bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-500 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-2 mt-2">
                  {newInv.items.map((item, idx) => (
                    <div key={item.id} className="flex justify-between items-center bg-stone-900 p-2 rounded border border-stone-800">
                      <span className="text-sm text-stone-200">{item.description}</span>
                      <div className="flex items-center gap-3">
                         <span className="text-sm font-medium text-stone-200">₹{item.amount.toFixed(2)}</span>
                         <button 
                           onClick={() => handleRemoveItem(item.id)}
                           className="text-stone-500 hover:text-rose-500"
                         >
                           &times;
                         </button>
                      </div>
                    </div>
                  ))}
                  {newInv.items.length === 0 && (
                    <p className="text-xs text-stone-500 text-center py-2">No items added yet.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end text-xl font-bold text-stone-100">
                Total: ₹{(newInv.items.reduce((sum, i) => sum + i.amount, 0) + (currentItem.amount ? parseFloat(currentItem.amount) || 0 : 0)).toFixed(2)}
              </div>
            </div>

            <div className="p-4 border-t border-stone-800 bg-stone-950 flex justify-end gap-3">
              <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-stone-400 hover:bg-stone-800 rounded-lg font-medium transition-colors">Cancel</button>
              <button 
                onClick={handleSaveInvoice} 
                disabled={data.customers.length === 0}
                className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${data.customers.length === 0 ? 'bg-stone-700' : 'bg-amber-600 hover:bg-amber-500'}`}
              >
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Print Template */}
      <div className="hidden print-only p-10 max-w-4xl mx-auto bg-white text-black font-serif">
        {selectedInvoice && (
          <div className="flex flex-col min-h-[28cm]">
            <div className="flex justify-between items-start mb-12">
               <div>
                 <h1 className="text-4xl font-bold text-gray-900 tracking-wide uppercase mb-2">Invoice</h1>
                 <p className="text-gray-500 font-sans">#{selectedInvoice.id.toUpperCase()}</p>
               </div>
               <div className="text-right">
                 <h2 className="text-xl font-bold text-gray-800">{businessName}</h2>
                 <p className="text-sm text-gray-600 mt-1">Authorized Business Partner</p>
                 <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
               </div>
            </div>

            <div className="flex justify-between gap-8 mb-12 font-sans">
               <div className="flex-1">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                 <div className="text-gray-800">
                    <p className="font-bold text-lg">{selectedInvoice.customerName}</p>
                    {printCustomer ? (
                        <>
                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{printCustomer.address}</p>
                            <p className="text-sm text-gray-600 mt-1">{printCustomer.phone}</p>
                            <p className="text-sm text-gray-600">{printCustomer.email}</p>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500 italic">Customer details not available</p>
                    )}
                 </div>
               </div>
               <div className="flex-1 text-right">
                 <div className="inline-block text-left min-w-[150px]">
                    <div className="mb-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Invoice Date</h3>
                        <p className="font-medium text-gray-800">{selectedInvoice.date}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Due Date</h3>
                        <p className="font-medium text-gray-800">{selectedInvoice.dueDate}</p>
                    </div>
                 </div>
               </div>
            </div>

            <div className="flex-1 mb-8">
                <table className="w-full mb-8 border-collapse">
                <thead className="bg-gray-50 border-y border-gray-200 font-sans">
                    <tr>
                    <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {selectedInvoice.items.map((item, i) => (
                    <tr key={i}>
                        <td className="py-4 px-4 text-sm text-gray-700 font-medium">{item.description}</td>
                        <td className="py-4 px-4 text-right text-sm text-gray-900 font-mono">₹{item.amount.toFixed(2)}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            <div className="flex justify-end mb-16">
               <div className="w-64 space-y-3">
                 <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{selectedInvoice.totalAmount.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Tax (0%)</span>
                    <span className="font-mono">₹0.00</span>
                 </div>
                 <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900 font-mono">₹{selectedInvoice.totalAmount.toFixed(2)}</span>
                 </div>
               </div>
            </div>

            <div className="mt-auto pt-8 border-t border-gray-200 flex justify-between items-end">
                <div>
                    <p className="text-sm text-gray-500 italic">Thank you for your business!</p>
                    <p className="text-xs text-gray-400 mt-1">Payment is required by the due date.</p>
                </div>
                <div className="text-center">
                    <div className="h-16 w-40 border-b border-gray-300 mb-2"></div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Authorized Signature</p>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;