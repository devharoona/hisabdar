import React, { useRef } from 'react';
import { Download, Database, FileSpreadsheet, ShieldCheck, Upload } from 'lucide-react';
import { AppData } from '../types';
import { exportToCSV, backupData } from '../services/exportService';

interface SettingsProps {
  data: AppData;
  onRestore: (data: AppData) => void;
  onReset?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ data, onRestore, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = event.target?.result as string;
              const parsed = JSON.parse(json);
              // Basic validation
              if (Array.isArray(parsed.customers) && Array.isArray(parsed.invoices)) {
                  onRestore(parsed);
              } else {
                  alert("Invalid backup file format.");
              }
          } catch (err) {
              alert("Failed to parse backup file.");
          }
      };
      reader.readAsText(file);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
              <h3 className="text-lg font-bold text-stone-100">Google Drive Backup</h3>
              <p className="text-sm text-stone-400">Full data backup</p>
            </div>
          </div>
          <p className="text-stone-500 text-sm mb-6">
            Download a complete backup file (JSON) of your customers, invoices, and expenses to upload to Google Drive.
          </p>
          <button 
            onClick={() => backupData(data)}
            className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck size={18} />
            Download Backup
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-stone-900 p-6 rounded-xl border border-stone-800 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100">Restore Data</h3>
              <p className="text-sm text-stone-400">Import from Backup File</p>
            </div>
          </div>
          <p className="text-stone-500 text-sm mb-6">
            Restoring will replace all current data. Use this to move data to a new device.
          </p>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg border border-stone-700 transition-colors flex items-center justify-center gap-2"
          >
            <Upload size={18} />
            Select Backup File
          </button>
        </div>

        {/* Reset Card */}
        {onReset && (
          <div className="bg-stone-900 p-6 rounded-xl border border-stone-800 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-rose-500/10 p-3 rounded-lg text-rose-400">
                <Database size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-100">Reset to Demo</h3>
                <p className="text-sm text-stone-400">Restore demo data</p>
              </div>
            </div>
            <p className="text-stone-500 text-sm mb-6">
              This will reset all data to the initial demo state. All your current data will be lost.
            </p>
            <button 
              onClick={onReset}
              className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Database size={18} />
              Reset to Demo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;