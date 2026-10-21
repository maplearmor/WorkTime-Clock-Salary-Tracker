import React, { useState, useEffect, useRef } from 'react';
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
    t,
  } = useApp();

  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const jobButtonRef = useRef<HTMLButtonElement>(null);

  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    const rawHours = now.getHours();
    const h = String(rawHours % 12 || 12).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const ampm = rawHours >= 12 ? 'PM' : 'AM';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    return { hours: h, minutes: m, seconds: s, ampm, dateStr };
  });


  useEffect(() => {
    if (jobDropdownOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setJobDropdownOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [jobDropdownOpen]);

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
      {/* State Simulation Bar (Simulate State button removed, others preserved) */}
      <div className="bg-[#eff4ff] border border-slate-200/60 rounded-xl p-1.5 sm:p-2 shadow-xs">
        <div className="grid grid-cols-4 gap-1.5 w-full">
          <button
            onClick={() => simulateState('WORKING')}
            className={`w-full py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all active:scale-95 border flex items-center justify-center ${
              punchState === 'WORKING'
                ? 'bg-[#131b2e] text-[#82f5c1] border-[#131b2e] shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
            }`}
            type="button"
          >
            {t('working')}
          </button>
          <button
            onClick={() => simulateState('ON_BREAK')}
            className={`w-full py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all active:scale-95 border flex items-center justify-center ${
              punchState === 'ON_BREAK'
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
            }`}
            type="button"
          >
            {t('break')}
          </button>
          <button
            onClick={() => simulateState('CLOCKED_OUT')}
            className={`w-full py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all active:scale-95 border flex items-center justify-center ${
              punchState === 'CLOCKED_OUT'
                ? 'bg-[#213145] text-white border-[#213145] shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
            }`}
            type="button"
          >
            {t('offShift')}
          </button>
          <button
            onClick={() => simulateState('MISSED_PUNCH')}
            className={`w-full py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all active:scale-95 border flex items-center justify-center ${
              punchState === 'MISSED_PUNCH'
                ? 'bg-[#ffdad6] text-[#93000a] border-red-300 shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
            }`}
            type="button"
          >
            {t('missed')}
          </button>
        </div>
      </div>

      {/* Live Punch Hero Module (Where punch in button is located) */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60 flex flex-col gap-3 relative">
        {/* Top Status Row: Off Shift Indicator & Acme Tech Dropdown */}
        <div className="flex items-center justify-between gap-2">
          {/* Active Working / Off Shift Status Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
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
                ? t('currentlyWorking')
                : punchState === 'ON_BREAK'
                ? t('onBreak')
                : punchState === 'MISSED_PUNCH'
                ? t('missedPunchOut')
                : t('offShiftStatus')}
            </span>
          </div>

          {/* Active Job Selection Dropdown (Positioned on top where off shift indicator is located) */}
          <div className="relative">
            <button
              ref={jobButtonRef}
              onClick={() => setJobDropdownOpen(!jobDropdownOpen)}
              className="h-8 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 flex items-center gap-1.5 transition-all active:scale-95 text-xs text-[#0b1c30] font-semibold shadow-2xs"
              type="button"
              title="Switch Active Job Profile"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/15 shadow-2xs"
                style={{ backgroundColor: activeJob.color }}
              />
              <span className="max-w-[105px] xs:max-w-[135px] truncate font-semibold">
                {activeJob.shortName} ({activeJob.currency})
              </span>
              <span className="material-symbols-outlined text-[16px] text-slate-500 shrink-0">arrow_drop_down</span>
            </button>

            {jobDropdownOpen && (
              <>
                {/* Solid Dim Backdrop */}
                <div
                  className="fixed inset-0 z-[60] bg-black/40"
                  onClick={() => setJobDropdownOpen(false)}
                />

                {/* 100% Solid Opaque Dropdown Menu */}
                <div
                  style={{ backgroundColor: '#ffffff', opacity: 1 }}
                  className="absolute right-0 top-full mt-2 w-[min(300px,calc(100vw-36px))] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] border-2 border-slate-300 py-0 z-[70] text-slate-900 overflow-hidden"
                >
                  {/* Header */}
                  <div
                    style={{ backgroundColor: '#f1f5f9' }}
                    className="px-3.5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between"
                  >
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Select Active Job
                    </span>
                    <span className="text-[10px] font-bold text-[#006c4a] bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      {jobs.length} profiles
                    </span>
                  </div>

                  {/* Job Options List */}
                  <div
                    style={{ backgroundColor: '#ffffff' }}
                    className="max-h-[min(300px,50vh)] overflow-y-auto divide-y divide-slate-100 no-scrollbar bg-white"
                  >
                    {jobs.map((job) => {
                      const isSelected = job.id === activeJob.id;
                      return (
                        <button
                          key={job.id}
                          onClick={() => {
                            switchJob(job.id);
                            setJobDropdownOpen(false);
                          }}
                          style={{ backgroundColor: isSelected ? '#eff6ff' : '#ffffff' }}
                          className={`w-full text-left px-3.5 py-3 flex items-center justify-between text-xs transition-colors min-h-[48px] ${
                            isSelected
                              ? 'bg-blue-50 font-bold border-l-4 border-l-[#006c4a]'
                              : 'hover:bg-slate-50 border-l-4 border-l-transparent text-slate-800'
                          }`}
                          type="button"
                        >
                          <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 mr-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/20 shadow-xs"
                              style={{ backgroundColor: job.color }}
                            />
                            <div className="truncate flex-1 min-w-0">
                              <div className="truncate font-bold text-slate-900 text-xs">
                                {job.companyName}
                              </div>
                              <div className="text-[11px] text-slate-600 truncate mt-0.5 font-medium">
                                {job.currencySymbol}
                                {job.hourlyRate.toFixed(2)} {job.currency}/hr • {job.province}, {job.country.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          {isSelected ? (
                            <span className="material-symbols-outlined text-[20px] text-[#006c4a] shrink-0 font-bold">
                              check_circle
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-[18px] text-slate-300 shrink-0">
                              radio_button_unchecked
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add New Job Profile Action */}
                  <div
                    style={{ backgroundColor: '#f8fafc' }}
                    className="p-2.5 border-t border-slate-200 bg-slate-50"
                  >
                    <button
                      onClick={() => {
                        setJobDropdownOpen(false);
                        onOpenAddJob();
                      }}
                      className="w-full min-h-[38px] py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-95"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[17px] text-[#006c4a] font-bold">
                        add_circle
                      </span>
                      <span>Add New Job Profile</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
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
                  <span>{t('punchOut')}</span>
                </button>
                <button
                  onClick={startBreak}
                  className="btn-shimmer w-full min-h-[50px] px-4 py-2.5 rounded-xl bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] font-display font-semibold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-slate-200/50"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#006c4a]">coffee</span>
                  <span>{t('takeBreak')} (30m)</span>
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
                  <span>{t('resumeShift')}</span>
                </button>
                <button
                  onClick={punchOut}
                  className="w-full min-h-[50px] px-4 py-2.5 rounded-xl bg-[#ffdad6] text-[#93000a] font-display font-semibold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-red-200"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span>{t('punchOutNow')}</span>
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
                  <span>{t('punchIn')}</span>
                </button>
                <button
                  onClick={onOpenManualEntry}
                  className="w-full min-h-[50px] px-4 py-2.5 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-800 font-display font-semibold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-slate-200/50"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#006c4a]">edit_calendar</span>
                  <span>{t('logShiftRecord')}</span>
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
