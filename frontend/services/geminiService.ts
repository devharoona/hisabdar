import { API_URL } from './apiConfig';

async function generate(prompt: string): Promise<string> {
  const token = localStorage.getItem('hisabdar_token');
  if (!token) return 'Please sign in to use AI assistance.';

  const response = await fetch(`${API_URL}/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ prompt })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) return body.error || 'AI assistance is temporarily unavailable.';
  return body.text || 'AI assistance returned an empty response.';
}

export const generateReminderMessage = (customerName: string, amount: number, dueDate: string, isOverdue: boolean) =>
  generate(`Write a short WhatsApp payment reminder (under 50 words) to ${customerName} for an invoice of Rs ${amount} due on ${dueDate}. Use a ${isOverdue ? 'firm but polite' : 'friendly and helpful'} tone. Do not include placeholders; sign off as The Team.`);

export const analyzeFinancials = (income: number, expenses: number, pending: number) =>
  generate(`Give a two-sentence financial summary and one actionable tip for a small business. Income: Rs ${income}; expenses: Rs ${expenses}; pending receivables: Rs ${pending}. Keep it encouraging and simple.`);
