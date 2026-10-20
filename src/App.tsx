import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { IPhoneFrame } from './components/IPhoneFrame';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ClockView } from './components/views/ClockView';
import { TimesheetView } from './components/views/TimesheetView';
import { SalaryView } from './components/views/SalaryView';
import { ReportsView } from './components/views/ReportsView';
import { ExpensesView } from './components/views/ExpensesView';
import { CalendarView } from './components/views/CalendarView';
import { SettingsView } from './components/views/SettingsView';
import { ManualEntryModal } from './components/modals/ManualEntryModal';
import { EditEntryModal } from './components/modals/EditEntryModal';
import { AuditHistoryModal } from './components/modals/AuditHistoryModal';
import { AddJobModal } from './components/modals/AddJobModal';
import { NotificationDrawer } from './components/modals/NotificationDrawer';
import { AddCustomHolidayModal } from './components/modals/AddCustomHolidayModal';
import { TimeEntry } from './types';

function MainApp() {
  const { currentView, toast, jobTimeEntries } = useApp();

  // Modals state
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [manualEntryDate, setManualEntryDate] = useState<string | undefined>(undefined);
  const [editEntryOpen, setEditEntryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [addHolidayOpen, setAddHolidayOpen] = useState(false);

  const handleOpenAdjustPunch = () => {
    const missed = jobTimeEntries.find((e) => e.status === 'missed_punch');
    if (missed) {
      setEditingEntry(missed);
      setEditEntryOpen(true);
    } else {
      setManualEntryOpen(true);
    }
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setEditEntryOpen(true);
  };

  const handleViewAudit = (entry?: TimeEntry) => {
    setAuditOpen(true);
  };

  const handleOpenManualWithDate = (date: string) => {
    setManualEntryDate(date);
    setManualEntryOpen(true);
  };

  return (
    <IPhoneFrame>
      {/* Interactive Toast Notification */}
      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm pointer-events-none transition-all duration-300">
          <div
            className={`px-3.5 py-2 rounded-xl text-white text-xs font-semibold shadow-xl flex items-center gap-2 border border-white/10 ${
              toast.isError ? 'bg-[#ba1a1a]' : 'bg-[#131b2e]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                toast.isError ? 'text-white' : 'text-[#82f5c1]'
              }`}
            >
              {toast.icon || 'check_circle'}
            </span>
            <span className="truncate flex-1">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenAddJob={() => setAddJobOpen(true)}
      />

      {/* Dynamic Tab Views */}
      <main className="flex-1 w-full relative">
        {currentView === 'clock' && (
          <ClockView
            onOpenManualEntry={() => {
              setManualEntryDate(undefined);
              setManualEntryOpen(true);
            }}
            onOpenAdjustPunch={handleOpenAdjustPunch}
            onOpenAddJob={() => setAddJobOpen(true)}
          />
        )}

        {currentView === 'timesheet' && (
          <TimesheetView
            onOpenManualEntry={() => {
              setManualEntryDate(undefined);
              setManualEntryOpen(true);
            }}
            onEditEntry={handleEditEntry}
            onViewAudit={handleViewAudit}
          />
        )}

        {currentView === 'salary' && <SalaryView />}

        {currentView === 'expenses' && <ExpensesView />}

        {currentView === 'reports' && <ReportsView />}

        {currentView === 'calendar' && (
          <CalendarView
            onAddCustomHoliday={() => setAddHolidayOpen(true)}
            onOpenManualEntryWithDate={handleOpenManualWithDate}
          />
        )}

        {currentView === 'settings' && <SettingsView />}
      </main>

      {/* Bottom 6-Tab Navigation Bar (Clock, Timesheet, Salary, Expenses, Calendar, Settings) */}
      <BottomNav />

      {/* Modals & Drawers */}
      <ManualEntryModal
        isOpen={manualEntryOpen}
        initialDate={manualEntryDate}
        onClose={() => setManualEntryOpen(false)}
      />

      <EditEntryModal
        isOpen={editEntryOpen}
        entry={editingEntry}
        onClose={() => {
          setEditEntryOpen(false);
          setEditingEntry(null);
        }}
      />

      <AuditHistoryModal
        isOpen={auditOpen}
        onClose={() => setAuditOpen(false)}
      />

      <AddJobModal
        isOpen={addJobOpen}
        onClose={() => setAddJobOpen(false)}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onOpenAdjustPunch={handleOpenAdjustPunch}
      />

      <AddCustomHolidayModal
        isOpen={addHolidayOpen}
        onClose={() => setAddHolidayOpen(false)}
      />
    </IPhoneFrame>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
