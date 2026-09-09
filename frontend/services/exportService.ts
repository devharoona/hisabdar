import { AppData } from '../types';

export const exportToCSV = (data: AppData) => {
  const csvCell = (value: string | number) => {
    const text = String(value);
    const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText.replace(/"/g, '""')}"`;
  };
  // Define headers
  const headers = ['Invoice ID', 'Customer', 'Date', 'Due Date', 'Total Amount', 'Status'];
  
  // Map data to rows
  const rows = data.invoices.map(inv => [
    csvCell(inv.id),
    csvCell(inv.customerName),
    csvCell(inv.date),
    csvCell(inv.dueDate),
    csvCell(inv.totalAmount.toFixed(2)),
    csvCell(inv.status)
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `hisabdar_invoices_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const backupData = (data: AppData) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `hisabdar_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
