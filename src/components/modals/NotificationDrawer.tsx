import React from 'react';
import { useApp } from '../../context/AppContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdjustPunch: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAdjustPunch,
}) => {
  const { notifications, dismissNotification, markAllNotificationsRead } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-950/60 backdrop-blur-sm animate-entrance">
      <div className="bg-white w-full sm:max-w-sm h-full p-4 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-[20px]">notifications_active</span>
            <div>
              <h3 className="font-display font-bold text-sm text-[#0b1c30]">Notifications &amp; Alerts</h3>
              <p className="text-[10px] text-slate-400">Time Guard System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-slate-500">{notifications.length} Alerts</span>
          {notifications.length > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-[#006c4a] hover:underline font-semibold text-[11px]"
              type="button"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-3xl mb-1 text-slate-300">notifications_none</span>
              <p>No active notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all ${
                  !n.read ? 'bg-[#eff4ff] border-blue-200/80' : 'bg-slate-50 border-slate-200/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`material-symbols-outlined text-[17px] ${
                        n.type === 'missed_punch'
                          ? 'text-[#ba1a1a]'
                          : n.type === 'overtime_warning'
                          ? 'text-amber-600'
                          : 'text-[#006c4a]'
                      }`}
                    >
                      {n.type === 'missed_punch'
                        ? 'warning'
                        : n.type === 'overtime_warning'
                        ? 'trending_up'
                        : 'info'}
                    </span>
                    <span className="font-semibold text-[#0b1c30]">{n.title}</span>
                  </div>
                  <button
                    onClick={() => dismissNotification(n.id)}
                    className="text-slate-400 hover:text-slate-700 p-0.5"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 leading-snug">{n.description}</p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[10px]">
                  <span className="text-slate-400">{n.timestamp}</span>
                  {n.actionable && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAdjustPunch();
                      }}
                      className="px-2 py-0.8 rounded bg-[#131b2e] text-white font-semibold hover:bg-black active:scale-95 transition-all"
                    >
                      {n.actionLabel || 'Resolve'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
          >
            Close Alerts
          </button>
        </div>
      </div>
    </div>
  );
};
