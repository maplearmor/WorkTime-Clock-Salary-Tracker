import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportGranularity } from '../../types';
import { exportTimesheetCSV, exportPayStubPDF } from '../../services/exportService';
import { exportExpensesCSV } from '../../services/expenseService';
import { calculateSalary } from '../../services/taxEngine';

export const ReportsView: React.FC = () => {
  const {
    activeJob,
    jobs,
    switchJob,
    timeEntries,
    expenses,
    expenseStats,
    budgetSettings,
    setCurrentView,
  } = useApp();

  const [reportDomain, setReportDomain] = useState<'payroll' | 'expenses'>('payroll');
  const [granularity, setGranularity] = useState<ReportGranularity>('biweekly');
  const [expensePeriod, setExpensePeriod] = useState<'weekly' | 'monthly' | 'all'>('monthly');
  const [selectedJobId, setSelectedJobId] = useState<string>(activeJob.id);

  const targetJob = jobs.find((j) => j.id === selectedJobId) || activeJob;

  // Filter entries for selected job
  const relevantEntries = useMemo(() => {
    return timeEntries.filter((e) => e.jobId === targetJob.id);
  }, [timeEntries, targetJob.id]);

  // Aggregate metrics based on granularity
  const reportData = useMemo(() => {
    const totalH = relevantEntries.reduce((sum, e) => sum + e.totalHours, 0);
    const regH = relevantEntries.reduce((sum, e) => sum + e.regularHours, 0);
    const otH = relevantEntries.reduce((sum, e) => sum + e.overtimeHours, 0);
    const holH = relevantEntries.reduce((sum, e) => sum + e.holidayHours, 0);

    // Multipliers for different reporting periods
    let multiplier = 1;
    let label = 'Current Biweekly Period';

    if (granularity === 'daily') {
      multiplier = 1 / 10;
      label = "Today's Daily Aggregation";
    } else if (granularity === 'weekly') {
      multiplier = 0.5;
      label = 'Weekly Cumulative Period';
    } else if (granularity === 'biweekly') {
      multiplier = 1.0;
      label = 'Standard Biweekly Cycle (14 Days)';
    } else if (granularity === 'monthly') {
      multiplier = 2.16;
      label = 'Full Month Projection (30 Days)';
    } else if (granularity === 'yearly') {
      multiplier = targetJob.periodsPerYear;
      label = `Fiscal Year ${targetJob.taxYear} Annual Projection`;
    }

    const scaledReg = Number((regH * multiplier).toFixed(1));
    const scaledOt = Number((otH * multiplier).toFixed(1));
    const scaledHol = Number((holH * multiplier).toFixed(1));
    const scaledTotal = Number((scaledReg + scaledOt + scaledHol).toFixed(1));

    const breakdown = calculateSalary(targetJob, scaledReg, scaledOt, scaledHol);

    return {
      label,
      totalHours: scaledTotal,
      regularHours: scaledReg,
      overtimeHours: scaledOt,
      holidayHours: scaledHol,
      grossPay: breakdown.grossPay,
      taxes: breakdown.totalTaxes,
      deductions: breakdown.totalBenefits,
      totalDeductions: breakdown.totalDeductions,
      netPay: breakdown.netPay,
      takeHomePct: breakdown.takeHomePercentage,
      shiftsCount: Math.round(relevantEntries.length * (granularity === 'yearly' ? targetJob.periodsPerYear : 1)),
    };
  }, [relevantEntries, targetJob, granularity]);

  return (
    <div className="flex flex-col w-full px-3.5 sm:px-4 pb-24 gap-3 pt-2">
      {/* Header Strip & Granularity Controls */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentView('timesheet')}
              className="w-8 h-8 rounded-lg bg-[#eff4ff] hover:bg-[#e0edff] text-slate-700 flex items-center justify-center transition-all active:scale-95 shadow-2xs"
              title="Back to Timesheet"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <div>
              <h2 className="font-display font-semibold text-sm text-[#0b1c30]">Reports &amp; Analytics</h2>
              <p className="text-[10px] text-slate-400">Payroll, Expenses &amp; Financial Analytics</p>
            </div>
          </div>

          {/* Job Filter Dropdown */}
          <select
            value={selectedJobId}
            onChange={(e) => {
              setSelectedJobId(e.target.value);
              switchJob(e.target.value);
            }}
            className="h-8 px-2 bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.shortName} ({j.currency})
              </option>
            ))}
          </select>
        </div>

        {/* Report Domain Switcher (Work vs Expenses) */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setReportDomain('payroll')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              reportDomain === 'payroll'
                ? 'bg-white text-[#006c4a] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Work &amp; Payroll Reports
          </button>
          <button
            type="button"
            onClick={() => setReportDomain('expenses')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              reportDomain === 'expenses'
                ? 'bg-white text-[#006c4a] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Expenses Reports
          </button>
        </div>

        {reportDomain === 'payroll' ? (
          /* Granularity Selector Pills */
          <div className="grid grid-cols-5 gap-1 p-1 bg-[#eff4ff] rounded-lg">
            {(['daily', 'weekly', 'biweekly', 'monthly', 'yearly'] as ReportGranularity[]).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`h-8 rounded-md text-[11px] font-semibold capitalize transition-all active:scale-95 ${
                  granularity === g
                    ? 'bg-white text-[#006c4a] shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                type="button"
              >
                {g === 'biweekly' ? 'Bi-wk' : g}
              </button>
            ))}
          </div>
        ) : (
          /* Expenses Period Selector */
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#eff4ff] rounded-lg">
            {(['weekly', 'monthly', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setExpensePeriod(p)}
                className={`h-8 rounded-md text-[11px] font-semibold capitalize transition-all active:scale-95 ${
                  expensePeriod === p
                    ? 'bg-white text-[#006c4a] shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                type="button"
              >
                {p === 'weekly' ? 'Past 7 Days' : p === 'monthly' ? 'This Month' : 'All Recorded'}
              </button>
            ))}
          </div>
        )}
      </div>

      {reportDomain === 'expenses' ? (
        /* My Expenses Report Section */
        <div className="space-y-3">
          {/* Expenses vs Projected Earnings Comparison */}
          <div className="bg-[#131b2e] text-white rounded-xl p-4 shadow-md flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#82f5c1] uppercase font-bold tracking-widest">
                Monthly Net Cashflow Overview
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 text-[10px] font-bold">
                Budget: {targetJob.currencySymbol}{budgetSettings.monthlyBudget.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-1">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Est. Net Earnings
                </span>
                <span className="font-mono text-xl font-bold text-white">
                  {targetJob.currencySymbol}
                  {reportData.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Total Month Expenses
                </span>
                <span className="font-mono text-xl font-bold text-rose-400">
                  -{targetJob.currencySymbol}{expenseStats.monthlyTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Estimated Net Surplus:</span>
              <span className="font-mono font-bold text-[#82f5c1] text-sm">
                +{targetJob.currencySymbol}
                {(reportData.netPay - expenseStats.monthlyTotal).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Groceries</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                {targetJob.currencySymbol}{expenseStats.groceryTotal.toFixed(2)}
              </span>
              <span className="text-[9px] text-[#006c4a] font-semibold">
                ~{targetJob.currencySymbol}{expenseStats.groceryWeeklyAvg.toFixed(0)}/week
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Recurring Bills</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                {targetJob.currencySymbol}{expenseStats.billsTotal.toFixed(2)}
              </span>
              <span className="text-[9px] text-indigo-600 font-semibold">
                Rent &amp; utilities
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Daily &amp; Other</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                {targetJob.currencySymbol}{expenseStats.otherTotal.toFixed(2)}
              </span>
              <span className="text-[9px] text-slate-500 font-semibold">
                Transit &amp; general
              </span>
            </div>
          </div>

          {/* Top Spending Categories List */}
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 space-y-2">
            <span className="font-display font-semibold text-xs text-[#0b1c30] block">
              Spending by Category
            </span>
            <div className="space-y-1.5">
              {expenseStats.categoryBreakdown
                .filter((c) => c.amount > 0)
                .map((c) => (
                  <div
                    key={c.category}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="font-medium text-slate-700">{c.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {targetJob.currencySymbol}{c.amount.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 w-8 text-right">
                        {c.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Export Action Card */}
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-2">
            <span className="font-display font-semibold text-xs text-[#0b1c30]">Export Expense Data</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => exportExpensesCSV(expenses, targetJob.currencySymbol)}
                className="min-h-[42px] px-3 py-2 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200/50"
              >
                <span className="material-symbols-outlined text-[16px] text-[#006c4a]">table_view</span>
                <span>Export CSV / Excel</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('expenses')}
                className="min-h-[42px] px-3 py-2 rounded-lg bg-[#006c4a] hover:bg-[#005a3e] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                <span>Go to Expenses</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Hero Overview Net Pay Banner */}
      <div className="bg-[#006c4a] text-white rounded-xl p-4 shadow-md flex flex-col gap-1.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#85f8c4] uppercase font-bold tracking-widest">
            {reportData.label}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#85f8c4] text-[10px] font-bold">
            {reportData.takeHomePct}% Take-Home
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 my-0.5">
          <span className="font-mono text-3xl font-bold tracking-tight text-white">
            {targetJob.currencySymbol}
            {reportData.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="font-mono text-xs text-[#85f8c4] font-semibold">{targetJob.currency} Net</span>
        </div>

        <div className="flex items-center justify-between text-xs text-emerald-100/90 pt-1 border-t border-white/15">
          <span>Gross: {targetJob.currencySymbol}{reportData.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span>Deductions: -{targetJob.currencySymbol}{reportData.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Working Hours</span>
            <span className="material-symbols-outlined text-[16px] text-[#006c4a]">schedule</span>
          </div>
          <div className="my-1.5">
            <span className="font-mono text-2xl font-bold text-[#0b1c30]">{reportData.totalHours}</span>
            <span className="text-xs text-slate-400 ml-1">hrs</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
            <span>Regular: {reportData.regularHours}h</span>
            <span className="text-blue-600 font-semibold">OT: +{reportData.overtimeHours}h</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Tax &amp; Withholdings</span>
            <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">account_balance</span>
          </div>
          <div className="my-1.5">
            <span className="font-mono text-2xl font-bold text-[#ba1a1a]">
              -{targetJob.currencySymbol}{reportData.taxes.toFixed(2)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
            <span>Benefits: -{targetJob.currencySymbol}{reportData.deductions.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Itemized Table Breakdown */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold text-xs sm:text-sm text-[#0b1c30]">
            Payroll &amp; Time Summary
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">{targetJob.provinceName} Statutory</span>
        </div>

        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center p-2 rounded-lg bg-[#eff4ff]">
            <span className="text-slate-600">Base Regular Earnings</span>
            <span className="font-mono font-semibold text-[#0b1c30]">
              {targetJob.currencySymbol}{(reportData.regularHours * targetJob.hourlyRate).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-[#eff4ff]">
            <span className="text-slate-600">
              Overtime Premium ({targetJob.overtimeMultiplier}x @ {targetJob.currencySymbol}
              {(targetJob.hourlyRate * targetJob.overtimeMultiplier).toFixed(2)}/hr)
            </span>
            <span className="font-mono font-semibold text-blue-700">
              +{targetJob.currencySymbol}
              {(reportData.overtimeHours * targetJob.hourlyRate * targetJob.overtimeMultiplier).toFixed(2)}
            </span>
          </div>

          {reportData.holidayHours > 0 && (
            <div className="flex justify-between items-center p-2 rounded-lg bg-[#eff4ff]">
              <span className="text-slate-600">Statutory Holiday Premium ({targetJob.holidayMultiplier}x)</span>
              <span className="font-mono font-semibold text-amber-700">
                +{targetJob.currencySymbol}
                {(reportData.holidayHours * targetJob.hourlyRate * targetJob.holidayMultiplier).toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center p-2 rounded-lg bg-[#ffdad6]/40 text-[#93000a]">
            <span>Estimated Statutory Taxes</span>
            <span className="font-mono font-bold">-{targetJob.currencySymbol}{reportData.taxes.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-[#ffdad6]/40 text-[#93000a]">
            <span>Estimated Pension &amp; Voluntary Deductions</span>
            <span className="font-mono font-bold">-{targetJob.currencySymbol}{reportData.deductions.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#82f5c1]/30 font-bold text-[#006c4a]">
            <span>Net Take-Home Pay</span>
            <span className="font-mono text-sm">{targetJob.currencySymbol}{reportData.netPay.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Export Action Card */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-2">
        <span className="font-display font-semibold text-xs text-[#0b1c30]">Export Reports</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => exportTimesheetCSV(targetJob, relevantEntries)}
            className="min-h-[42px] px-3 py-2 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200/50"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-[#006c4a]">table_view</span>
            <span>Export CSV / Excel</span>
          </button>
          <button
            onClick={() =>
              exportPayStubPDF(
                targetJob,
                calculateSalary(targetJob, reportData.regularHours, reportData.overtimeHours, reportData.holidayHours),
                reportData.label
              )
            }
            className="min-h-[42px] px-3 py-2 rounded-lg bg-[#131b2e] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-[#82f5c1]">picture_as_pdf</span>
            <span>Download PDF</span>
          </button>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};
