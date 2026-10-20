import React from 'react';
import { useApp } from '../../context/AppContext';
import { exportAuditJSON } from '../../services/exportService';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({ isOpen, onClose }) => {
  const { activeJob, auditRecords } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-entrance">
      <div className="bg-white rounded-2xl w-full max-w-md p-4 shadow-2xl border border-slate-200 flex flex-col gap-3 max-h-[85vh]">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">history</span>
            <div>
              <h3 className="font-display font-bold text-sm text-[#0b1c30]">Punch Audit History</h3>
              <p className="text-[10px] text-slate-400">
                {activeJob.companyName} • {auditRecords.length} Events Logged
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
          {auditRecords.length === 0 ? (
            <p className="text-center py-6 text-slate-400">No punch modifications recorded yet.</p>
          ) : (
            auditRecords.map((aud) => (
              <div key={aud.id} className="p-3 bg-[#eff4ff] rounded-xl border border-slate-200/60 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#0b1c30]">{aud.fieldChanged}</span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded text-slate-600 font-mono">
                    {aud.date}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded-lg border border-slate-100 font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Original</span>
                    <span className="text-red-700 font-semibold">{aud.originalValue}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Changed To</span>
                    <span className="text-[#006c4a] font-semibold">{aud.newValue}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold">Reason:</span> {aud.reason}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50">
                  <span>Author: {aud.changedBy}</span>
                  <span>{aud.changedAt}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={() => exportAuditJSON(activeJob, auditRecords)}
            className="h-9 px-3 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-700 text-xs font-semibold flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg bg-[#131b2e] text-white text-xs font-semibold hover:bg-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
