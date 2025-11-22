import React from 'react';

interface KPICardProps {
  title: string;
  amount: number;
  icon: React.ElementType;
  trend?: string;
  color: 'blue' | 'green' | 'red' | 'orange';
}

const KPICard: React.FC<KPICardProps> = ({ title, amount, icon: Icon, color }) => {
  const colorStyles = {
    blue: { bg: 'bg-amber-500/10', text: 'text-amber-500' }, // Replaced Blue with Amber (Primary)
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
    red: { bg: 'bg-rose-500/10', text: 'text-rose-500' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
  };

  const style = colorStyles[color];

  return (
    <div className="bg-stone-900 p-6 rounded-xl shadow-lg border border-stone-800 flex items-start justify-between hover:border-stone-700 transition-colors">
      <div>
        <p className="text-sm font-medium text-stone-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-stone-100">
          ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
      </div>
      <div className={`p-3 rounded-lg ${style.bg} ${style.text}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default KPICard;