import React from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { AppData, InvoiceStatus } from '../types';
import KPICard from '../components/KPICard';

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Calculate totals
  const totalIncome = data.invoices
    .filter(i => i.status === InvoiceStatus.PAID)
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const pendingPayments = data.invoices
    .filter(i => i.status !== InvoiceStatus.PAID)
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-100">Dashboard</h2>
          <p className="text-stone-400">Overview of your business health.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Income" amount={totalIncome} icon={TrendingUp} color="green" />
        <KPICard title="Total Expenses" amount={totalExpenses} icon={TrendingDown} color="red" />
        <KPICard title="Pending Payments" amount={pendingPayments} icon={Clock} color="orange" />
        <KPICard title="Net Profit" amount={netProfit} icon={TrendingUp} color="blue" />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-stone-900 rounded-xl shadow-lg border border-stone-800 overflow-hidden">
          <div className="p-5 border-b border-stone-800 flex justify-between items-center">
            <h3 className="font-semibold text-stone-100">Recent Invoices</h3>
          </div>
          <div className="divide-y divide-stone-800">
            {data.invoices.slice(0, 5).map(inv => (
              <div key={inv.id} className="p-4 flex justify-between items-center hover:bg-stone-800/50 transition-colors">
                <div>
                  <p className="font-medium text-stone-200">{inv.customerName}</p>
                  <p className="text-xs text-stone-500">{inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-stone-200">₹{inv.totalAmount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    inv.status === InvoiceStatus.PAID ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
            {data.invoices.length === 0 && <div className="p-8 text-center text-stone-500">No invoices yet.</div>}
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