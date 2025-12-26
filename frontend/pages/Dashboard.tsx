import React from 'react';
import { TrendingUp, TrendingDown, Clock, Wallet } from 'lucide-react';
import { AppData, InvoiceStatus } from '../types';
import KPICard from '../components/KPICard';

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Calculate totals logic for Hisab system
  
  // 1. Total Sales (Invoiced)
  const totalSales = data.invoices.reduce((sum, i) => sum + i.totalAmount, 0);

  // 2. Total Collected (Payments)
  const totalCollected = data.payments.reduce((sum, p) => sum + p.amount, 0);

  // 3. Outstanding (Receivable)
  const outstanding = totalSales - totalCollected;

  // 4. Total Expenses
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);

  // 5. Net Cash Flow
  const netCashFlow = totalCollected - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-100">Dashboard</h2>
          <p className="text-stone-400">Overview of your business ledger.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Collection" amount={totalCollected} icon={Wallet} color="green" />
        <KPICard title="Total Expenses" amount={totalExpenses} icon={TrendingDown} color="red" />
        <KPICard title="Outstanding (Hisab)" amount={outstanding} icon={Clock} color="orange" />
        <KPICard title="Net Cash Flow" amount={netCashFlow} icon={TrendingUp} color="blue" />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions (Invoices & Payments Mixed) */}
        <div className="bg-stone-900 rounded-xl shadow-lg border border-stone-800 overflow-hidden">
          <div className="p-5 border-b border-stone-800 flex justify-between items-center">
            <h3 className="font-semibold text-stone-100">Recent Activity</h3>
          </div>
          <div className="divide-y divide-stone-800">
            {/* Combine Invoices and Payments for a feed */}
            {[
              ...data.invoices.map(i => ({ type: 'invoice', date: i.date, name: i.customerName, amount: i.totalAmount, id: i.id })),
              ...data.payments.map(p => ({ 
                  type: 'payment', 
                  date: p.date, 
                  name: data.customers.find(c => c.id === p.customerId)?.name || 'Unknown', 
                  amount: p.amount, 
                  id: p.id 
              }))
            ]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((item, idx) => (
              <div key={`${item.type}-${item.id}`} className="p-4 flex justify-between items-center hover:bg-stone-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.type === 'payment' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  <div>
                    <p className="font-medium text-stone-200">{item.name}</p>
                    <p className="text-xs text-stone-500 capitalize">{item.type} • {item.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${item.type === 'payment' ? 'text-emerald-400' : 'text-stone-200'}`}>
                    {item.type === 'payment' ? '+' : ''}₹{item.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            {data.invoices.length === 0 && data.payments.length === 0 && <div className="p-8 text-center text-stone-500">No activity yet.</div>}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-stone-900 rounded-xl shadow-lg border border-stone-800 overflow-hidden">
          <div className="p-5 border-b border-stone-800 flex justify-between items-center">
            <h3 className="font-semibold text-stone-100">Recent Expenses</h3>
          </div>
          <div className="divide-y divide-stone-800">
            {data.expenses.slice(0, 5).map(exp => (
              <div key={exp.id} className="p-4 flex justify-between items-center hover:bg-stone-800/50 transition-colors">
                <div>
                  <p className="font-medium text-stone-200">{exp.title}</p>
                  <p className="text-xs text-stone-500">{exp.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-rose-400">-₹{exp.amount}</p>
                  <p className="text-xs text-stone-500">{exp.date}</p>
                </div>
              </div>
            ))}
            {data.expenses.length === 0 && <div className="p-8 text-center text-stone-500">No expenses yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;