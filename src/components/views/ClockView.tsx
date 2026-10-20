import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

interface ClockViewProps {
  onOpenManualEntry: () => void;
  onOpenAdjustPunch: () => void;
  onOpenAddJob: () => void;
}

export const ClockView: React.FC<ClockViewProps> = ({
  onOpenManualEntry,
  onOpenAdjustPunch,
  onOpenAddJob,
}) => {
  const {
    activeJob,
    jobs,
    switchJob,
    punchState,
    elapsedSeconds,
    breakElapsedSeconds,
    punchIn,
    startBreak,
    endBreak,
    punchOut,
    simulateState,
    todayEarnings,
    weeklyStats,
    todayTimeline,
    setCurrentView,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    ampm: string;
    dateStr: string;
  }>({
    hours: '08',
    minutes: '24',
    seconds: '03',
    ampm: 'AM',
    dateStr: 'Thursday, Oct 24, 2026',
  });

  const [noticeDismissed, setNoticeDismissed] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const rawHours = now.getHours();
      const h = String(rawHours % 12 || 12).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const ampm = rawHours >= 12 ? 'PM' : 'AM';
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

      setCurrentTime({ hours: h, minutes: m, seconds: s, ampm, dateStr });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHMS = (totalSecs: number) => {
    const h = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
    const s = String(totalSecs % 60).padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="flex flex-col w-full px-3.5 sm:px-4 pb-24 gap-3 pt-2">
      {/* State Simulation Control Bar */}
      <div className="bg-[#eff4ff] border border-slate-200/60 rounded-xl px-3 py-2 flex items-center justify-between gap-1.5 shadow-sm animate-entrance">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#006c4a]">tune</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Simulate:</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => simulateState('WORKING')}
            className={`px-2 py-0.8 rounded-lg text-[10px] font-bold uppercase transition-all active:scale-95 ${
              punchState === 'WORKING'
                ? 'bg-[#131b2e] text-[#82f5c1] shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600'
            }`}
            type="button"
          >
            Working
          </button>
          <button
            onClick={() => simulateState('ON_BREAK')}
            className={`px-2 py-0.8 rounded-lg text-[10px] font-bold uppercase transition-all active:scale-95 ${
              punchState === 'ON_BREAK'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600'
            }`}
            type="button"
          >
            Break
          </button>
          <button
            onClick={() => simulateState('CLOCKED_OUT')}
            className={`px-2 py-0.8 rounded-lg text-[10px] font-bold uppercase transition-all active:scale-95 ${
              punchState === 'CLOCKED_OUT'
                ? 'bg-[#213145] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600'
            }`}
            type="button"
          >
            Off Shift
          </button>
          <button
            onClick={() => simulateState('MISSED_PUNCH')}
            className={`px-2 py-0.8 rounded-lg text-[10px] font-bold uppercase transition-all active:scale-95 ${
              punchState === 'MISSED_PUNCH'
                ? 'bg-[#ffdad6] text-[#93000a] shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600'
            }`}
            type="button"
          >
            Missed
          </button>
        </div>
      </div>

      {/* Multi-Job Switcher Horizontal Pills */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {jobs.map((job) => {
            const isSelected = job.id === activeJob.id;
            return (
              <button
                key={job.id}
                onClick={() => switchJob(job.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full flex-shrink-0 text-xs font-semibold transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[#131b2e] text-white shadow-sm'
                    : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-700'
                }`}
                type="button"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? job.accentBg : '#94a3b8' }}
                />
                <span className="truncate max-w-[150px]">
                  {job.shortName} • {job.currency} ({job.currencySymbol}
                  {job.hourlyRate.toFixed(2)})
                </span>
              </button>
            );
          })}
          <button
            onClick={onOpenAddJob}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 flex-shrink-0 shadow-sm border border-slate-200 text-xs font-medium active:scale-95 transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-[#006c4a]">add</span>
            <span>Add Job</span>
          </button>
        </div>

        {/* Active Profile & Role Meta Banner */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center flex-shrink-0 text-[#006c4a]">
              <span className="material-symbols-outlined text-[24px]">terminal</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-semibold text-sm text-[#0b1c30] truncate">
                  {activeJob.companyName}
                </span>
                <span className="material-symbols-outlined text-[#006c4a] text-[16px]">verified</span>
              </div>
              <span className="text-xs text-slate-500 truncate">
                {activeJob.position} • {activeJob.currencySymbol}
                {activeJob.hourlyRate.toFixed(2)} {activeJob.currency}/hr
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Shift Rate</span>
            <span className="font-mono text-xs text-[#006c4a] font-semibold">1.0x Regular</span>
          </div>
        </div>
      </div>

      {/* Dynamic Contextual Notice Alert (Missed Punch, Shift Completed, or Review) */}
      {!noticeDismissed && (
        <div
          className={`rounded-xl p-3 shadow-sm flex items-start gap-2.5 relative overflow-hidden transition-all ${
            punchState === 'MISSED_PUNCH'
              ? 'bg-[#ffdad6] border border-red-300 alert-card-pulse'
              : punchState === 'CLOCKED_OUT'
              ? 'bg-[#82f5c1]/20 border border-emerald-200'
              : punchState === 'ON_BREAK'
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-[#dce9ff]/60 border border-slate-200/70 alert-card-pulse'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              punchState === 'MISSED_PUNCH'
                ? 'bg-red-200 text-[#ba1a1a]'
                : punchState === 'CLOCKED_OUT'
                ? 'bg-emerald-100 text-[#006c4a]'
                : punchState === 'ON_BREAK'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-[#d3e4fe] text-[#ba1a1a]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {punchState === 'MISSED_PUNCH'
                ? 'warning'
                : punchState === 'CLOCKED_OUT'
                ? 'verified'
                : punchState === 'ON_BREAK'
                ? 'free_breakfast'
                : 'notification_important'}
            </span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display font-semibold text-xs sm:text-sm text-[#0b1c30]">
                {punchState === 'MISSED_PUNCH'
                  ? '⚠ You may have forgotten to punch out'
                  : punchState === 'CLOCKED_OUT'
                  ? 'Workday Completed!'
                  : punchState === 'ON_BREAK'
                  ? 'Rest Period Active'
                  : "Review Yesterday's Punch"}
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                  punchState === 'MISSED_PUNCH'
                    ? 'bg-[#ba1a1a] text-white'
                    : punchState === 'CLOCKED_OUT'
                    ? 'bg-[#006c4a] text-white'
                    : punchState === 'ON_BREAK'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-[#ffdad6] text-[#93000a]'
                }`}
              >
                {punchState === 'MISSED_PUNCH'
                  ? 'Overdue'
                  : punchState === 'CLOCKED_OUT'
                  ? 'Saved'
                  : punchState === 'ON_BREAK'
                  ? 'Resting'
                  : 'Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
              {punchState === 'MISSED_PUNCH'
                ? 'Expected End: 5:00 PM (Current: 6:15 PM). You are still clocked in past scheduled shift end.'
                : punchState === 'CLOCKED_OUT'
                ? 'Great work today! All hours and estimated gross & net earnings are saved into your biweekly timesheet.'
                : punchState === 'ON_BREAK'
                ? 'You are on scheduled break. Working timer is paused until you click End Break to resume.'
                : 'Your scheduled shift finished at 5:00 PM yesterday without a checkout stamp. Adjust prior entry?'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {punchState === 'MISSED_PUNCH' ? (
                <>
                  <button
                    onClick={punchOut}
                    className="px-2.5 py-1 rounded-lg bg-[#ba1a1a] hover:bg-red-800 text-white text-xs font-semibold active:scale-95 transition-all shadow-sm flex items-center gap-1"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">logout</span>
                    <span>PUNCH OUT NOW</span>
                  </button>
                  <button
                    onClick={onOpenAdjustPunch}
                    className="px-2.5 py-1 rounded-lg bg-[#213145] text-[#eaf1ff] text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
                    type="button"
                  >
                    EDIT TIME
                  </button>
                  <button
                    onClick={() => setNoticeDismissed(true)}
                    className="text-xs text-slate-500 hover:text-slate-800 transition-colors ml-1"
                    type="button"
                  >
                    DISMISS
                  </button>
                </>
              ) : punchState === 'CLOCKED_OUT' ? (
                <button
                  onClick={() => setCurrentView('timesheet')}
                  className="px-2.5 py-1 rounded-lg bg-[#006c4a] text-white text-xs font-semibold hover:bg-[#005137] active:scale-95 transition-all shadow-sm flex items-center gap-1"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                  <span>View in Timesheet</span>
                </button>
              ) : punchState === 'ON_BREAK' ? (
                <button
                  onClick={endBreak}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold active:scale-95 transition-all shadow-sm flex items-center gap-1"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                  <span>Resume Shift</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={onOpenAdjustPunch}
                    className="px-2.5 py-1 rounded-lg bg-[#213145] text-[#eaf1ff] text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
                    type="button"
                  >
                    <span>Adjust Punch</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                  <button
                    onClick={() => setNoticeDismissed(true)}
                    className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                    type="button"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Punch Hero Module */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60 flex flex-col gap-3 relative overflow-hidden">
        {/* Top Status Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Active Working Status Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              punchState === 'WORKING'
                ? 'bg-[#82f5c1] text-[#00714e]'
                : punchState === 'ON_BREAK'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : punchState === 'MISSED_PUNCH'
                ? 'bg-[#ffdad6] text-[#93000a]'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {punchState === 'WORKING' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006c4a] opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  punchState === 'WORKING'
                    ? 'bg-[#006c4a]'
                    : punchState === 'ON_BREAK'
                    ? 'bg-amber-600'
                    : punchState === 'MISSED_PUNCH'
                    ? 'bg-[#ba1a1a]'
                    : 'bg-slate-400'
                }`}
              />
            </span>
            <span>
              {punchState === 'WORKING'
                ? 'Currently Working'
                : punchState === 'ON_BREAK'
                ? 'On Break (Resting)'
                : punchState === 'MISSED_PUNCH'
                ? 'Missed Punch-Out'
                : 'Off Shift'}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {punchState === 'WORKING'
              ? 'Shift: 08:45 AM'
              : punchState === 'ON_BREAK'
              ? 'Break: 30m max'
              : 'Shift Completed'}
          </span>
        </div>

        {/* Live Digital Clock & Elapsed Tracker */}
        <div className="flex flex-col items-center justify-center py-1.5 text-center">
          <div className="text-[11px] uppercase text-[#006c4a] font-semibold tracking-widest mb-0.5 flex items-center gap-1 font-mono">
            <span className="material-symbols-outlined text-[15px]">
              {punchState === 'ON_BREAK' ? 'free_breakfast' : 'timer'}
            </span>
            <span>
              {punchState === 'ON_BREAK'
                ? 'Break Time: '
                : punchState === 'CLOCKED_OUT'
                ? 'Total Logged: '
                : 'Elapsed: '}
            </span>
            <span className="font-bold">
              {punchState === 'ON_BREAK'
                ? formatHMS(breakElapsedSeconds)
                : formatHMS(elapsedSeconds)}
            </span>
          </div>

          <div className="font-mono text-3xl sm:text-4xl font-bold text-[#0b1c30] tracking-tight select-none">
            {currentTime.hours}
            <span className="clock-colon">:</span>
            {currentTime.minutes}
            <span className="clock-colon">:</span>
            {currentTime.seconds} {currentTime.ampm}
          </div>

          <span className="text-xs text-slate-500 mt-1">
            {currentTime.dateStr} • {activeJob.city} ({activeJob.currency})
          </span>
        </div>

        {/* Hero Tactile Primary Punch Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {punchState === 'WORKING' ? (
              <>
                <button
                  onClick={punchOut}
                  className="w-full min-h-[50px] px-4 py-2.5 rounded-xl bg-[#ffdad6] text-[#93000a] font-display font-bold text-sm shadow-sm flex items-center justify-center gap-2 pulse-glow-punch active:scale-[0.98] transition-all hover:brightness-105"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span>PUNCH OUT</span>
                </button>
                <button
                  onClick={startBreak}
                  className="btn-shimmer w-full min-h-[50px] px-4 py-2.5 rounded-xl bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] font-display font-semibold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-slate-200/50"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#006c4a]">coffee</span>
                  <span>Start Break (30m)</span>
                </button>
              </>
            ) : punchState === 'ON_BREAK' ? (
              <>
                <button
                  onClick={endBreak}
                  className="w-full min-h-[50px] px-4 py-2.5 rounded-xl bg-[#006c4a] text-white font-display font-bold text-sm shadow-sm flex items-center justify-center gap-2 pulse-glow-green active:scale-[0.98] transition-all hover:brightness-105"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                  <span>END BREAK (RESUME)</span>
                </button>
                <button
                  onClick={punchOut}
                  className="w-full min-h-[50px] px-4 py-2.5 rounded-xl bg-[#ffdad6] text-[#93000a] font-display font-semibold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-red-200"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span>Punch Out Directly</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={punchIn}
                  className="w-full min-h-[50px] px-4 py-2.5 rounded-xl bg-[#006c4a] text-white font-display font-bold text-sm shadow-md flex items-center justify-center gap-2 pulse-glow-green active:scale-[0.98] transition-all hover:brightness-105"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  <span>PUNCH IN</span>
                </button>
                <button
                  onClick={onOpenManualEntry}
                  className="w-full min-h-[50px] px-4 py-2.5 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-800 font-display font-semibold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-slate-200/50"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#006c4a]">edit_calendar</span>
                  <span>Log Shift Record</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Financial & Work Hours Bento Grid */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Today &amp; Pay Period Metrics
          </span>
          <span className="text-xs text-[#006c4a] font-medium">Auto-calculated</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Card 1: Today's Total Hours */}
          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider">Today's Hours</span>
              <span className="material-symbols-outlined text-[18px] text-[#006c4a]">hourglass_top</span>
            </div>
            <div className="my-1.5">
              <span className="font-mono text-2xl font-bold text-[#0b1c30]">
                {todayEarnings.hours}
              </span>
              <span className="text-xs text-slate-500 ml-1">hrs</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>Gross Earned:</span>
              <span className="font-mono font-semibold text-[#0b1c30]">
                {activeJob.currencySymbol}
                {todayEarnings.gross.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Card 2: Estimated Net Today */}
          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider">Est. Net Today</span>
              <span className="material-symbols-outlined text-[18px] text-[#006c4a]">account_balance_wallet</span>
            </div>
            <div className="my-1.5">
              <span className="font-mono text-2xl font-bold text-[#006c4a]">
                {activeJob.currencySymbol}
                {todayEarnings.net.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>Tax / Pension:</span>
              <span className="font-mono font-semibold text-[#ba1a1a]">
                -{activeJob.currencySymbol}
                {todayEarnings.tax.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Card 3: Weekly Cumulation */}
          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider">This Week</span>
              <span className="material-symbols-outlined text-[18px] text-slate-600">calendar_view_week</span>
            </div>
            <div className="my-1.5">
              <span className="font-mono text-2xl font-bold text-[#0b1c30]">
                {weeklyStats.hours}
              </span>
              <span className="text-xs text-slate-500 ml-1">hrs</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-500">Overtime:</span>
              <span className="font-mono font-semibold text-[#006c4a]">
                +{weeklyStats.overtime} hrs
              </span>
            </div>
          </div>

          {/* Card 4: Next Pay Cycle */}
          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider">Pay Date</span>
              <span className="material-symbols-outlined text-[18px] text-slate-600">event_repeat</span>
            </div>
            <div className="my-1.5">
              <span className="font-display text-xl font-bold text-[#0b1c30]">Oct 31</span>
              <span className="text-[11px] text-slate-500 block">7 days remaining</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span className="capitalize">{activeJob.payFrequency}</span>
              <span className="material-symbols-outlined text-[16px] text-[#006c4a]">check_circle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shift Timeline & Activity Log Card */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#006c4a]">history_toggle_off</span>
            <span className="font-display font-semibold text-sm text-[#0b1c30]">Today's Shift Timeline</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eff4ff] text-slate-600 font-bold uppercase">
            {todayTimeline.length} Events
          </span>
        </div>

        {/* Timeline Entries List */}
        <div className="flex flex-col gap-2 pt-1 relative">
          {todayTimeline.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-[#eff4ff] transition-colors group"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`relative w-7 h-7 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                >
                  {idx === todayTimeline.length - 1 && punchState === 'WORKING' && (
                    <span className="radar-ring" />
                  )}
                  <span className="material-symbols-outlined text-[16px] relative z-10">{item.icon}</span>
                </div>
                {idx < todayTimeline.length - 1 && <div className="w-0.5 h-6 bg-slate-200 mt-1" />}
              </div>

              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-semibold text-[#0b1c30] truncate">{item.title}</span>
                  <span className="text-[11px] text-slate-500 truncate">{item.detail}</span>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-800 flex-shrink-0">
                  {item.timeStr}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Action Footers */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onOpenManualEntry}
            className="min-h-[40px] px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-[#006c4a]">add_circle</span>
            <span>Manual Entry</span>
          </button>
          <button
            onClick={() => setCurrentView('timesheet')}
            className="min-h-[40px] px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Full Timesheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
