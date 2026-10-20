import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory, PaymentMethod, GroceryItem } from '../../types';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../services/expenseService';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
}) => {
  const { activeJob, addExpense, updateExpense } = useApp();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Groceries');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  // Itemized grocery items
  const [showItemized, setShowItemized] = useState(false);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setName(expenseToEdit.name);
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setDate(expenseToEdit.date);
      setNotes(expenseToEdit.notes || '');
      if (expenseToEdit.items && expenseToEdit.items.length > 0) {
        setItems(expenseToEdit.items);
        setShowItemized(true);
      } else {
        setItems([]);
        setShowItemized(false);
      }
    } else {
      setName('');
      setAmount('');
      setCategory('Groceries');
      setPaymentMethod('Credit Card');
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
      setItems([]);
      setShowItemized(false);
    }
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice || isNaN(Number(newItemPrice))) return;

    const price = Math.abs(parseFloat(newItemPrice));
    const newItem: GroceryItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: newItemName.trim(),
      price,
    };

    const updated = [...items, newItem];
    setItems(updated);
    setNewItemName('');
    setNewItemPrice('');

    // Auto-update total amount from items if itemized is active
    const totalFromItems = updated.reduce((s, it) => s + it.price, 0);
    setAmount(totalFromItems.toFixed(2));
  };

  const handleRemoveItem = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    if (updated.length > 0) {
      const totalFromItems = updated.reduce((s, it) => s + it.price, 0);
      setAmount(totalFromItems.toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (expenseToEdit) {
      updateExpense({
        ...expenseToEdit,
        name: name.trim(),
        amount: parsedAmount,
        category,
        paymentMethod,
        date,
        notes: notes.trim() || undefined,
        items: items.length > 0 ? items : undefined,
      });
    } else {
      addExpense({
        name: name.trim(),
        amount: parsedAmount,
        category,
        paymentMethod,
        date,
        notes: notes.trim() || undefined,
        items: items.length > 0 ? items : undefined,
        source: 'manual',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#006c4a]/10 text-[#006c4a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                {expenseToEdit ? 'edit_note' : 'add_circle'}
              </span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {expenseToEdit ? 'Edit Expense Record' : 'Record New Expense'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Track personal &amp; daily purchases ({activeJob.currency})
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Name & Amount */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expense / Merchant Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Metro Grocery, Metro Transit, Electric Bill"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006c4a]/20 focus:border-[#006c4a] text-slate-800 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount ({activeJob.currencySymbol}) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    {activeJob.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006c4a]/20 focus:border-[#006c4a] text-slate-800 transition-all font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purchase Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006c4a]/20 focus:border-[#006c4a] text-slate-800 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = category === cat.category;
                return (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => {
                      setCategory(cat.category);
                      if (cat.category === 'Groceries' && !showItemized) {
                        setShowItemized(true);
                      }
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all text-xs font-medium ${
                      isSelected
                        ? 'bg-white shadow-sm border border-slate-200 text-[#006c4a] font-bold'
                        : 'text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ color: cat.color }}
                    >
                      {cat.icon}
                    </span>
                    <span className="truncate">{cat.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-[#006c4a] bg-[#006c4a]/5 text-[#006c4a] font-bold shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {method === 'Credit Card'
                        ? 'credit_card'
                        : method === 'Debit Card'
                        ? 'contactless'
                        : method === 'Cash'
                        ? 'payments'
                        : 'account_balance'}
                    </span>
                    <span className="truncate">{method}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Itemized Grocery / Receipt List */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#006c4a]">
                  receipt_long
                </span>
                <span className="text-xs font-bold text-slate-700">
                  Itemized Receipt Breakdown
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowItemized(!showItemized)}
                className="text-[11px] font-bold text-[#006c4a] hover:underline flex items-center gap-0.5"
              >
                {showItemized ? 'Hide Items' : '+ Add Individual Items'}
              </button>
            </div>

            {showItemized && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2.5">
                <p className="text-[10px] text-slate-500">
                  Itemize grocery items or line purchases (updates total automatically):
                </p>

                {/* Items List */}
                {items.length > 0 && (
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between text-xs bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-2xs"
                      >
                        <span className="truncate font-medium text-slate-700">
                          {it.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#006c4a]">
                            {activeJob.currencySymbol}
                            {it.price.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(it.id)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Item Row */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Item name (e.g. Milk 2L)"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-20 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1.5 bg-[#006c4a] text-white rounded-lg text-xs font-semibold hover:bg-[#005a3e]"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add details, purchase reason, or receipt tag..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006c4a]/20 focus:border-[#006c4a] text-slate-800 transition-all resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#006c4a] hover:bg-[#005a3e] shadow-md shadow-[#006c4a]/20 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">
                {expenseToEdit ? 'save' : 'check'}
              </span>
              <span>{expenseToEdit ? 'Update Expense' : 'Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
