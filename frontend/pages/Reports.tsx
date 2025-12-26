import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { AppData, InvoiceStatus } from '../types';

interface ReportsProps {
  data: AppData;
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  // Prepare Data for Bar Chart (Income vs Expenses)
  const incomeTotal = data.invoices.filter(i => i.status === InvoiceStatus.PAID).reduce((sum, i) => sum + i.totalAmount, 0);
  const expenseTotal = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const comparisonData = [
    { name: 'Income', amount: incomeTotal },
    { name: 'Expenses', amount: expenseTotal },
  ];

  // Prepare Data for Pie Chart (Expense Categories)
  const expenseCategories = data.expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(expenseCategories).map(key => ({
    name: key,
    value: expenseCategories[key]
  }));

  const COLORS = ['#d97706', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']; // Updated to include amber

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-2xl font-bold text-stone-100">Reports</h2>
          <p className="text-stone-400">Visual insights into your performance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Income vs Expense Chart */}
          <div className="bg-stone-900 p-6 rounded-xl shadow-lg border border-stone-800">
            <h3 className="text-lg font-bold text-stone-100 mb-4">Income vs Expenses</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#44403c" />
                  <XAxis dataKey="name" stroke="#a8a29e" />
                  <YAxis stroke="#a8a29e" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', color: '#f5f5f4' }}
                    itemStyle={{ color: '#f5f5f4' }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Income' ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Breakdown Chart */}
          <div className="bg-stone-900 p-6 rounded-xl shadow-lg border border-stone-800">
            <h3 className="text-lg font-bold text-stone-100 mb-4">Expense Breakdown</h3>
            <div className="h-64 w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', color: '#f5f5f4' }} />
                    <Legend wrapperStyle={{ color: '#a8a29e' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-stone-500">
                  No expense data available
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Summary Table */}
        <div className="bg-stone-900 rounded-xl shadow-lg border border-stone-800 overflow-hidden">
           <div className="p-5 border-b border-stone-800">
             <h3 className="font-bold text-stone-100">Financial Summary</h3>
           </div>
           <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-stone-500">Total Sales</p>
                <p className="text-xl font-bold text-stone-100">₹{incomeTotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Total Costs</p>
                <p className="text-xl font-bold text-rose-400">₹{expenseTotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Net Profit</p>
                <p className={`text-xl font-bold ${incomeTotal - expenseTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{(incomeTotal - expenseTotal).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Margin</p>
                <p className="text-xl font-bold text-amber-400">
                  {incomeTotal > 0 ? ((incomeTotal - expenseTotal) / incomeTotal * 100).toFixed(1) : 0}%
                </p>
              </div>
           </div>
        </div>
    </div>
  );
};

export default Reports;