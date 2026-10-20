import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#006c4a] text-white text-xs font-semibold shadow-sm hover:bg-[#005a3e] active:scale-95 transition-all"
        title="Install WorkTime App on Device"
        type="button"
      >
        <span className="material-symbols-outlined text-[15px]">download</span>
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200/80 active:scale-95"
          title="Install on iPhone / iPad"
          type="button"
        >
          <span className="material-symbols-outlined text-[15px] text-[#006c4a]">add_to_home_screen</span>
          <span className="hidden sm:inline">Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 text-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#006c4a]/10 text-[#006c4a] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">phone_iphone</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Install on iPhone</h3>
                    <p className="text-[10px] text-slate-400">Add WorkTime to your Home Screen</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-[#006c4a] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">Tap the Share button</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      In the Safari toolbar at the bottom of your iPhone screen, tap the <strong>Share</strong> icon (square with arrow pointing up).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-[#006c4a] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">Tap "Add to Home Screen"</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Scroll down the share sheet and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong> in the top right.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#82f5c1]/20 border border-emerald-200">
                  <span className="w-6 h-6 rounded-full bg-[#006c4a] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-[#00714e]">Full Standalone Experience</p>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      WorkTime will launch like a native iOS app with full offline data storage and zero browser address bars.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-[#0F172A] py-2.5 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
