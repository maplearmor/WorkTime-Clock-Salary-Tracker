import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportPayStubPDF } from '../../services/exportService';

export const SalaryView: React.FC = () => {
  const { activeJob, currentSalaryBreakdown, setCurrentView, showToast } = useApp();
  const [formulaOpen, setFormulaOpen] = useState(false);

  const breakdown = currentSalaryBreakdown;
  const currencySymbol = activeJob.currencySymbol;
  const currency = activeJob.currency;

  const statutoryDeductions = breakdown.deductions.filter(
    (d) => d.category === 'federal' || d.category === 'regional' || d.category === 'pension' || d.category === 'insurance'
  );

  const voluntaryDeductions = breakdown.deductions.filter((d) => d.category === 'voluntary');

  const statutoryTotal = statutoryDeductions.reduce((sum, d) => sum + d.amount, 0);
  const voluntaryTotal = voluntaryDeductions.reduce((sum, d) => sum + d.amount, 0);

  const taxPercentage = breakdown.grossPay > 0 ? ((breakdown.totalTaxes / breakdown.grossPay) * 100).toFixed(1) : '18.6';
  const benefitsPercentage = breakdown.grossPay > 0 ? ((breakdown.totalBenefits / breakdown.grossPay) * 100).toFixed(1) : '5.6';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `WorkTime Pay Estimate - ${activeJob.shortName}`,
        text: `Estimated Net Take-Home: ${currencySymbol}${breakdown.netPay.toFixed(2)} ${currency} (${breakdown.takeHomePercentage}% of Gross).`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `WorkTime Pay Estimate: Gross ${currencySymbol}${breakdown.grossPay.toFixed(2)} | Net ${currencySymbol}${breakdown.netPay.toFixed(2)} ${currency}`
      );
      showToast('Payroll summary copied to clipboard');
    }
  };

  return (
    <div className="flex flex-col w-full px-3.5 sm:px-4 pb-24 gap-3 pt-2">
      {/* Jurisdiction Strip */}
      <div className="bg-[#eff4ff] rounded-xl p-3 flex flex-col gap-2 shadow-sm border border-slate-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[#e5eeff] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[16px] text-[#006c4a]">public</span>
            </div>
            <span className="font-display font-semibold text-sm text-[#0b1c30] truncate">
              {activeJob.provinceName}, {activeJob.countryName}
            </span>
            <span className="text-[10px] bg-[#dce9ff] text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
              {activeJob.taxYear} FY
            </span>
          </div>
          <button
            onClick={() => setCurrentView('settings')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#0b1c30] rounded-lg flex items-center gap-1 text-xs font-semibold shadow-sm transition-colors border border-slate-200/60"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px] text-[#006c4a]">tune</span>
            <span>Rules</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/50">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-slate-400">timer</span>
            <span className="font-mono font-semibold text-[#0b1c30]">
              {currencySymbol}
              {activeJob.hourlyRate.toFixed(2)} {currency}
            </span>
            <span>/hr</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-slate-400">event_repeat</span>
            <span className="font-medium text-[#0b1c30] capitalize">
              {activeJob.payFrequency} ({activeJob.periodsPerYear} p/yr)
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Advisory Note */}
      <div className="bg-[#dce9ff]/70 rounded-xl p-3 flex items-start gap-2.5 shadow-sm border border-slate-200/60">
        <div className="w-6 h-6 rounded-full bg-[#d3e4fe] flex items-center justify-center flex-shrink-0 mt-0.5 text-[#006c4a]">
          <span className="material-symbols-outlined text-[16px]">shield</span>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#0b1c30] font-bold uppercase tracking-wider">
              Payroll Estimation Engine
            </span>
            <span className="text-[9px] bg-[#82f5c1] text-[#00714e] px-1.5 py-0.2 rounded font-bold uppercase">
              Active
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 leading-snug">
            Projections for personal tax planning. Computations calibrate statutory ceilings, regional brackets, and standard deduction formulas.
          </p>
        </div>
      </div>

      {/* Payroll Waterfall Primary Hero Card */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Current Period Estimate
            </span>
            <span className="text-xs font-semibold text-[#0b1c30]">Biweekly Period 06</span>
          </div>
          <span className="text-[10px] bg-[#82f5c1] text-[#00714e] px-2 py-0.5 rounded-full font-bold">
            {breakdown.takeHomePercentage}% Take-Home
          </span>
        </div>

        {/* Hero Net Callout */}
        <div className="bg-[#006c4a] text-white rounded-xl p-3.5 flex flex-col gap-1 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#85f8c4] uppercase tracking-widest font-bold">
              Estimated Net Take-Home
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">payments</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-bold tracking-tight text-white">
              {currencySymbol}
              {breakdown.netPay.toFixed(2)}
            </span>
            <span className="font-mono text-xs text-[#85f8c4] font-semibold">{currency}</span>
          </div>
          <span className="text-[11px] text-emerald-100 opacity-90">
            Reflects scheduled hours, shift multiplier, and pre-tax deductions
          </span>
        </div>

        {/* Proportion Visualizer Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100">
            <div className="h-full bg-[#006c4a]" style={{ width: `${breakdown.takeHomePercentage}%` }} />
            <div className="h-full bg-[#ba1a1a]" style={{ width: `${taxPercentage}%` }} />
            <div className="h-full bg-blue-600" style={{ width: `${benefitsPercentage}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-0.5">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#006c4a] inline-block" />
              <span>Net ({breakdown.takeHomePercentage}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a] inline-block" />
              <span>Taxes ({taxPercentage}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
              <span>Benefits ({benefitsPercentage}%)</span>
            </div>
          </div>
        </div>

        {/* Gross vs Aggregate Deductions */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="bg-[#eff4ff] rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-display font-semibold text-xs sm:text-sm text-[#0b1c30]">
                Total Gross Pay
              </span>
              <span className="text-[11px] text-slate-500">
                {breakdown.regularHours.toFixed(1)}h base + {breakdown.overtimeHours.toFixed(1)}h OT ({activeJob.overtimeMultiplier}x)
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-base font-bold text-[#0b1c30]">
                {currencySymbol}
                {breakdown.grossPay.toFixed(2)}
              </span>
              <div className="text-[10px] text-slate-400 font-mono">{currency}</div>
            </div>
          </div>

          <div className="px-2 py-0.5 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
              Regular Hours ({breakdown.regularHours}h @ {currencySymbol}
              {activeJob.hourlyRate.toFixed(2)})
            </span>
            <span className="font-mono font-medium text-[#0b1c30]">
              {currencySymbol}
              {breakdown.regularPay.toFixed(2)}
            </span>
          </div>

          {breakdown.overtimeHours > 0 && (
            <div className="px-2 py-0.5 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#006c4a]">trending_up</span>
                Overtime ({breakdown.overtimeHours}h @ {currencySymbol}
                {(activeJob.hourlyRate * activeJob.overtimeMultiplier).toFixed(2)})
              </span>
              <span className="font-mono font-medium text-[#0b1c30]">
                {currencySymbol}
                {breakdown.overtimePay.toFixed(2)}
              </span>
            </div>
          )}

          <div className="bg-[#ffdad6]/60 text-[#93000a] rounded-lg p-2.5 flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">remove_circle_outline</span>
              <span className="font-display font-semibold text-xs sm:text-sm">Total Deductions</span>
            </div>
            <span className="font-mono text-base font-bold">
              -{currencySymbol}
              {breakdown.totalDeductions.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Statutory Withholdings Card */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-slate-600">account_balance</span>
            <h2 className="font-display font-semibold text-sm text-[#0b1c30]">Statutory Withholdings</h2>
          </div>
          <span className="font-mono text-xs text-[#ba1a1a] font-semibold">
            -{currencySymbol}
            {statutoryTotal.toFixed(2)} {currency}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {statutoryDeductions.map((item) => (
            <div key={item.id} className="bg-[#eff4ff] rounded-lg p-2.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-semibold text-[#0b1c30] truncate">{item.name}</span>
                  <span className="text-[10px] text-slate-500">{item.rateLabel}</span>
                </div>
                <span className="font-mono text-xs font-semibold text-[#ba1a1a] flex-shrink-0">
                  -{currencySymbol}
                  {item.amount.toFixed(2)}
                </span>
              </div>
              {item.ceilingProgress !== undefined && (
                <div className="flex flex-col gap-1 pt-1 border-t border-slate-200/50">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Annual Ceiling Progress</span>
                    <span className="font-mono font-semibold text-[#006c4a]">{item.ceilingProgress}% reached</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#dce9ff] rounded-full overflow-hidden">
                    <div className="bg-[#006c4a] h-full rounded-full" style={{ width: `${item.ceilingProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Voluntary Benefits Card */}
      {voluntaryDeductions.length > 0 && (
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-blue-600">health_and_safety</span>
              <h2 className="font-display font-semibold text-sm text-[#0b1c30]">Voluntary Benefits</h2>
            </div>
            <span className="font-mono text-xs text-[#ba1a1a] font-semibold">
              -{currencySymbol}
              {voluntaryTotal.toFixed(2)} {currency}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {voluntaryDeductions.map((item) => (
              <div key={item.id} className="bg-[#eff4ff] rounded-lg p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <div className="w-7 h-7 rounded-full bg-[#e5eeff] flex items-center justify-center flex-shrink-0 text-[#006c4a]">
                    <span className="material-symbols-outlined text-[16px]">
                      {item.name.toLowerCase().includes('rrsp') || item.name.toLowerCase().includes('401k')
                        ? 'savings'
                        : 'medical_services'}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-[#0b1c30] truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-500">{item.rateLabel}</span>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-[#ba1a1a] flex-shrink-0">
                  -{currencySymbol}
                  {item.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mathematical Formula Expander */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col">
        <button
          onClick={() => setFormulaOpen(!formulaOpen)}
          className="flex items-center justify-between w-full text-left min-h-[36px] focus:outline-none"
          type="button"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#006c4a]">calculate</span>
            <span className="font-display font-semibold text-xs sm:text-sm text-[#0b1c30]">
              Formula &amp; Bracket Logic
            </span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-slate-500 transition-transform">
            {formulaOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {formulaOpen && (
          <div className="flex flex-col gap-2 pt-2 text-xs text-slate-600 animate-entrance">
            <div className="bg-[#eff4ff] rounded-lg p-2.5 flex flex-col gap-1.5 font-mono text-[11px]">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400">GROSS EARNINGS FORMULA</span>
                <span className="text-[#0b1c30] font-semibold">
                  ({breakdown.regularHours}h × {currencySymbol}{activeJob.hourlyRate.toFixed(2)}) + ({breakdown.overtimeHours}h × {currencySymbol}{(activeJob.hourlyRate * activeJob.overtimeMultiplier).toFixed(2)}) = {currencySymbol}{breakdown.grossPay.toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-slate-200 my-0.5" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400">STATUTORY PRORATION</span>
                <span className="text-[#0b1c30]">
                  Basic Personal Exemption: Indexed for tax year {activeJob.taxYear}
                </span>
              </div>
              <div className="h-px bg-slate-200 my-0.5" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400">ANNUALIZED RUN-RATE</span>
                <span className="text-[#0b1c30] font-semibold">
                  ({currencySymbol}{breakdown.grossPay.toFixed(2)}) × {activeJob.periodsPerYear} periods = {currencySymbol}{breakdown.annualGross.toFixed(2)} {currency}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug px-1">
              Computations follow standard statutory tax bracket algorithms and payroll tax deduction guidelines.
            </p>
          </div>
        )}
      </div>

      {/* Projected Annual Summary */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#0b1c30]">analytics</span>
            <h2 className="font-display font-semibold text-sm text-[#0b1c30]">
              Annual Projection ({activeJob.periodsPerYear} Periods)
            </h2>
          </div>
          <span className="text-[10px] bg-[#dce9ff] text-slate-700 px-2 py-0.5 rounded-full font-bold">
            Pro-Rated
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#eff4ff] rounded-xl p-3 flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Gross Income</span>
            <span className="font-mono text-lg font-bold text-[#0b1c30]">
              {currencySymbol}
              {breakdown.annualGross.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500">Includes standard OT</span>
          </div>

          <div className="bg-[#82f5c1]/35 rounded-xl p-3 flex flex-col gap-0.5">
            <span className="text-[10px] text-[#00714e] uppercase font-bold tracking-wider">Estimated Net</span>
            <span className="font-mono text-lg font-bold text-[#00714e]">
              {currencySymbol}
              {breakdown.annualNet.toFixed(2)}
            </span>
            <span className="text-[10px] text-[#00714e]">After all withholdings</span>
          </div>
        </div>
      </div>

      {/* Quick Action Tray */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => exportPayStubPDF(activeJob, breakdown, 'Current Period 06')}
          className="flex-1 min-h-[44px] bg-[#131b2e] hover:bg-black text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Export Pay Stub</span>
        </button>
        <button
          onClick={handleShare}
          className="w-11 h-11 bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] rounded-xl flex items-center justify-center shadow-sm transition-all active:scale-95 flex-shrink-0 border border-slate-200/60"
          type="button"
          title="Share Summary"
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
        </button>
      </div>
    </div>
  );
};
