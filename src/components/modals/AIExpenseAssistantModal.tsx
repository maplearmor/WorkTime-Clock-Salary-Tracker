import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AIAssistantMessage } from '../../types';
import { askExpenseAI } from '../../services/aiExpenseService';

interface AIExpenseAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_MESSAGES: AIAssistantMessage[] = [
  {
    id: 'ai_msg_intro',
    sender: 'assistant',
    text: `Hello! I'm your **Executive Expense Assistant**. I analyze your live expense telemetry and budget progress in real time. 
    
How can I assist you with your spending today?`,
    timestamp: 'Just now',
    suggestedActions: [
      'Summarize this month’s spending',
      'How much did I spend on groceries?',
      'What bills are due next week?',
      'Suggest realistic ways to reduce spending',
      'Help me set an optimal budget',
    ],
  },
];

export const AIExpenseAssistantModal: React.FC<AIExpenseAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeJob, expenseStats, budgetSettings } = useApp();

  const [messages, setMessages] = useState<AIAssistantMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeminiActive, setIsGeminiActive] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSendPrompt = async (promptToSend: string) => {
    if (!promptToSend.trim() || isLoading) return;

    const userMsg: AIAssistantMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: promptToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await askExpenseAI(promptToSend, {
        monthlyTotal: expenseStats.monthlyTotal,
        groceryTotal: expenseStats.groceryTotal,
        groceryWeeklyAvg: expenseStats.groceryWeeklyAvg,
        billsTotal: expenseStats.billsTotal,
        otherTotal: expenseStats.otherTotal,
        remainingBudget: expenseStats.remainingBudget,
        monthlyBudget: budgetSettings.monthlyBudget,
        categoryBreakdown: expenseStats.categoryBreakdown,
        upcomingBills: expenseStats.upcomingBills,
        currencySymbol: activeJob.currencySymbol,
      });

      setIsGeminiActive(result.isGemini);

      const aiMsg: AIAssistantMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'assistant',
        text: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          'What bills are due next week?',
          'Suggest realistic ways to reduce spending',
        ],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const fallbackMsg: AIAssistantMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to analyze currently. Please check your data and retry.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col h-[85vh] max-h-[680px] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600/10 text-violet-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">AI Expense Assistant</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                  {isGeminiActive ? 'Gemini 2.5 Flash' : 'Financial Engine'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Grounded in your live spending ({activeJob.currencySymbol}{expenseStats.monthlyTotal.toFixed(2)} recorded)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-[#006c4a] text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line prose-xs">
                    {msg.text}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Suggested Action Chips */}
                {!isUser && msg.suggestedActions && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendPrompt(action)}
                        className="text-[10px] font-semibold px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-[#006c4a] rounded-lg transition-all shadow-2xs active:scale-95 text-left"
                      >
                        ⚡ {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl w-fit">
              <span className="material-symbols-outlined animate-spin text-[16px] text-violet-600">
                progress_activity
              </span>
              <span>Analyzing expense trends...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about your spending or budget..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006c4a]/20 focus:border-[#006c4a] text-slate-800"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-[#006c4a] text-white hover:bg-[#005a3e] shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
