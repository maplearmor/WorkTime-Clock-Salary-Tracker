import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RecurringBill, BillFrequency, ExpenseCategory } from '../../types';
import { EXPENSE_CATEGORIES } from '../../services/expenseService';

interface RecurringBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecurringBillsModal: React.FC<RecurringBillsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeJob,
    recurringBills,
    addRecurringBill,
    deleteRecurringBill,
    toggleBillPaid,
  } = useApp();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Rent');
  const [frequency, setFrequency] = useState<BillFrequency>('monthly');
  const [nextDueDate, setNextDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [reminderDays, setReminderDays] = useState(3);
  const [autoPayment, setAutoPayment] = useState(true);

  if (!isOpen) return null;

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    addRecurringBill({
      name: name.trim(),
      amount: parsedAmount,
      category,
      frequency,
      nextDueDate,
      reminderDaysBefore: reminderDays,
      hasReminder: reminderDays > 0,
      isPaid: false,
      autoPayment,
    });

    setName('');
    setAmount('');
    setIsAddingNew(false);
  };

  const totalMonthlyScheduled = recurringBills.reduce((sum, b) => {
    if (b.frequency === 'monthly') return sum + b.amount;
    if (b.frequency === 'weekly') return sum + b.amount * 4.33;
    if (b.frequency === 'yearly') return sum + b.amount / 12;
    return sum + b.amount;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">event_repeat</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Recurring Bills &amp; Subscriptions
              </h2>
              <p className="text-[11px] text-slate-500">
                Track due dates, auto-pays, and paid/unpaid status
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

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Summary Strip */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Monthly Scheduled Bills:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {activeJob.currencySymbol}
                {totalMonthlyScheduled.toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-3 py-1.5 bg-[#006c4a] text-white rounded-lg text-xs font-bold hover:bg-[#005a3e] transition-colors flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isAddingNew ? 'expand_less' : 'add'}
              </span>
              <span>{isAddingNew ? 'Close Form' : 'New Bill'}</span>
            </button>
          </div>

          {/* Add New Bill Form */}
          {isAddingNew && (
            <form
              onSubmit={handleCreateBill}
              className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 space-y-3 animate-fade-in"
            >
              <h3 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-indigo-600">
                  add_alert
                </span>
                Add Recurring Commitment
              </h3>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Bill / Service Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apartment Rent, Internet, Mobile Phone"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Amount ({activeJob.currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c.category} value={c.category}>
                          {c.category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Frequency
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as BillFrequency)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Next Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={nextDueDate}
                      onChange={(e) => setNextDueDate(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPayment}
                      onChange={(e) => setAutoPayment(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#006c4a] accent-[#006c4a]"
                    />
                    <span>Autopay Enabled</span>
                  </label>
                  <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    <span>Remind:</span>
                    <select
                      value={reminderDays}
                      onChange={(e) => setReminderDays(Number(e.target.value))}
                      className="px-1.5 py-0.5 text-[10px] rounded border border-slate-200 bg-white"
                    >
                      <option value="1">1 day prior</option>
                      <option value="2">2 days prior</option>
                      <option value="3">3 days prior</option>
                      <option value="0">None</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
                  >
                    Save Bill
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Bills List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>All Scheduled Commitments</span>
              <span className="text-[11px] font-normal text-slate-400">
                {recurringBills.length} total
              </span>
            </h3>

            {recurringBills.map((bill) => {
              const catConfig = EXPENSE_CATEGORIES.find((c) => c.category === bill.category);
              return (
                <div
                  key={bill.id}
                  className={`p-3 rounded-xl border transition-all text-xs flex items-center justify-between gap-3 ${
                    bill.isPaid
                      ? 'border-slate-200/80 bg-slate-50/60'
                      : 'border-slate-200 bg-white shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: catConfig?.bgColor || '#f1f5f9',
                        color: catConfig?.color || '#475569',
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {catConfig?.icon || 'receipt'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 truncate">{bill.name}</span>
                        {bill.autoPayment && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-100">
                            Auto
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span>Due: {bill.nextDueDate}</span>
                        <span>•</span>
                        <span className="capitalize">{bill.frequency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 block text-xs">
                        {activeJob.currencySymbol}
                        {bill.amount.toFixed(2)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold inline-block ${
                          bill.isPaid ? 'text-[#006c4a]' : 'text-amber-600'
                        }`}
                      >
                        {bill.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleBillPaid(bill.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        bill.isPaid
                          ? 'bg-[#006c4a] text-white hover:bg-[#005a3e]'
                          : 'border border-slate-300 text-slate-400 hover:border-[#006c4a] hover:text-[#006c4a]'
                      }`}
                      title={bill.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {bill.isPaid ? 'check' : 'radio_button_unchecked'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteRecurringBill(bill.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                      title="Remove"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#006c4a] hover:bg-[#005a3e] transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
