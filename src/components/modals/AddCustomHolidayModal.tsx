import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HolidayItem } from '../../types';

interface AddCustomHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCustomHolidayModal: React.FC<AddCustomHolidayModalProps> = ({ isOpen, onClose }) => {
  const { activeJob, addCustomHoliday } = useApp();

  const [name, setName] = useState('Acme Founders Day');
  const [date, setDate] = useState('2026-11-15');
  const [multiplier, setMultiplier] = useState(2.0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateObj = new Date(`${date}T12:00:00`);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const mStr = months[dateObj.getMonth()];
    const day = dateObj.getDate();

    const newHoliday: HolidayItem = {
      id: `hol_custom_${Date.now()}`,
      country: activeJob.country,
      province: activeJob.province,
      month: mStr,
      day,
      dateString: date,
      name,
      typeLabel: `Custom Corporate Holiday (${multiplier}× OT)`,
      multiplier: Number(multiplier),
      isCustom: true,
    };

    addCustomHoliday(newHoliday);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-entrance">
      <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-2xl border border-slate-200 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-[20px]">celebration</span>
            <h3 className="font-display font-bold text-sm text-[#0b1c30]">Add Custom Holiday</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Holiday Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Founders Day"
              className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#006c4a]"
              required
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Observed Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#006c4a]"
              required
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Pay Multiplier Rate</label>
            <select
              value={multiplier}
              onChange={(e) => setMultiplier(parseFloat(e.target.value))}
              className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#006c4a]"
            >
              <option value="1.5">1.5× Regular Hourly Rate</option>
              <option value="2.0">2.0× Double Time (Standard Statutory)</option>
              <option value="2.5">2.5× Double Time &amp; Half</option>
              <option value="3.0">3.0× Triple Time (Golden Week / Premium)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-lg bg-[#006c4a] hover:bg-[#005137] text-white font-semibold shadow-sm"
            >
              Add Holiday
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
