import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface ManualEntryModalProps {
  isOpen: boolean;
  initialDate?: string;
  onClose: () => void;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ isOpen, initialDate, onClose }) => {
  const { activeJob, addTimeEntry } = useApp();

  const [date, setDate] = useState(() => initialDate || new Date().toISOString().slice(0, 10));
  const [punchIn, setPunchIn] = useState('09:00 AM');
  const [punchOut, setPunchOut] = useState('05:30 PM');
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [regularHours, setRegularHours] = useState(8.0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [notes, setNotes] = useState('Manual shift entry');

  React.useEffect(() => {
    if (isOpen) {
      if (initialDate) {
        setDate(initialDate);
      } else {
        setDate(new Date().toISOString().slice(0, 10));
      }
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateObj = new Date(`${date}T12:00:00`);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayLabel = `${days[dateObj.getDay()]}, ${months[dateObj.getMonth()]} ${dateObj.getDate()}`;

    addTimeEntry({
      jobId: activeJob.id,
      date,
      dayLabel,
      punchIn,
      punchOut,
      breakMinutes: Number(breakMinutes),
      regularHours: Number(regularHours),
      overtimeHours: Number(overtimeHours),
      holidayHours: 0,
      totalHours: Number(regularHours) + Number(overtimeHours),
      status: 'completed',
      notes,
      location: `${activeJob.city} Office`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-entrance">
      <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-2xl border border-slate-200 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-[20px]">add_circle</span>
            <h3 className="font-display font-bold text-sm text-[#0b1c30]">Add Past Shift Entry</h3>
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
            <label className="block text-slate-500 font-semibold mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#006c4a]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Punch In</label>
              <input
                type="text"
                value={punchIn}
                onChange={(e) => setPunchIn(e.target.value)}
                placeholder="09:00 AM"
                className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30] font-mono focus:ring-1 focus:ring-[#006c4a]"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Punch Out</label>
              <input
                type="text"
                value={punchOut}
                onChange={(e) => setPunchOut(e.target.value)}
                placeholder="05:30 PM"
                className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30] font-mono focus:ring-1 focus:ring-[#006c4a]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Break (m)</label>
              <input
                type="number"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 0)}
                className="w-full h-10 px-2 bg-[#eff4ff] rounded-lg text-[#0b1c30] font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Reg Hours</label>
              <input
                type="number"
                step="0.5"
                value={regularHours}
                onChange={(e) => setRegularHours(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-2 bg-[#eff4ff] rounded-lg text-[#0b1c30] font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">OT Hours</label>
              <input
                type="number"
                step="0.5"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-2 bg-[#eff4ff] rounded-lg text-[#0b1c30] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Shift Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30]"
              placeholder="e.g. Sprint testing override"
            />
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
              className="flex-1 h-10 rounded-lg bg-[#006c4a] hover:bg-[#005137] text-white font-semibold"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
