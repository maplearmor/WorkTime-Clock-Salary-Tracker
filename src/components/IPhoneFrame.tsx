import React, { ReactNode, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface IPhoneFrameProps {
  children: ReactNode;
}

export const IPhoneFrame: React.FC<IPhoneFrameProps> = ({ children }) => {
  const { isIPhoneMode, toggleIPhoneMode, punchState, elapsedSeconds } = useApp();
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const formatElapsedShort = () => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const mins = Math.floor((elapsedSeconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  // If user is accessing directly from a real mobile device / iPhone Safari
  if (isMobileScreen) {
    return (
      <div className="w-full min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col pt-[max(env(safe-area-inset-top,0px),0px)] pb-[max(env(safe-area-inset-bottom,0px),0px)]">
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto relative overflow-x-hidden">
          {children}
        </div>
      </div>
    );
  }

  // If user selected Wide Desktop View on desktop
  if (!isIPhoneMode) {
    return (
      <div className="w-full min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
        <div className="max-w-3xl mx-auto min-h-screen flex flex-col relative">{children}</div>
      </div>
    );
  }

  // Desktop Simulator View: Render iPhone 16 Pro Titanium Chassis
  return (
    <div className="min-h-screen bg-slate-900/90 sm:py-6 sm:px-4 flex items-center justify-center transition-colors relative">
      {/* Floating Desktop Exit iPhone View Toggle */}
      <div className="fixed top-4 right-4 z-50 hidden md:flex items-center gap-1.5 bg-slate-950/80 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-2xl border border-white/20">
        <button
          onClick={toggleIPhoneMode}
          className="flex items-center gap-1.5 text-xs font-semibold hover:text-emerald-400 transition-colors"
          type="button"
          title="Switch to full-width desktop layout"
        >
          <span className="material-symbols-outlined text-[16px]">fit_screen</span>
          <span>Wide Desktop View</span>
        </button>
      </div>

      {/* Outer iPhone Titanium Chassis */}
      <div className="w-full sm:max-w-[430px] min-h-screen sm:min-h-[890px] sm:max-h-[92vh] sm:rounded-[52px] bg-slate-950 sm:p-[10px] shadow-[0_25px_70px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.15)] flex flex-col relative overflow-hidden transition-all">
        {/* Inner Screen Bezel */}
        <div className="w-full flex-1 bg-[#f8f9ff] text-[#0b1c30] sm:rounded-[44px] overflow-hidden flex flex-col relative border border-slate-800/40">
          {/* iOS Status Bar & Dynamic Island */}
          <div className="w-full h-11 pt-2 px-6 flex items-center justify-between text-slate-800 text-[13px] font-semibold select-none z-50 bg-[#f8f9ff]/85 backdrop-blur-md">
            <span>9:41</span>

            {/* Dynamic Island with Active Status */}
            <div className="h-7 px-3 rounded-full bg-black text-white flex items-center justify-center gap-2 shadow-inner transition-all hover:scale-105 cursor-pointer">
              <span
                className={`w-2 h-2 rounded-full ${
                  punchState === 'WORKING'
                    ? 'bg-emerald-400 animate-pulse'
                    : punchState === 'ON_BREAK'
                    ? 'bg-amber-400'
                    : 'bg-slate-500'
                }`}
              />
              <span className="text-[10px] font-mono tracking-tight font-bold">
                {punchState === 'WORKING'
                  ? formatElapsedShort()
                  : punchState === 'ON_BREAK'
                  ? 'ON BREAK'
                  : 'OFF SHIFT'}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
            </div>

            {/* iOS Status Icons */}
            <div className="flex items-center gap-1.5 text-slate-800">
              <span className="material-symbols-outlined text-[15px]">signal_cellular_4_bar</span>
              <span className="material-symbols-outlined text-[15px]">wifi</span>
              <span className="material-symbols-outlined text-[18px]">battery_full</span>
            </div>
          </div>

          {/* Screen Content Container with Custom Scrollbar */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative no-scrollbar">
            {children}
          </div>

          {/* iPhone Bottom Home Indicator Bar */}
          <div className="w-full h-5 pointer-events-none flex items-center justify-center bg-[#f8f9ff] z-50">
            <div className="w-32 h-1 bg-slate-900/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
