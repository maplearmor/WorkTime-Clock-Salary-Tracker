import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeJob, budgetSettings, updateBudgetSettings } = useApp();

  const [monthlyBudget, setMonthlyBudget] = useState(
    budgetSettings.monthlyBudget.toString()
  );
  const [alertThreshold, setAlertThreshold] = useState(
    budgetSettings.alertThresholdPercent.toString()
  );
  const [enableAlerts, setEnableAlerts] = useState(
    budgetSettings.enableBudgetAlerts
  );

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBudget = parseFloat(monthlyBudget);
    const parsedThreshold = parseInt(alertThreshold, 10);

    if (isNaN(parsedBudget) || parsedBudget <= 0) return;

    updateBudgetSettings({
      monthlyBudget: parsedBudget,
      alertThresholdPercent: isNaN(parsedThreshold) ? 80 : parsedThreshold,
      enableBudgetAlerts: enableAlerts,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">savings</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Monthly Budget Settings
              </h2>
              <p className="text-[11px] text-slate-500">
                Set monthly cap and overspending alerts
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

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Budget Limit ({activeJob.currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                {activeJob.currencySymbol}
              </span>
              <input
                type="number"
                step="50"
                min="100"
                required
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006c4a]/20 focus:border-[#006c4a] text-slate-800 font-mono font-bold"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Recommended: 50–70% of estimated net monthly earnings
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Spending Warning Threshold ({alertThreshold}%)
            </label>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="w-full accent-[#006c4a]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>50%</span>
              <span>75%</span>
              <span>80%</span>
              <span>95%</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={enableAlerts}
                onChange={(e) => setEnableAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#006c4a] accent-[#006c4a]"
              />
              <span>Trigger alert when spending exceeds threshold</span>
            </label>
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#006c4a] hover:bg-[#005a3e] shadow-md shadow-[#006c4a]/20 transition-all"
            >
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
