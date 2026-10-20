import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StagedTransaction, ExpenseCategory } from '../../types';
import {
  EXPENSE_CATEGORIES,
  SAMPLE_BANK_TRANSACTIONS_RAW,
  parseCSVToStagedTransactions,
} from '../../services/expenseService';

interface ImportTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportTransactionsModal: React.FC<ImportTransactionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeJob, importExpenses } = useApp();

  const [activeTab, setActiveTab] = useState<'csv' | 'bank'>('csv');
  const [stagedList, setStagedList] = useState<StagedTransaction[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setFileError('The selected file appears to be empty.');
        return;
      }
      const parsed = parseCSVToStagedTransactions(text);
      if (parsed.length === 0) {
        setFileError('Could not find recognizable transaction columns (Date, Description/Name, Amount). Please check format.');
      } else {
        setStagedList(parsed);
      }
    };
    reader.onerror = () => {
      setFileError('Failed to read the file.');
    };
    reader.readAsText(file);
  };

  const handleLoadSampleCSV = () => {
    const sampleCSV = `Date,Description,Amount,Category
2026-10-12,Metro Supermarket Montreal,86.40,Groceries
2026-10-11,STM Transit Metro Fare,7.50,Transportation
2026-10-10,Hydro-Québec Online Payment,88.10,Utilities
2026-10-09,Starbucks St-Laurent Coffee,9.25,Entertainment
2026-10-08,Jean Coutu Pharmacy & Vitamins,28.75,Healthcare
2026-10-07,BestBuy Electronics Cable,34.50,Shopping`;

    const parsed = parseCSVToStagedTransactions(sampleCSV);
    setStagedList(parsed);
    setFileError(null);
  };

  const handleFetchSandboxFeed = () => {
    const sandboxItems: StagedTransaction[] = SAMPLE_BANK_TRANSACTIONS_RAW.map((item, idx) => ({
      ...item,
      id: `sandbox_${Date.now()}_${idx}`,
      confirmed: false,
      selected: true,
    }));
    setStagedList(sandboxItems);
    setFileError(null);
  };

  const toggleSelectAll = (checked: boolean) => {
    setStagedList((prev) => prev.map((item) => ({ ...item, selected: checked })));
  };

  const toggleSelectItem = (id: string) => {
    setStagedList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleCategoryChange = (id: string, newCat: ExpenseCategory) => {
    setStagedList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, suggestedCategory: newCat } : item))
    );
  };

  const handleDescriptionChange = (id: string, newDesc: string) => {
    setStagedList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, description: newDesc } : item))
    );
  };

  const handleConfirmImport = () => {
    const selected = stagedList.filter((item) => item.selected);
    if (selected.length === 0) return;

    const formattedExpenses = selected.map((item) => ({
      name: item.description,
      amount: item.amount,
      category: item.suggestedCategory,
      paymentMethod: item.paymentMethod,
      date: item.date,
      source: (activeTab === 'csv' ? 'csv' : 'bank_import') as 'csv' | 'bank_import',
      notes: `Imported via ${activeTab === 'csv' ? 'CSV batch' : 'verified bank statement'}`,
    }));

    importExpenses(formattedExpenses);
    onClose();
  };

  const selectedCount = stagedList.filter((i) => i.selected).length;
  const selectedTotal = stagedList
    .filter((i) => i.selected)
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">sync_alt</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Import Transactions &amp; Bank Feed
              </h2>
              <p className="text-[11px] text-slate-500">
                Auto-categorize, review for duplicates, and confirm
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

        {/* Tab Selection */}
        <div className="px-5 pt-3 border-b border-slate-100 flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`pb-2.5 text-xs font-bold transition-all relative ${
              activeTab === 'csv' ? 'text-[#006c4a]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              CSV File Upload
            </span>
            {activeTab === 'csv' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#006c4a] rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`pb-2.5 text-xs font-bold transition-all relative ${
              activeTab === 'bank' ? 'text-[#006c4a]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">account_balance</span>
              Bank / Card Feed (Sandbox)
            </span>
            {activeTab === 'bank' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#006c4a] rounded-full" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'csv' && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-[32px] text-slate-400 mb-1">
                  cloud_upload
                </span>
                <p className="text-xs font-bold text-slate-700">
                  Upload CSV from Bank or Credit Card
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supports statements with Date, Description, and Amount columns
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <label className="px-3.5 py-1.5 bg-[#006c4a] text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-[#005a3e] transition-colors shadow-sm">
                    Browse File
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSampleCSV}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
                  >
                    Load Sample CSV
                  </button>
                </div>
              </div>

              {fileError && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{fileError}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-3">
              {/* Security & Authenticity Disclaimer */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-600 mt-0.5 shrink-0">
                  verified_user
                </span>
                <div>
                  <p className="font-bold">Privacy &amp; Sandbox Security Mode</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Direct live open-banking integrations require OAuth aggregator keys (e.g. Plaid/Tink). This application strictly preserves your credentials by utilizing sandbox mock streaming and verified local CSV files.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Connect Sandbox Financial Feed
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Simulate streaming from RBC, TD, Chase, or Wells Fargo
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFetchSandboxFeed}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">download</span>
                  Fetch Feed
                </button>
              </div>
            </div>
          )}

          {/* Staged Transactions Review Section */}
          {stagedList.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={stagedList.every((i) => i.selected)}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded text-[#006c4a] accent-[#006c4a] cursor-pointer"
                  />
                  <label htmlFor="select-all" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Select All ({stagedList.length} items)
                  </label>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  Total Selected: <strong className="text-slate-800 font-mono">{activeJob.currencySymbol}{selectedTotal.toFixed(2)}</strong>
                </span>
              </div>

              {/* Transactions List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {stagedList.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                      item.selected
                        ? 'border-[#006c4a]/30 bg-[#006c4a]/5'
                        : 'border-slate-200 bg-white opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleSelectItem(item.id)}
                          className="w-4 h-4 rounded text-[#006c4a] accent-[#006c4a] cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                          className="flex-1 font-semibold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-[#006c4a] focus:outline-none text-xs truncate"
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-900 shrink-0">
                        {activeJob.currencySymbol}{item.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pl-6">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.date}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500">Category:</span>
                        <select
                          value={item.suggestedCategory}
                          onChange={(e) =>
                            handleCategoryChange(item.id, e.target.value as ExpenseCategory)
                          }
                          className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
                        >
                          {EXPENSE_CATEGORIES.map((c) => (
                            <option key={c.category} value={c.category}>
                              {c.category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={handleConfirmImport}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md ${
              selectedCount > 0
                ? 'bg-[#006c4a] hover:bg-[#005a3e] shadow-[#006c4a]/20 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Import Confirmed ({selectedCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
