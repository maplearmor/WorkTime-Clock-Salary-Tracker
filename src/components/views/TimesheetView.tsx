import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TimeEntry } from '../../types';
import { exportTimesheetCSV, exportPayStubPDF } from '../../services/exportService';

interface TimesheetViewProps {
  onOpenManualEntry: () => void;
  onEditEntry: (entry: TimeEntry) => void;
  onViewAudit: (entry?: TimeEntry) => void;
}

export const TimesheetView: React.FC<TimesheetViewProps> = ({
  onOpenManualEntry,
  onEditEntry,
  onViewAudit,
}) => {
  const {
    activeJob,
    jobTimeEntries,
    resolveMissedPunch,
    currentSalaryBreakdown,
    setCurrentView,
    t,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'missed' | 'ot' | 'approved'>('all');
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
  const [missedReason, setMissedReason] = useState('Forgot to punch out at departure');
  const [correctedPunchTime, setCorrectedPunchTime] = useState('05:15 PM');

  const periods = [
    { label: 'Oct 13 – Oct 26, 2026', cycle: 'Current Biweekly (Cycle #21)', inProgress: true },
    { label: 'Sep 29 – Oct 12, 2026', cycle: 'Closed Biweekly (Cycle #20)', inProgress: false },
    { label: 'Sep 15 – Sep 28, 2026', cycle: 'Closed Biweekly (Cycle #19)', inProgress: false },
  ];

  const currentPeriod = periods[selectedPeriodIndex];

  // Filter entries
  const filteredEntries = jobTimeEntries.filter((e) => {
    if (activeFilter === 'missed') return e.status === 'missed_punch';
    if (activeFilter === 'ot') return e.overtimeHours > 0;
    if (activeFilter === 'approved') return e.status === 'approved' || e.status === 'completed';
    return true;
  });

  const missedEntry = jobTimeEntries.find((e) => e.status === 'missed_punch');

  // Compute billable sum for current list
  const totalBillable = filteredEntries.reduce((sum, e) => sum + e.totalHours, 0);
  const totalReg = filteredEntries.reduce((sum, e) => sum + e.regularHours, 0);
  const totalOt = filteredEntries.reduce((sum, e) => sum + e.overtimeHours, 0);


  return (
    <div className="flex flex-col w-full px-3.5 sm:px-4 pb-24 gap-3.5 pt-2">
      {/* Pay Period Navigation & Summary Header */}
      <section className="flex flex-col gap-2.5">

        {/* Period Totals Waterfall Surface */}
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            {/* Total Hours */}
            <div className="flex flex-col bg-[#eff4ff] p-2.5 rounded-lg">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Billable</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-2xl font-bold text-[#0b1c30]">
                  {totalBillable.toFixed(1)}
                </span>
                <span className="text-xs text-slate-500 font-mono">hrs</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                <span className="text-[#006c4a] font-semibold">{totalReg.toFixed(1)}h Reg</span>
                <span className="text-slate-300">•</span>
                <span className="text-blue-700 font-semibold">{totalOt.toFixed(1)}h OT (1.5x)</span>
              </div>
            </div>

            {/* Estimated Net Pay */}
            <div className="flex flex-col bg-[#82f5c1]/25 p-2.5 rounded-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#00714e] font-bold uppercase tracking-wider">
                  Est. Net Take-Home
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#006c4a] text-white text-[9px] uppercase font-bold">
                  EST
                </span>
              </div>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="font-mono text-2xl font-bold text-[#006c4a]">
                  {activeJob.currencySymbol}
                  {currentSalaryBreakdown.netPay.toFixed(2)}
                </span>
              </div>
              <span className="text-[10px] text-[#00714e] truncate mt-1">
                {activeJob.currency} after stat deductions
              </span>
            </div>
          </div>

          {/* Gross Pay Sub-row */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#eff4ff]/70 rounded-lg text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
              <span>Projected Gross Earnings</span>
            </div>
            <span className="font-mono font-semibold text-[#0b1c30]">
              {activeJob.currencySymbol}
              {currentSalaryBreakdown.grossPay.toFixed(2)}{' '}
              <span className="text-slate-400 font-normal">{activeJob.currency}</span>
            </span>
          </div>

          {/* Reports & Analytics Shortcut Banner */}
          <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-[#eff4ff] to-[#e6f7f0] rounded-lg border border-slate-200/60 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#006c4a]">query_stats</span>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Reports &amp; Analytics</span>
                <span className="text-[10px] text-slate-500">View payroll breakdown, overtime stats &amp; statutory taxes</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('reports')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-[#006c4a] border border-slate-200/80 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs active:scale-95"
            >
              <span>View</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter & Export Toolbar */}
      <section className="flex flex-col gap-2">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              activeFilter === 'all'
                ? 'bg-[#131b2e] text-white shadow-sm'
                : 'bg-[#eff4ff] text-slate-700 hover:bg-[#e5eeff]'
            }`}
            type="button"
          >
            All Days ({jobTimeEntries.length})
          </button>
          <button
            onClick={() => setActiveFilter('missed')}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
              activeFilter === 'missed'
                ? 'bg-[#ffdad6] text-[#93000a] shadow-sm'
                : 'bg-[#eff4ff] text-slate-700 hover:bg-[#e5eeff]'
            }`}
            type="button"
          >
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
            <span>Missing Punches ({missedEntry ? 1 : 0})</span>
          </button>
          <button
            onClick={() => setActiveFilter('ot')}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              activeFilter === 'ot'
                ? 'bg-[#131b2e] text-white shadow-sm'
                : 'bg-[#eff4ff] text-slate-700 hover:bg-[#e5eeff]'
            }`}
            type="button"
          >
            Overtime Days ({jobTimeEntries.filter((e) => e.overtimeHours > 0).length})
          </button>
          <button
            onClick={() => setActiveFilter('approved')}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              activeFilter === 'approved'
                ? 'bg-[#131b2e] text-white shadow-sm'
                : 'bg-[#eff4ff] text-slate-700 hover:bg-[#e5eeff]'
            }`}
            type="button"
          >
            Approved ({jobTimeEntries.filter((e) => e.status === 'approved' || e.status === 'completed').length})
          </button>
        </div>

        {/* Quick Export & Actions Toolbar (3 Full-Width Action Buttons) */}
        <div className="grid grid-cols-3 gap-2 w-full pt-0.5">
          <button
            onClick={() => exportPayStubPDF(activeJob, currentSalaryBreakdown, currentPeriod.label)}
            className="w-full flex items-center justify-center gap-1.5 h-10 px-2 sm:px-3 rounded-xl bg-white hover:bg-red-50 border border-slate-200/90 text-[#0b1c30] text-xs font-semibold transition-all shadow-2xs active:scale-95"
            title="Export Printable PDF Statement"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">picture_as_pdf</span>
            <span className="truncate">{t('pdfPayStub')}</span>
          </button>
          <button
            onClick={() => exportTimesheetCSV(activeJob, jobTimeEntries)}
            className="w-full flex items-center justify-center gap-1.5 h-10 px-2 sm:px-3 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200/90 text-[#0b1c30] text-xs font-semibold transition-all shadow-2xs active:scale-95"
            title="Export Spreadsheet CSV"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-[#006c4a]">table_view</span>
            <span className="truncate">{t('excelCsv')}</span>
          </button>
          <button
            onClick={() => onViewAudit()}
            className="w-full flex items-center justify-center gap-1.5 h-10 px-2 sm:px-3 rounded-xl bg-white hover:bg-blue-50 border border-slate-200/90 text-[#0b1c30] text-xs font-semibold transition-all shadow-2xs active:scale-95"
            title="View Complete Audit History"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">history</span>
            <span className="truncate">{t('auditLog')}</span>
          </button>
        </div>
      </section>

      {/* Missed Punch Correction Highlight Card (Audit Feature) */}
      {missedEntry && (
        <section className="bg-white rounded-xl p-3.5 shadow-sm border border-red-200 relative overflow-hidden flex flex-col gap-3">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ba1a1a]" />
          <div className="flex items-start justify-between gap-2 pl-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#ffdad6] text-[#93000a] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-semibold text-sm text-[#ba1a1a]">Missing Punch-Out</span>
                <span className="text-xs text-slate-500">{missedEntry.dayLabel} • Shift open</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[9px] uppercase font-bold tracking-wider">
              ACTION NEEDED
            </span>
          </div>

          <div className="bg-[#ffdad6]/20 rounded-lg p-2.5 pl-3 ml-2 flex flex-col gap-1.5 border border-red-100">
            <div className="grid grid-cols-3 gap-2 py-1 text-center">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Punch In</span>
                <span className="font-mono text-xs text-[#0b1c30] font-semibold">{missedEntry.punchIn}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Lunch Break</span>
                <span className="font-mono text-xs text-[#0b1c30] font-semibold">
                  {missedEntry.breakMinutes} mins
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#ba1a1a] uppercase font-bold">Punch Out</span>
                <span className="font-mono text-xs text-[#ba1a1a] font-bold">--:-- MISSING</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-500">
              <span className="material-symbols-outlined text-[15px]">history</span>
              <span>
                Pending Request: <span className="font-mono font-semibold text-[#0b1c30]">--:-- → {correctedPunchTime}</span>
              </span>
            </div>
          </div>

          {/* Inline Correction Panel */}
          <div className="pl-2 flex flex-col gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Adjusted Out Time
                </label>
                <input
                  type="text"
                  value={correctedPunchTime}
                  onChange={(e) => setCorrectedPunchTime(e.target.value)}
                  className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-xs font-mono text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Correction Reason (Audit Log)
                </label>
                <select
                  value={missedReason}
                  onChange={(e) => setMissedReason(e.target.value)}
                  className="w-full h-10 px-2 bg-[#eff4ff] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
                >
                  <option value="Forgot to punch out at departure">Forgot phone at desk during departure</option>
                  <option value="Client meeting offsite (No cellular service)">Client meeting offsite</option>
                  <option value="Device battery depleted before exit">Device battery depleted</option>
                  <option value="Supervisor pre-approved override">Supervisor pre-approved override</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => resolveMissedPunch(missedEntry.id, correctedPunchTime, missedReason)}
              className="w-full mt-1 min-h-[42px] bg-[#131b2e] hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
              <span>Resolve &amp; Correct Punch (Record Audit)</span>
            </button>
          </div>
        </section>
      )}

      {/* Detailed Daily Punch Ledger */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="font-display font-semibold text-sm text-[#0b1c30]">Daily Punch Ledger</span>
          <span className="text-xs text-slate-500">{filteredEntries.length} Logged Shifts</span>
        </div>

        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-2.5 transition-all hover:border-slate-300"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-sm text-[#0b1c30]">{entry.dayLabel}</span>
                  {entry.overtimeHours > 0 ? (
                    <span className="px-2 py-0.2 rounded-full bg-[#82f5c1] text-[#00714e] text-[9px] uppercase font-bold tracking-wider">
                      OT Day (+{entry.overtimeHours}h)
                    </span>
                  ) : entry.status === 'missed_punch' ? (
                    <span className="px-2 py-0.2 rounded-full bg-[#ffdad6] text-[#93000a] text-[9px] uppercase font-bold tracking-wider">
                      Incomplete
                    </span>
                  ) : (
                    <span className="px-2 py-0.2 rounded-full bg-[#eff4ff] text-slate-600 text-[9px] uppercase font-bold tracking-wider">
                      Regular
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {entry.status === 'in_progress' ? 'Active Shift' : 'Work Shift'} • {entry.totalHours} Hours Total
                </span>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="font-mono font-bold text-sm text-[#0b1c30]">
                  {activeJob.currencySymbol}
                  {entry.grossPay.toFixed(2)}
                </div>
                <div className="text-[11px] text-[#006c4a] font-medium">
                  Net: {activeJob.currencySymbol}
                  {entry.netPay.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Time Stamps Sequence Strip */}
            <div className="grid grid-cols-3 gap-1 py-1.5 px-2 bg-[#eff4ff] rounded-lg text-center">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Punch In</span>
                <span className="font-mono text-xs text-[#0b1c30] font-semibold">{entry.punchIn}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Break</span>
                <span className="font-mono text-xs text-[#0b1c30] font-semibold">{entry.breakMinutes} mins</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Punch Out</span>
                <span
                  className={`font-mono text-xs font-semibold ${
                    entry.status === 'missed_punch' ? 'text-[#ba1a1a] font-bold' : 'text-[#0b1c30]'
                  }`}
                >
                  {entry.punchOut}
                </span>
              </div>
            </div>

            {/* Shift Notes */}
            {entry.notes && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 text-xs text-slate-600">
                <span className="material-symbols-outlined text-[15px] text-slate-400 flex-shrink-0">
                  sticky_note_2
                </span>
                <span className="truncate">{entry.notes}</span>
              </div>
            )}

            {/* Entry Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                {entry.overtimeHours > 0
                  ? `${entry.overtimeHours}h OT billed at 1.5x`
                  : 'Standard scheduled shift'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onViewAudit(entry)}
                  className="px-2 py-0.8 rounded bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-700 font-medium transition-colors"
                  type="button"
                >
                  Audit
                </button>
                <button
                  onClick={() => onEditEntry(entry)}
                  className="px-2 py-0.8 rounded bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-700 font-medium transition-colors flex items-center gap-1"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[13px]">edit</span>
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Floating Bottom Add Past Time Entry Button */}
      <div className="sticky bottom-20 mt-2 w-full flex justify-center z-30 pointer-events-none">
        <button
          onClick={onOpenManualEntry}
          className="pointer-events-auto min-h-[44px] px-5 py-2.5 rounded-full bg-[#131b2e] hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-xl active:scale-95 transition-all"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-emerald-400">add_alarm</span>
          <span>Add Past Time Entry</span>
        </button>
      </div>
    </div>
  );
};
