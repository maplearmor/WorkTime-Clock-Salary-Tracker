import { GoogleGenAI } from '@google/genai';
import { generateLocalAIResponse } from './expenseService';
import { ExpenseCategory, RecurringBill } from '../types';

export interface ExpenseAIContext {
  monthlyTotal: number;
  groceryTotal: number;
  groceryWeeklyAvg: number;
  billsTotal: number;
  otherTotal: number;
  remainingBudget: number;
  monthlyBudget: number;
  categoryBreakdown: { category: ExpenseCategory; amount: number; percentage: number }[];
  upcomingBills: RecurringBill[];
  currencySymbol: string;
}

export async function askExpenseAI(
  prompt: string,
  context: ExpenseAIContext
): Promise<{ text: string; isGemini: boolean }> {
  const apiKey =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    '';

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const contextSummary = `
You are the Executive Financial Assistant inside the WorkTime Clock & Salary Tracker app.
Analyze the user's real personal expenses data below and give concise, practical, highly actionable financial insights in friendly markdown formatting:

Currency: ${context.currencySymbol}
Total Monthly Expenses: ${context.currencySymbol}${context.monthlyTotal.toFixed(2)}
Monthly Budget Limit: ${context.currencySymbol}${context.monthlyBudget.toFixed(2)}
Remaining Monthly Budget: ${context.currencySymbol}${context.remainingBudget.toFixed(2)}
Groceries Total: ${context.currencySymbol}${context.groceryTotal.toFixed(2)} (Weekly Avg: ~${context.currencySymbol}${context.groceryWeeklyAvg.toFixed(2)})
Recurring Bills Total: ${context.currencySymbol}${context.billsTotal.toFixed(2)}
Daily/Other Expenses: ${context.currencySymbol}${context.otherTotal.toFixed(2)}

Category Breakdown:
${context.categoryBreakdown.map((c) => `- ${c.category}: ${context.currencySymbol}${c.amount.toFixed(2)} (${c.percentage}%)`).join('\n')}

Upcoming Unpaid Bills:
${context.upcomingBills.length > 0 ? context.upcomingBills.map((b) => `- ${b.name}: ${context.currencySymbol}${b.amount.toFixed(2)} due on ${b.nextDueDate}`).join('\n') : 'No pending unpaid bills.'}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${contextSummary}\n\nUser Question/Request:\n"${prompt}"\n\nProvide clear bullet points, specific numbers, and realistic suggestions based strictly on their actual financial figures. Keep answer concise and readable on mobile.`,
      });

      if (response && response.text) {
        return { text: response.text, isGemini: true };
      }
    } catch (err) {
      console.warn('Gemini API call skipped or failed, using local financial engine:', err);
    }
  }

  // Fallback to intelligent offline local analytical engine
  const localResponse = generateLocalAIResponse(prompt, context);
  return { text: localResponse, isGemini: false };
}
