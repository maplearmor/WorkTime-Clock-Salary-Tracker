import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenAddJob?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const {
    notifications,
    isIPhoneMode,
    toggleIPhoneMode,
    resetToDemoData,
    t,
  } = useApp();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 w-full z-40 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-slate-200/60 transition-all">
      <div className="h-14 px-3 sm:px-4 flex items-center justify-between gap-2 max-w-5xl mx-auto">
        {/* Brand / Logo Zone */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#0F172A] text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" className="w-6 h-6" fill="none">
              <rect width="96" height="96" rx="24" fill="#0F172A" />
              <circle cx="48" cy="48" r="32" stroke="#38BDF8" strokeWidth="6" strokeDasharray="140 60" strokeLinecap="round" />
              <path d="M48 28V48L60 60" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="68" cy="28" r="8" fill="#10B981" />
              <path d="M68 24V32M65 27H71" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-base text-[#0b1c30] tracking-tight">WorkTime</span>
              <span className="hidden sm:inline-block text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
                Pro
              </span>
            </div>
            <span className="text-[10px] text-[#006c4a] tracking-wider font-semibold uppercase truncate">
              {t('headerSubtitle')}
            </span>
          </div>
        </div>

        {/* Right Action Zone */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Notification Bell */}
          <button
            onClick={() => {
              setProfileMenuOpen(false);
              onOpenNotifications();
            }}
            className="relative w-8 h-8 rounded-full bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-700 flex items-center justify-center transition-transform active:scale-95"
            title="Notifications & Alerts"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#ba1a1a] text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* iPhone Frame Toggle (Desktop helper - shown in wide view) */}
          {!isIPhoneMode && (
            <button
              onClick={toggleIPhoneMode}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-white hover:bg-slate-900 text-xs font-medium transition-all active:scale-95"
              title="Switch to iPhone 16 Pro View"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">smartphone</span>
              <span className="text-[11px] font-semibold">iPhone View</span>
            </button>
          )}

          {/* User Profile Avatar with dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileMenuOpen(!profileMenuOpen);
              }}
              className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 shadow-sm"
              title="User Account & Settings"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>

            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px]"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-entrance text-xs overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="font-bold text-slate-800">Current User</div>
                    <div className="text-[11px] text-slate-400">Employee • Verified Account</div>
                  </div>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onOpenNotifications();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-[#eff4ff] flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-500">notifications</span>
                    <span>Alerts ({unreadCount})</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      resetToDemoData();
                    }}
                    className="w-full text-left px-3 py-2 text-amber-700 hover:bg-amber-50 flex items-center gap-2 border-t border-slate-100"
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber-600">restart_alt</span>
                    <span>Reset Demo Data</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
