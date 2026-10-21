import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getHolidaysForJob } from '../../services/holidays';
import { HolidayItem } from '../../types';

interface CalendarViewProps {
  onAddCustomHoliday: () => void;
  onOpenManualEntryWithDate?: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onAddCustomHoliday,
  onOpenManualEntryWithDate,
}) => {
  const { activeJob, customHolidays, deleteCustomHoliday, jobTimeEntries } = useApp();

  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDate());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const holidays = getHolidaysForJob(activeJob.country, activeJob.province, customHolidays);

  // Month days calculation
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const selectedDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
    selectedDay
  ).padStart(2, '0')}`;

  const entryForSelectedDay = jobTimeEntries.find((e) => e.date === selectedDateStr);
  const holidayForSelectedDay = holidays.find((h) => {
    if (h.dateString) {
      return h.dateString === selectedDateStr;
    }
    const mStr = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][currentMonth];
    return h.month === mStr && h.day === selectedDay;
  });

  return (
    <div className="flex flex-col w-full px-3.5 sm:px-4 pb-24 gap-3.5 pt-2">
      {/* Calendar Header with Month Selector */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#006c4a]">calendar_month</span>
            <h2 className="font-display font-semibold text-sm sm:text-base text-[#0b1c30]">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] flex items-center justify-center text-slate-700 active:scale-95 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-700 active:scale-95 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {/* Empty prefix slots */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty_${i}`} className="h-10 rounded-lg" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
              dayNum
            ).padStart(2, '0')}`;

            const isSelected = selectedDay === dayNum;
            const realNow = new Date();
            const isToday =
              (currentYear === realNow.getFullYear() && currentMonth === realNow.getMonth() && dayNum === realNow.getDate()) ||
              (currentYear === 2026 && currentMonth === 9 && dayNum === 24);
            const entry = jobTimeEntries.find((e) => e.date === dateStr);
            const holiday = holidays.find((h) => {
              const mStr = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][currentMonth];
              return h.month === mStr && h.day === dayNum;
            });

            return (
              <button
                key={`day_${dayNum}`}
                onClick={() => setSelectedDay(dayNum)}
                className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-95 border ${
                  isSelected
                    ? 'bg-[#131b2e] text-white border-[#131b2e] shadow-sm font-bold'
                    : isToday
                    ? 'bg-[#82f5c1]/30 text-[#00714e] border-emerald-300 font-bold'
                    : 'bg-[#eff4ff]/60 hover:bg-[#eff4ff] text-slate-700 border-transparent'
                }`}
                type="button"
              >
                <span className="text-xs">{dayNum}</span>

                {/* Status Dot Indicators */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {entry?.status === 'missed_punch' ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                  ) : entry?.overtimeHours ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  ) : entry ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]" />
                  ) : null}

                  {holiday && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#006c4a]" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Overtime</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
            <span>Missed Punch</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Holiday (2.0x)</span>
          </div>
        </div>
      </div>

      {/* Selected Day Inspector Card */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#006c4a]">event</span>
            <span className="font-display font-semibold text-xs sm:text-sm text-[#0b1c30]">
              {monthNames[currentMonth]} {selectedDay}, {currentYear}
            </span>
          </div>
          <span className="text-[10px] bg-[#eff4ff] text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
            {holidayForSelectedDay ? 'Public Holiday' : entryForSelectedDay ? 'Logged Shift' : 'No Recorded Shift'}
          </span>
        </div>

        {holidayForSelectedDay && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-700">celebration</span>
              <div>
                <span className="font-semibold text-amber-950 block">{holidayForSelectedDay.name}</span>
                <span className="text-[11px] text-amber-700">{holidayForSelectedDay.typeLabel}</span>
              </div>
            </div>
            <span className="font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[11px]">
              {holidayForSelectedDay.multiplier}× Rate
            </span>
          </div>
        )}

        {entryForSelectedDay ? (
          <div className="bg-[#eff4ff] rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0b1c30]">{entryForSelectedDay.dayLabel}</span>
              <span className="font-mono text-xs font-bold text-[#006c4a]">
                {activeJob.currencySymbol}
                {entryForSelectedDay.grossPay.toFixed(2)} Gross
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center text-xs bg-white p-2 rounded-lg">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Punch In</span>
                <span className="font-mono font-semibold">{entryForSelectedDay.punchIn}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Total Hours</span>
                <span className="font-mono font-semibold">{entryForSelectedDay.totalHours} hrs</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Punch Out</span>
                <span className="font-mono font-semibold">{entryForSelectedDay.punchOut}</span>
              </div>
            </div>
            {entryForSelectedDay.notes && (
              <span className="text-xs text-slate-600 italic">Notes: {entryForSelectedDay.notes}</span>
            )}
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-lg text-center flex flex-col items-center justify-center gap-1.5">
            <p className="text-xs text-slate-500">No time entry recorded for this date.</p>
            {onOpenManualEntryWithDate && (
              <button
                onClick={() => onOpenManualEntryWithDate(selectedDateStr)}
                className="px-3 py-1 bg-[#131b2e] text-white rounded-lg text-xs font-semibold hover:bg-black active:scale-95 transition-all shadow-sm"
                type="button"
              >
                Log Shift for this Day
              </button>
            )}
          </div>
        )}
      </div>

      {/* Statutory Public Holidays Section */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#006c4a]">celebration</span>
            <h2 className="font-display font-semibold text-sm text-[#0b1c30]">
              Statutory Public Holidays ({activeJob.provinceName || activeJob.countryName})
            </h2>
          </div>
          <span className="text-[10px] bg-[#82f5c1] text-[#00714e] px-2 py-0.5 rounded-full font-bold">
            {holidays.length} Active
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Official statutory calendar rules. Work on statutory days triggers {activeJob.holidayMultiplier}x compensation.
        </p>

        <div className="space-y-1.5 pt-1">
          {holidays.map((hol) => (
            <div
              key={hol.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#dce9ff] text-[#006c4a] flex flex-col items-center justify-center font-mono font-bold leading-none flex-shrink-0">
                  <span className="text-[9px] text-slate-500">{hol.month}</span>
                  <span className="text-xs">{hol.day}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[#0b1c30] block truncate">{hol.name}</span>
                  <span className="text-[10px] text-[#006c4a] font-semibold">{hol.typeLabel}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded font-bold text-slate-700">
                  {hol.multiplier}x
                </span>
                {hol.isCustom ? (
                  <button
                    onClick={() => deleteCustomHoliday(hol.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                    title="Delete custom holiday"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                ) : (
                  <span className="material-symbols-outlined text-[16px] text-slate-400">lock</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Company Holiday Button */}
        <button
          onClick={onAddCustomHoliday}
          className="w-full min-h-[40px] py-2 px-3 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#006c4a] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200/50 mt-1 active:scale-95"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Add Custom Company Holiday</span>
        </button>
      </div>
    </div>
  );
};
