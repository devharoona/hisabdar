import React, { useState } from 'react';
import { Plus, Search, Trash2, User } from 'lucide-react';
import { AppData, Customer } from '../types';

interface CustomersProps {
  data: AppData;
  onAddCustomer: (c: Omit<Customer, 'id'>) => void;
  onDeleteCustomer: (id: string) => void;
}

const Customers: React.FC<CustomersProps> = ({ data, onAddCustomer, onDeleteCustomer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });

  const filteredCustomers = data.customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name) return;
    onAddCustomer(newCustomer);
    setNewCustomer({ name: '', email: '', phone: '', address: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-100">Customers</h2>
          <p className="text-stone-400">Manage your client base.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-amber-900/20 transition-all"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-stone-700 text-white rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-stone-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(customer => {
          // Calculate outstanding for this customer
          const outstanding = data.invoices
            .filter(i => i.customerId === customer.id && i.status !== 'Paid')
            .reduce((sum, i) => sum + i.totalAmount, 0);

          return (
            <div key={customer.id} className="bg-stone-900 p-6 rounded-xl shadow-lg border border-stone-800 hover:border-stone-700 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-amber-500/10 p-3 rounded-full text-amber-500">
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
              <p className="text-sm text-stone-400 mb-4 min-h-[20px]">{customer.address}</p>
              
              <div className="space-y-2 text-sm text-stone-300">
                <p className="flex items-center gap-2">
                  <span className="w-16 text-stone-500">Email:</span> 
                  <span className="truncate">{customer.email || '-'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-16 text-stone-500">Phone:</span> 
                  <span>{customer.phone || '-'}</span>
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-800 flex justify-between items-center">
                <span className="text-sm text-stone-500">Outstanding</span>
                <span className={`font-bold ${outstanding > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ₹{outstanding.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-stone-900 rounded-2xl shadow-2xl border border-stone-800 w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-stone-800">
              <h3 className="text-lg font-bold text-stone-100">Add New Customer</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Name</label>
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
                <label className="block text-sm font-medium text-stone-300 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  value={newCustomer.email}
                  onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Address</label>
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
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-stone-700 rounded-lg hover:bg-stone-800 font-medium text-stone-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 font-medium transition-colors"
                >
                  Save Customer
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