import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenAddJob: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications, onOpenAddJob }) => {
  const {
    activeJob,
    jobs,
    switchJob,
    punchState,
    notifications,
    isIPhoneMode,
    toggleIPhoneMode,
    resetToDemoData,
  } = useApp();

  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const jobButtonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const updateDropdownPosition = useCallback(() => {
    if (!jobButtonRef.current) return;
    const btn = jobButtonRef.current;
    const btnRect = btn.getBoundingClientRect();
    const headerEl = btn.closest('header');
    const containerRect = headerEl
      ? headerEl.getBoundingClientRect()
      : { left: 0, right: window.innerWidth, width: window.innerWidth };

    const padding = 10;
    // Cap width so it never exceeds screen or container minus padding
    const maxW = Math.min(300, Math.max(250, containerRect.width - padding * 2));

    // Align right of dropdown with right of the button by default:
    // Dropdown prospective left in viewport: btnRect.right - maxW
    // Dropdown prospective right in viewport: btnRect.right
    let offsetRight = 0;
    const prospectiveLeft = btnRect.right - maxW;
    const prospectiveRight = btnRect.right;

    if (prospectiveLeft < containerRect.left + padding) {
      // It hangs off left screen edge -> shift right towards available space
      const shift = (containerRect.left + padding) - prospectiveLeft;
      offsetRight = -shift;
    } else if (prospectiveRight > containerRect.right - padding) {
      // It hangs off right screen edge -> shift left
      const shift = prospectiveRight - (containerRect.right - padding);
      offsetRight = shift;
    }

    setDropdownStyle({
      position: 'absolute',
      top: '100%',
      marginTop: '6px',
      right: `${offsetRight}px`,
      width: `${maxW}px`,
      maxWidth: `calc(100vw - 20px)`,
      zIndex: 50,
    });
  }, []);

  useEffect(() => {
    if (jobDropdownOpen) {
      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('orientationchange', updateDropdownPosition);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setJobDropdownOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('resize', updateDropdownPosition);
        window.removeEventListener('orientationchange', updateDropdownPosition);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [jobDropdownOpen, updateDropdownPosition]);

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
              ESTIMATED TAX &amp; SALARY
            </span>
          </div>
        </div>

        {/* Right Action Zone */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Active Job Dropdown Pill */}
          <div className="relative">
            <button
              ref={jobButtonRef}
              onClick={() => {
                setJobDropdownOpen(!jobDropdownOpen);
                setProfileMenuOpen(false);
              }}
              className="min-h-[38px] px-2.5 py-1 rounded-full bg-[#eff4ff] hover:bg-[#e5eeff] border border-slate-200/50 flex items-center gap-1.5 transition-all active:scale-95 text-xs text-[#0b1c30] font-medium"
              type="button"
              title="Switch Active Job"
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
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                />
              </span>
              <span className="max-w-[85px] sm:max-w-[120px] truncate font-semibold">
                {activeJob.shortName} ({activeJob.currency})
              </span>
              <span className="material-symbols-outlined text-[16px] text-slate-500">arrow_drop_down</span>
            </button>

            {jobDropdownOpen && (
              <>
                {/* Backdrop to catch clicks outside dropdown */}
                <div
                  className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px]"
                  onClick={() => setJobDropdownOpen(false)}
                />

                <div
                  style={dropdownStyle}
                  className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-1.5 z-50 animate-entrance text-slate-800 overflow-hidden"
                >
                  <div className="px-3.5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Select Active Job</span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      {jobs.length} profiles
                    </span>
                  </div>

                  <div className="max-h-[min(320px,55vh)] overflow-y-auto divide-y divide-slate-100/60 no-scrollbar">
                    {jobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => {
                          switchJob(job.id);
                          setJobDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors min-h-[46px] ${
                          job.id === activeJob.id
                            ? 'bg-[#eff4ff] text-[#006c4a] font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 mr-2">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10"
                            style={{ backgroundColor: job.color }}
                          />
                          <div className="truncate flex-1 min-w-0">
                            <div className="truncate font-medium text-slate-900">{job.companyName}</div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {job.currencySymbol}
                              {job.hourlyRate.toFixed(2)} {job.currency}/hr • {job.province}, {job.country.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        {job.id === activeJob.id && (
                          <span className="material-symbols-outlined text-[18px] text-[#006c4a] flex-shrink-0 font-bold">
                            check
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-2 border-t border-slate-100 bg-slate-50/70">
                    <button
                      onClick={() => {
                        setJobDropdownOpen(false);
                        onOpenAddJob();
                      }}
                      className="w-full min-h-[38px] py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[17px] text-[#006c4a]">add_circle</span>
                      <span>Add New Job Profile</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Notification Bell */}
          <button
            onClick={() => {
              setJobDropdownOpen(false);
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
                setJobDropdownOpen(false);
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
