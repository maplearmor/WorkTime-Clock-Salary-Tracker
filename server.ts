import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      time: new Date().toISOString(),
    });
  });

  app.post('/api/ai/expense-assistant', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(200).json({
        configured: false,
        message: 'GEMINI_API_KEY is not configured in environment secrets. The AI assistant is running in Local Analytical Mode.',
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const { prompt, expenseContext } = req.body;
      const systemInstruction = `You are the executive AI Expense & Financial Assistant for the "WorkTime Clock & Salary Tracker / My Expenses" application.
You help users understand their spending, groceries, recurring bills, budget progress, and ways to save money.
Analyze the user's provided real financial data accurately, clearly, and concisely.
Always refer to actual numbers from their data. Use friendly, clear financial terms without unnecessary jargon. Provide practical bullet points when suggesting budget reductions.`;

      const contents = `User question: "${prompt}"\n\nCurrent Real Financial Data Context:\n${JSON.stringify(expenseContext, null, 2)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({
        configured: true,
        answer: response.text,
      });
    } catch (err: any) {
      console.error('Gemini API error in expense assistant:', err);
      return res.status(500).json({
        configured: true,
        error: err.message || 'Failed to process AI assistant request',
      });
    }
  });

  // Vite middleware in dev
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
