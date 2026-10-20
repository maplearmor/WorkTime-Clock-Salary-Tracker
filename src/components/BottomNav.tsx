import React from 'react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView } = useApp();

  const navItems = [
    { key: 'clock', label: 'Clock', icon: 'schedule' },
    { key: 'timesheet', label: 'Timesheet', icon: 'list_alt' },
    { key: 'salary', label: 'Salary', icon: 'payments' },
    { key: 'expenses', label: 'Expenses', icon: 'account_balance_wallet' },
    { key: 'calendar', label: 'Calendar', icon: 'calendar_today' },
    { key: 'settings', label: 'Settings', icon: 'tune' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#f8f9ff]/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-2px_12px_rgba(0,0,0,0.03)] pb-[max(env(safe-area-inset-bottom,0px),8px)] pt-1.5 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = currentView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setCurrentView(item.key)}
              className={`flex flex-col items-center justify-center min-w-[52px] min-h-[46px] py-1 gap-0.5 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-[#006c4a] font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              type="button"
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {item.label}
              </span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a] mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
