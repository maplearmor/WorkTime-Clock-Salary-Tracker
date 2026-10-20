import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TimeEntry } from '../../types';

interface EditEntryModalProps {
  entry: TimeEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({ entry, isOpen, onClose }) => {
  const { updateTimeEntry, deleteTimeEntry } = useApp();

  const [punchIn, setPunchIn] = useState('');
  const [punchOut, setPunchOut] = useState('');
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [regularHours, setRegularHours] = useState(8.0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('Manual punch correction');

  useEffect(() => {
    if (entry) {
      setPunchIn(entry.punchIn);
      setPunchOut(entry.punchOut);
      setBreakMinutes(entry.breakMinutes);
      setRegularHours(entry.regularHours);
      setOvertimeHours(entry.overtimeHours);
      setNotes(entry.notes || '');
      setReason(entry.status === 'missed_punch' ? 'Forgot to punch out' : 'Shift timing adjustment');
    }
  }, [entry]);

  if (!isOpen || !entry) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTimeEntry(
      {
        ...entry,
        punchIn,
        punchOut,
        breakMinutes: Number(breakMinutes),
        regularHours: Number(regularHours),
        overtimeHours: Number(overtimeHours),
        totalHours: Number(regularHours) + Number(overtimeHours),
        status: punchOut.includes('MISSING') ? 'missed_punch' : 'completed',
        notes,
      },
      reason
    );
    onClose();
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteTimeEntry(entry.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-entrance">
      <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-2xl border border-slate-200 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-[20px]">edit_note</span>
            <div>
              <h3 className="font-display font-bold text-sm text-[#0b1c30]">Edit Time Record</h3>
              <p className="text-[10px] text-slate-400">{entry.dayLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Punch In</label>
              <input
                type="text"
                value={punchIn}
                onChange={(e) => setPunchIn(e.target.value)}
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
            <label className="block text-slate-500 font-semibold mb-1">Audit Correction Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for change (recorded in audit log)"
              className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#006c4a]"
              required
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Shift Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30]"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="h-10 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm animate-pulse"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Confirm Delete?</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="h-10 px-2 rounded-lg text-slate-500 hover:bg-slate-100 text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDelete}
                className="h-10 px-3 rounded-lg text-red-600 hover:bg-red-50 font-semibold text-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Delete</span>
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-4 rounded-lg bg-[#006c4a] hover:bg-[#005137] text-white font-semibold shadow-sm"
              >
                Save &amp; Audit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
