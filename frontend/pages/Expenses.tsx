import React, { useState } from 'react';
import { Plus, IndianRupee, Tag, Trash2, Pencil } from 'lucide-react';
import { AppData, Expense } from '../types';

interface ExpensesProps {
  data: AppData;
  onAddExpense: (exp: Omit<Expense, 'id'>) => void;
  onEditExpense: (id: string, exp: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ data, onAddExpense, onEditExpense, onDeleteExpense }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [currentExpense, setCurrentExpense] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Other' as Expense['category']
  });

  const categories = ['Fuel', 'Maintenance', 'Rent', 'Supplies', 'Other'];

  const handleOpenAdd = () => {
    setEditingId(null);
    setCurrentExpense({
      title: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Other'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setCurrentExpense({
      title: exp.title,
      amount: exp.amount.toString(),
      date: exp.date,
      category: exp.category
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentExpense.title || !currentExpense.amount) return;

    const expenseData = {
      title: currentExpense.title,
      amount: parseFloat(currentExpense.amount),
      date: currentExpense.date,
      category: currentExpense.category
    };

    if (editingId) {
      onEditExpense(editingId, expenseData);
    } else {
      onAddExpense(expenseData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-stone-100">Expenses</h2>
          <p className="text-stone-400">Track where your money goes.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-amber-900/20 transition-all"
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-amber-700 to-orange-800 rounded-xl p-6 text-white shadow-xl">
           <h3 className="text-lg font-semibold mb-2 opacity-90">Total Expenses (All Time)</h3>
           <div className="text-4xl font-bold mb-6">
             ₹{data.expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
           </div>
           <div className="space-y-3">
             <p className="text-sm font-medium opacity-75 uppercase tracking-wider">Top Categories</p>
             {categories.slice(0, 3).map(cat => {
                const catTotal = data.expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
                if(catTotal === 0) return null;
                return (
                  <div key={cat} className="flex justify-between text-sm border-b border-white/10 pb-1">
                    <span>{cat}</span>
                    <span className="font-mono">₹{catTotal}</span>
                  </div>
                )
             })}
           </div>
        </div>

        {/* Expense List */}
        <div className="lg:col-span-2 bg-stone-900 rounded-xl shadow-lg border border-stone-800 overflow-hidden">
          <div className="divide-y divide-stone-800">
            {data.expenses.map(exp => (
              <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-stone-800/50 transition-colors group">
                <div className="flex items-center gap-4">
                   <div className="bg-rose-500/10 p-2 rounded-full text-rose-500">
                     <IndianRupee size={20} />
                   </div>
                   <div>
                     <p className="font-medium text-stone-100">{exp.title}</p>
                     <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="bg-stone-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <Tag size={10} /> {exp.category}
                        </span>
                        <span>{exp.date}</span>
                     </div>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="font-semibold text-rose-400">
                    -₹{exp.amount.toFixed(2)}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(exp)} className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded">
                            <Pencil size={16} />
                        </button>
                        <button onClick={() => onDeleteExpense(exp.id)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
              </div>
            ))}
            {data.expenses.length === 0 && (
              <div className="p-8 text-center text-stone-500">No expenses recorded yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-stone-900 rounded-2xl shadow-2xl border border-stone-800 w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-stone-800">
              <h3 className="text-lg font-bold text-stone-100">{editingId ? 'Edit Expense' : 'Add Expense'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Title</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Gas Refill"
                  className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  value={currentExpense.title}
                  onChange={e => setCurrentExpense({...currentExpense, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Amount</label>
                    <input 
                      required
                      type="number" 
                      className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                      value={currentExpense.amount}
                      onChange={e => setCurrentExpense({...currentExpense, amount: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Category</label>
                    <select 
                       className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                       value={currentExpense.category}
                       onChange={e => setCurrentExpense({...currentExpense, category: e.target.value as any})}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Date</label>
                <input 
                  type="date" 
                  className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  value={currentExpense.date}
                  onChange={e => setCurrentExpense({...currentExpense, date: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-stone-700 rounded-lg hover:bg-stone-800 font-medium text-stone-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 font-medium transition-colors"
                >
                  {editingId ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;