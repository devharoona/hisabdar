import React, { useState } from 'react';
import { Plus, FileText, Download, CheckCircle, XCircle, MessageCircle, Trash2 } from 'lucide-react';
import { AppData, Invoice, InvoiceItem, InvoiceStatus } from '../types';
import { generateReminderMessage } from '../services/geminiService';

interface InvoicesProps {
  data: AppData;
  onAddInvoice: (inv: Omit<Invoice, 'id'>) => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
  onDeleteInvoice: (id: string) => void;
}

const Invoices: React.FC<InvoicesProps> = ({ data, onAddInvoice, onUpdateStatus, onDeleteInvoice }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  
  // AI Reminder State
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reminderTarget, setReminderTarget] = useState<Invoice | null>(null);

  // Form State
  const [newInv, setNewInv] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [] as InvoiceItem[],
    notes: ''
  });
  const [currentItem, setCurrentItem] = useState({ desc: '', amount: '' });

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
      status: InvoiceStatus.PENDING,
      notes: newInv.notes || undefined
    });
    
    setIsCreateOpen(false);
    setNewInv({ customerId: '', date: new Date().toISOString().split('T')[0], dueDate: '', items: [], notes: '' });
    setCurrentItem({ desc: '', amount: '' });
  };

  const handlePrint = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const openReminderGenerator = async (inv: Invoice) => {
    setReminderTarget(inv);
    setReminderModalOpen(true);
    setIsGenerating(true);
    setGeneratedMessage("Asking AI to draft a message...");
    
    const isOverdue = inv.status === InvoiceStatus.OVERDUE || new Date(inv.dueDate) < new Date();
    const msg = await generateReminderMessage(inv.customerName, inv.totalAmount, inv.dueDate, isOverdue);
    
    setGeneratedMessage(msg);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-stone-100">Invoices</h2>
          <p className="text-stone-400">Create and track payments.</p>
        </div>
        <div className="flex gap-2">
          {selectedRows.size > 0 && (
            <button 
              onClick={() => {
                if (window.confirm(`Delete ${selectedRows.size} invoice(s)?`)) {
                  selectedRows.forEach(id => onDeleteInvoice(id));
                  setSelectedRows(new Set());
                }
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all"
            >
              <Trash2 size={18} />
              Delete ({selectedRows.size})
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

      {/* Invoice List */}
      <div className="bg-stone-900 rounded-xl shadow-lg border border-stone-800 overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-950 text-stone-400 border-b border-stone-800">
              <tr>
                <th className="p-4 font-medium w-8">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.invoices.length && data.invoices.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(data.invoices.map(inv => inv.id)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    className="rounded border-stone-600 bg-stone-800 text-amber-600 focus:ring-amber-500"
                  />
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
                <tr key={inv.id} className="hover:bg-stone-800/50 transition-colors group">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(inv.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedRows);
                        if (e.target.checked) {
                          newSelected.add(inv.id);
                        } else {
                          newSelected.delete(inv.id);
                        }
                        setSelectedRows(newSelected);
                      }}
                      className="rounded border-stone-600 bg-stone-800 text-amber-600 focus:ring-amber-500"
                    />
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
                    <div className="flex justify-end gap-2">
                      {inv.status !== InvoiceStatus.PAID && (
                        <>
                          <button 
                            title="AI Reminder"
                            onClick={(e) => {
                                e.stopPropagation();
                                openReminderGenerator(inv);
                            }}
                            className="p-1.5 text-purple-400 hover:bg-purple-500/10 rounded transition-colors"
                          >
                            <MessageCircle size={18} />
                          </button>
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
                        </>
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

      {/* Create Modal */}
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
                            <XCircle size={16} />
                         </button>
                      </div>
                    </div>
                  ))}
                  {newInv.items.length === 0 && (
                    <p className="text-xs text-stone-500 text-center py-2">No items added yet.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Notes (Optional)</label>
                <textarea
                  className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                  rows={2}
                  placeholder="Add any additional notes..."
                  value={newInv.notes}
                  onChange={(e) => setNewInv({...newInv, notes: e.target.value})}
                />
              </div>

              <div className="flex justify-end text-xl font-bold text-stone-100">
                Total: ₹{(newInv.items.reduce((sum, i) => sum + i.amount, 0) + (currentItem.amount ? parseFloat(currentItem.amount) || 0 : 0)).toFixed(2)}
                {currentItem.amount && <span className="text-xs font-normal text-stone-400 ml-2 self-center">(including pending item)</span>}
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

      {/* AI Reminder Modal */}
      {reminderModalOpen && reminderTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 no-print backdrop-blur-sm">
          <div className="bg-stone-900 rounded-2xl shadow-2xl border border-stone-800 w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-stone-800 bg-purple-900/20">
              <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                <MessageCircle size={20} /> AI Reminder Assistant
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-stone-300 mb-4">
                Sending reminder to <strong>{reminderTarget.customerName}</strong> for <strong>₹{reminderTarget.totalAmount}</strong>.
              </p>
              <div className="bg-stone-950 border border-stone-700 p-4 rounded-lg mb-4 relative">
                 <textarea 
                  className="w-full bg-transparent border-none focus:ring-0 text-sm text-stone-200 resize-none outline-none"
                  rows={4}
                  value={generatedMessage}
                  readOnly={isGenerating}
                  onChange={(e) => setGeneratedMessage(e.target.value)}
                 />
                 {isGenerating && <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div></div>}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setReminderModalOpen(false)} 
                  className="flex-1 py-2 border border-stone-700 rounded-lg text-stone-400 hover:bg-stone-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                   onClick={() => {
                     alert(`Message copied to clipboard! Open WhatsApp to paste.`);
                     navigator.clipboard.writeText(generatedMessage);
                     setReminderModalOpen(false);
                   }}
                  disabled={isGenerating}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                >
                  Copy to Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Template */}
      {selectedInvoice && (() => {
        const customer = data.customers.find(c => c.id === selectedInvoice.customerId);
        return (
          <div style={{ display: 'none' }} className="print-only">
            <div style={{ 
              backgroundColor: 'white', 
              color: 'black', 
              padding: '40px',
              maxWidth: '800px',
              margin: '0 auto',
              fontFamily: 'Arial, sans-serif'
            }}>
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '30px',
                paddingBottom: '20px',
                borderBottom: '3px solid #333'
              }}>
                <div>
                  <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 10px 0' }}>INVOICE</h1>
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>#{selectedInvoice.id.toUpperCase()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Hisabdar</h2>
                  <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Business Accounting</p>
                </div>
              </div>

              {/* Bill To & Invoice Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                <div>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: '10px' }}>Bill To:</h3>
                  <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0' }}>{selectedInvoice.customerName}</p>
                    {customer && (
                      <div style={{ fontSize: '13px', color: '#333' }}>
                        <p style={{ margin: '5px 0' }}><strong>Phone:</strong> {customer.phone}</p>
                        <p style={{ margin: '5px 0' }}><strong>Email:</strong> {customer.email}</p>
                        <p style={{ margin: '5px 0' }}><strong>Address:</strong> {customer.address}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: '10px' }}>Invoice Details:</h3>
                  <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>Invoice Date:</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{selectedInvoice.date}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>Due Date:</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{selectedInvoice.dueDate}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>Status:</span>
                      <span style={{ 
                        fontSize: '13px', 
                        fontWeight: 'bold',
                        color: selectedInvoice.status === 'Paid' ? '#16a34a' : selectedInvoice.status === 'Overdue' ? '#dc2626' : '#d97706'
                      }}>{selectedInvoice.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#333', color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold' }}>#</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold' }}>Description</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>{i + 1}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{item.description}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '500' }}>₹{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
                <div style={{ width: '300px' }}>
                  <div style={{ backgroundColor: '#333', color: 'white', padding: '15px', borderRadius: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>TOTAL AMOUNT</span>
                      <span style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{selectedInvoice.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Notes:</h3>
                  <p style={{ fontSize: '13px', color: '#333', margin: 0 }}>{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div style={{ paddingTop: '20px', borderTop: '1px solid #ddd', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 5px 0' }}>Thank you for your business!</p>
                <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>Generated by Hisabdar - Business Accounting System</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Invoices;