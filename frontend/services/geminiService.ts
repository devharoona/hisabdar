import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateReminderMessage = async (customerName: string, amount: number, dueDate: string, isOverdue: boolean): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Error: API Key not found.";

  const tone = isOverdue ? "firm but polite" : "friendly and helpful";
  const prompt = `Write a short WhatsApp message (under 50 words) to a customer named ${customerName}. 
  Remind them about an invoice of $${amount} due on ${dueDate}. 
  The tone should be ${tone}. Do not include placeholders like [Your Name], just sign off as 'The Team'.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate message.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate message due to an error.";
  }
};

export const analyzeFinancials = async (income: number, expenses: number, pending: number): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Error: API Key not found.";

  const prompt = `Acting as a financial advisor for a small business, give me a 2-sentence summary and 1 actionable tip based on these monthly stats:
  - Total Income: $${income}
  - Total Expenses: $${expenses}
  - Pending Payments (Accounts Receivable): $${pending}
  
  Keep it encouraging and simple.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate insights.";
  }
};