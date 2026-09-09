import React from 'react';
import { Download, Database, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { AppData } from '../types';
import { exportToCSV, backupData } from '../services/exportService';

interface SettingsProps {
  data: AppData;
}

const Settings: React.FC<SettingsProps> = ({ data }) => {

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-100">Settings</h2>
        <p className="text-stone-400">Manage your data and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-stone-900 p-6 rounded-xl border border-stone-800 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100">Google Sheets Export</h3>
              <p className="text-sm text-stone-400">Download invoices as CSV</p>
            </div>
          </div>
          <p className="text-stone-500 text-sm mb-6">
            Get a detailed breakdown of all your invoices in a format compatible with Google Sheets and Excel.
          </p>
          <button 
            onClick={() => exportToCSV(data)}
            className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg border border-stone-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download CSV
          </button>
        </div>

        {/* Backup Card */}
        <div className="bg-stone-900 p-6 rounded-xl border border-stone-800 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-500/10 p-3 rounded-lg text-amber-500">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100">Data Backup</h3>
              <p className="text-sm text-stone-400">Full data backup</p>
            </div>
          </div>
          <p className="text-stone-500 text-sm mb-6">
            Download a complete backup file (JSON) of your customers, invoices, expenses, and payments.
          </p>
          <button 
            onClick={() => backupData(data)}
            className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck size={18} />
            Download Backup
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
