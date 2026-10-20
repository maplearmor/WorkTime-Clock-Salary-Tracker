import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, Expense } from '../../types';
import { EXPENSE_CATEGORIES, exportExpensesCSV } from '../../services/expenseService';
import { AddExpenseModal } from '../modals/AddExpenseModal';
import { ImportTransactionsModal } from '../modals/ImportTransactionsModal';
import { RecurringBillsModal } from '../modals/RecurringBillsModal';
import { BudgetSettingsModal } from '../modals/BudgetSettingsModal';
import { ExpensePieChart } from '../ExpensePieChart';

export const ExpensesView: React.FC = () => {
  const {
    activeJob,
    expenses,
    deleteExpense,
    expenseStats,
    budgetSettings,
    toggleBillPaid,
  } = useApp();

  // Modals state
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [recurringBillsOpen, setRecurringBillsOpen] = useState(false);
  const [budgetSettingsOpen, setBudgetSettingsOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'ALL'>('ALL');
  const [timeFilter, setTimeFilter] = useState<'month' | 'week' | 'all'>('month');

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Category filter
      if (selectedCategory !== 'ALL' && e.category !== selectedCategory) {
        return false;
      }
      // Time filter
      if (timeFilter === 'month') {
        const currentMonthPrefix = new Date().toISOString().slice(0, 7);
        if (!e.date.startsWith(currentMonthPrefix)) return false;
      } else if (timeFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoIso = weekAgo.toISOString().slice(0, 10);
        if (e.date < weekAgoIso) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = e.name.toLowerCase().includes(q);
        const matchesNotes = (e.notes || '').toLowerCase().includes(q);
        const matchesCat = e.category.toLowerCase().includes(q);
        if (!matchesName && !matchesNotes && !matchesCat) return false;
      }
      return true;
    });
  }, [expenses, selectedCategory, timeFilter, searchQuery]);

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setAddExpenseOpen(true);
  };

  const handleExportCSV = () => {
    exportExpensesCSV(expenses, activeJob.currencySymbol);
  };

  const sym = activeJob.currencySymbol;

  // Grocery specific metrics
  const groceryItemsTotalCount = useMemo(() => {
    return expenses
      .filter((e) => e.category === 'Groceries' && e.items)
      .reduce((sum, e) => sum + (e.items?.length || 0), 0);
  }, [expenses]);

  return (
    <div className="pb-24 pt-2 px-3.5 max-w-md mx-auto space-y-3.5 transition-all animate-fade-in">
      {/* 1. Executive Top Header Strip */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#006c4a]">
              account_balance_wallet
            </span>
            <h1 className="text-sm font-bold text-slate-800 tracking-tight">
              My Expenses
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#006c4a]/10 text-[#006c4a]">
              {activeJob.currency}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Personal spend, groceries, recurring bills &amp; spending habits
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setBudgetSettingsOpen(true)}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
            title="Budget Settings"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
            title="Export CSV"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => {
            setEditingExpense(null);
            setAddExpenseOpen(true);
          }}
          className="p-2.5 rounded-2xl bg-[#006c4a] text-white flex flex-col items-center justify-center gap-1 shadow-md shadow-[#006c4a]/15 hover:bg-[#005a3e] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span className="text-[10px] font-bold">Add Expense</span>
        </button>

        <button
          type="button"
          onClick={() => setImportOpen(true)}
          className="p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 flex flex-col items-center justify-center gap-1 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px] text-blue-600">sync_alt</span>
          <span className="text-[10px] font-bold">Import CSV</span>
        </button>

        <button
          type="button"
          onClick={() => setRecurringBillsOpen(true)}
          className="p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 flex flex-col items-center justify-center gap-1 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all relative"
        >
          <span className="material-symbols-outlined text-[20px] text-indigo-600">event_repeat</span>
          <span className="text-[10px] font-bold">Bills ({expenseStats.upcomingBills.length})</span>
          {expenseStats.upcomingBills.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setBudgetSettingsOpen(true)}
          className="p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 flex flex-col items-center justify-center gap-1 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px] text-emerald-700">tune</span>
          <span className="text-[10px] font-bold">Budget</span>
        </button>
      </div>

      {/* 2. Main Expense Dashboard Primary Hero Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3.5">
        {/* Top Spend vs Budget */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Spent This Month
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
                {sym}{expenseStats.monthlyTotal.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                / {sym}{budgetSettings.monthlyBudget.toFixed(2)} limit
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Remaining Budget
            </span>
            <span
              className={`text-sm font-black font-mono inline-block px-2 py-0.5 rounded-lg mt-0.5 ${
                expenseStats.remainingBudget >= 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}
            >
              {expenseStats.remainingBudget >= 0 ? `+${sym}` : `-${sym}`}
              {Math.abs(expenseStats.remainingBudget).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Visual Budget Meter */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-600">
              Budget Utilization ({expenseStats.budgetPercentage}%)
            </span>
            <span className="font-medium text-slate-500">
              {expenseStats.budgetPercentage < budgetSettings.alertThresholdPercent ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  On Target
                </span>
              ) : (
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  High Spending
                </span>
              )}
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                expenseStats.budgetPercentage > 100
                  ? 'bg-rose-500'
                  : expenseStats.budgetPercentage > 80
                  ? 'bg-amber-500'
                  : 'bg-[#006c4a]'
              }`}
              style={{ width: `${Math.min(100, expenseStats.budgetPercentage)}%` }}
            />
          </div>
        </div>

        {/* 3 Core Spending Pillars (Groceries, Bills, Other) */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
          {/* Pillar 1: Groceries */}
          <div className="p-2.5 rounded-xl bg-[#006c4a]/5 border border-[#006c4a]/10">
            <div className="flex items-center gap-1 text-[#006c4a] mb-1">
              <span className="material-symbols-outlined text-[15px]">local_grocery_store</span>
              <span className="text-[10px] font-bold uppercase truncate">Groceries</span>
            </div>
            <div className="font-mono font-bold text-xs text-slate-900">
              {sym}{expenseStats.groceryTotal.toFixed(2)}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5 truncate">
              ~{sym}{expenseStats.groceryWeeklyAvg.toFixed(0)}/wk
            </div>
          </div>

          {/* Pillar 2: Bills */}
          <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <div className="flex items-center gap-1 text-indigo-700 mb-1">
              <span className="material-symbols-outlined text-[15px]">receipt</span>
              <span className="text-[10px] font-bold uppercase truncate">Bills</span>
            </div>
            <div className="font-mono font-bold text-xs text-slate-900">
              {sym}{expenseStats.billsTotal.toFixed(2)}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5 truncate">
              Rent &amp; utilities
            </div>
          </div>

          {/* Pillar 3: Other */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1 text-slate-600 mb-1">
              <span className="material-symbols-outlined text-[15px]">credit_card</span>
              <span className="text-[10px] font-bold uppercase truncate">Daily</span>
            </div>
            <div className="font-mono font-bold text-xs text-slate-900">
              {sym}{expenseStats.otherTotal.toFixed(2)}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5 truncate">
              Transit &amp; other
            </div>
          </div>
        </div>

        {/* Visual Category Distribution Stack Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-700">Category Breakdown</span>
            <span className="text-[10px] text-slate-400">Top areas of spending</span>
          </div>

          <div className="w-full h-3 rounded-lg overflow-hidden flex bg-slate-100 shadow-2xs">
            {expenseStats.categoryBreakdown
              .filter((c) => c.percentage > 0)
              .map((c) => (
                <div
                  key={c.category}
                  className="h-full transition-all duration-300 relative group"
                  style={{
                    width: `${c.percentage}%`,
                    backgroundColor: c.color,
                  }}
                  title={`${c.category}: ${sym}${c.amount.toFixed(2)} (${c.percentage}%)`}
                />
              ))}
          </div>

          {/* Top 3 Legend chips */}
          <div className="flex flex-wrap gap-2 text-[10px] text-slate-600 pt-0.5">
            {expenseStats.categoryBreakdown.slice(0, 4).map((c) => (
              <button
                key={c.category}
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === c.category ? 'ALL' : c.category
                  )
                }
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all ${
                  selectedCategory === c.category
                    ? 'bg-slate-200 font-bold'
                    : 'hover:bg-slate-100'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span>
                  {c.category} ({c.percentage}%)
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Grocery & Everyday Spending Focus Card */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#006c4a]/10 text-[#006c4a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[17px]">
                local_grocery_store
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Grocery &amp; Everyday Spending
              </h3>
              <p className="text-[10px] text-slate-500">
                Food pantry habits &amp; weekly pacing
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono font-bold text-xs text-[#006c4a]">
              {sym}{expenseStats.groceryTotal.toFixed(2)}
            </span>
            <span className="block text-[9px] text-slate-400">This Month</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 block">Past 7 Days Grocery</span>
            <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
              {sym}{expenseStats.weeklyGroceryTotal.toFixed(2)}
            </span>
            <span className="text-[9px] text-slate-400">Weekly Pace</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 block">Itemized Tracked Items</span>
            <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
              {groceryItemsTotalCount} items
            </span>
            <span className="text-[9px] text-slate-400">From supermarket receipts</span>
          </div>
        </div>
      </div>

      {/* 4. Upcoming Recurring Bills Banner (If Any Unpaid) */}
      {expenseStats.upcomingBills.length > 0 && (
        <div className="bg-indigo-50/50 rounded-2xl p-3.5 border border-indigo-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-indigo-600">
                notification_important
              </span>
              <span className="text-xs font-bold text-indigo-950">
                Upcoming Due Bills ({expenseStats.upcomingBills.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRecurringBillsOpen(true)}
              className="text-[11px] font-bold text-indigo-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-1.5">
            {expenseStats.upcomingBills.slice(0, 2).map((bill) => (
              <div
                key={bill.id}
                className="bg-white p-2.5 rounded-xl border border-indigo-100/80 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 block">{bill.name}</span>
                  <span className="text-[10px] text-slate-500">
                    Due: {bill.nextDueDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">
                    {sym}{bill.amount.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleBillPaid(bill.id)}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[#006c4a] text-white hover:bg-[#005a3e]"
                  >
                    Mark Paid
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Monthly Expense Pie Chart Breakdown */}
      <ExpensePieChart
        expenses={expenses}
        currencySymbol={sym}
        currency={activeJob.currency}
      />

      {/* 6. Recent Expense Transactions Feed */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        {/* Feed Header & Filters */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800">
              Transactions &amp; Purchases
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              {filteredExpenses.length} records
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search expenses, merchants, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006c4a] text-slate-800 font-medium"
            />
          </div>

          {/* Time & Category Filter Chips */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTimeFilter('month')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all ${
                  timeFilter === 'month'
                    ? 'bg-[#006c4a] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('week')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all ${
                  timeFilter === 'week'
                    ? 'bg-[#006c4a] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('all')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all ${
                  timeFilter === 'all'
                    ? 'bg-[#006c4a] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
            </div>

            {selectedCategory !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className="text-[10px] font-bold text-rose-600 hover:underline"
              >
                Clear Category ({selectedCategory})
              </button>
            )}
          </div>
        </div>

        {/* Transactions Items */}
        {filteredExpenses.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <span className="material-symbols-outlined text-[32px]">
              receipt_long
            </span>
            <p className="text-xs">No transactions match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredExpenses.map((expense) => {
              const catConfig = EXPENSE_CATEGORIES.find(
                (c) => c.category === expense.category
              );
              return (
                <div
                  key={expense.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-all text-xs group space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
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
                        <span className="font-bold text-slate-800 truncate block">
                          {expense.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span>{expense.date}</span>
                          <span>•</span>
                          <span>{expense.paymentMethod}</span>
                          {expense.source && expense.source !== 'manual' && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-semibold uppercase text-[9px]">
                                {expense.source === 'csv' ? 'CSV' : 'Bank'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-900 block text-xs">
                        {sym}{expense.amount.toFixed(2)}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.2 rounded inline-block"
                        style={{
                          backgroundColor: catConfig?.bgColor || '#f1f5f9',
                          color: catConfig?.color || '#475569',
                        }}
                      >
                        {expense.category}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Itemized Preview */}
                  {(expense.notes || (expense.items && expense.items.length > 0)) && (
                    <div className="pt-1.5 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="truncate flex-1 pr-2">
                        {expense.notes && (
                          <span className="italic">{expense.notes}</span>
                        )}
                        {expense.items && expense.items.length > 0 && (
                          <span className="text-[#006c4a] font-semibold block text-[10px]">
                            🛒 {expense.items.length} itemized items attached
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleEditExpense(expense)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            edit
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteExpense(expense.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      <AddExpenseModal
        isOpen={addExpenseOpen}
        expenseToEdit={editingExpense}
        onClose={() => {
          setAddExpenseOpen(false);
          setEditingExpense(null);
        }}
      />

      <ImportTransactionsModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
      />

      <RecurringBillsModal
        isOpen={recurringBillsOpen}
        onClose={() => setRecurringBillsOpen(false)}
      />

      <BudgetSettingsModal
        isOpen={budgetSettingsOpen}
        onClose={() => setBudgetSettingsOpen(false)}
      />
    </div>
  );
};
