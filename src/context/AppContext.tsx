import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  Job,
  TimeEntry,
  PunchState,
  PunchTimelineEvent,
  AuditRecord,
  HolidayItem,
  NotificationItem,
  SalaryBreakdown,
  AppView,
  Expense,
  ExpenseCategory,
  RecurringBill,
  BudgetSettings,
} from '../types';
import { calculateSalary } from '../services/taxEngine';
import { INITIAL_HOLIDAYS } from '../services/holidays';
import {
  INITIAL_EXPENSES,
  INITIAL_RECURRING_BILLS,
  INITIAL_BUDGET,
  EXPENSE_CATEGORIES,
} from '../services/expenseService';

const STORAGE_KEY = 'worktime_clock_app_v2';

const DEFAULT_JOBS: Job[] = [
  {
    id: 'job_acme_tech',
    companyName: 'Acme Tech Solutions Inc.',
    companyEntity: 'Acme Tech Solutions Inc.',
    shortName: 'Acme Tech',
    position: 'Senior Software Developer',
    country: 'ca',
    countryName: 'Canada',
    province: 'QC',
    provinceName: 'Quebec',
    city: 'Montreal',
    currency: 'CAD',
    currencySymbol: '$',
    hourlyRate: 48.50,
    wageType: 'hourly',
    annualSalary: 105000,
    payFrequency: 'biweekly',
    periodsPerYear: 26,
    standardDailyHours: 8.0,
    standardWeeklyHours: 40.0,
    overtimeMultiplier: 1.5,
    holidayMultiplier: 2.0,
    autoDeductUnpaidBreak: true,
    taxYear: '2026',
    color: '#006c4a',
    accentBg: '#82f5c1',
  },
  {
    id: 'job_creative_studio',
    companyName: 'Creative Studio Labs NYC',
    companyEntity: 'Creative Studio LLC',
    shortName: 'Creative Studio',
    position: 'UI/UX Design Consultant',
    country: 'us',
    countryName: 'United States',
    province: 'NY',
    provinceName: 'New York',
    city: 'New York',
    currency: 'USD',
    currencySymbol: '$',
    hourlyRate: 38.00,
    wageType: 'hourly',
    annualSalary: 82000,
    payFrequency: 'biweekly',
    periodsPerYear: 26,
    standardDailyHours: 8.0,
    standardWeeklyHours: 40.0,
    overtimeMultiplier: 1.5,
    holidayMultiplier: 2.0,
    autoDeductUnpaidBreak: true,
    taxYear: '2026',
    color: '#2563eb',
    accentBg: '#dbeafe',
  },
  {
    id: 'job_xian_hardware',
    companyName: 'Shaanxi Industrial Engineering Co.',
    companyEntity: 'Shaanxi Precision Tech Ltd.',
    shortName: 'Shaanxi Tech',
    position: 'Firmware Specialist',
    country: 'cn',
    countryName: 'China',
    province: 'SN',
    provinceName: 'Shaanxi',
    city: "Xi'an",
    currency: 'CNY',
    currencySymbol: '¥',
    hourlyRate: 180.00,
    wageType: 'hourly',
    annualSalary: 380000,
    payFrequency: 'monthly',
    periodsPerYear: 12,
    standardDailyHours: 8.0,
    standardWeeklyHours: 40.0,
    overtimeMultiplier: 1.5,
    holidayMultiplier: 3.0,
    autoDeductUnpaidBreak: false,
    taxYear: '2026',
    color: '#d97706',
    accentBg: '#fef3c7',
  },
];

const INITIAL_TIMELINE: PunchTimelineEvent[] = [
  {
    id: 'tl_1',
    title: 'Clocked In',
    detail: 'Acme Office (Toronto Hub) • GPS Verified',
    timeStr: '08:45 AM',
    timestamp: Date.now() - 3.7 * 3600 * 1000,
    type: 'in',
    icon: 'login',
    iconBg: 'bg-secondary-container',
    iconColor: 'text-on-secondary-container',
  },
  {
    id: 'tl_2',
    title: 'Lunch Break Started',
    detail: 'Paid rest period',
    timeStr: '12:00 PM',
    timestamp: Date.now() - 1.5 * 3600 * 1000,
    type: 'break_start',
    icon: 'free_breakfast',
    iconBg: 'bg-surface-container',
    iconColor: 'text-on-surface-variant',
  },
  {
    id: 'tl_3',
    title: 'Lunch Break Ended',
    detail: '30m duration elapsed',
    timeStr: '12:30 PM',
    timestamp: Date.now() - 1.0 * 3600 * 1000,
    type: 'break_end',
    icon: 'play_arrow',
    iconBg: 'bg-surface-container',
    iconColor: 'text-on-surface-variant',
  },
];

const INITIAL_ENTRIES: TimeEntry[] = [
  {
    id: 'entry_today',
    jobId: 'job_acme_tech',
    date: '2026-10-24',
    dayLabel: 'Thursday, Oct 24',
    punchIn: '08:45 AM',
    breakMinutes: 30,
    punchOut: 'In Progress',
    regularHours: 3.7,
    overtimeHours: 0,
    holidayHours: 0,
    totalHours: 3.7,
    grossPay: 179.45,
    netPay: 136.38,
    status: 'in_progress',
    notes: 'Feature sprint and tax rules implementation',
    location: 'Montreal Office',
  },
  {
    id: 'entry_yesterday_missed',
    jobId: 'job_acme_tech',
    date: '2026-10-23',
    dayLabel: 'Wednesday, Oct 23',
    punchIn: '08:52 AM',
    breakMinutes: 45,
    punchOut: '--:-- MISSING',
    regularHours: 8.0,
    overtimeHours: 0,
    holidayHours: 0,
    totalHours: 8.0,
    grossPay: 388.00,
    netPay: 294.10,
    status: 'missed_punch',
    notes: 'Scheduled shift finished at 5:00 PM without checkout stamp',
    location: 'Toronto Hub',
  },
  {
    id: 'entry_thursday_ot',
    jobId: 'job_acme_tech',
    date: '2026-10-22',
    dayLabel: 'Tuesday, Oct 22',
    punchIn: '08:30 AM',
    breakMinutes: 30,
    punchOut: '05:30 PM',
    regularHours: 8.0,
    overtimeHours: 0.5,
    holidayHours: 0,
    totalHours: 8.5,
    grossPay: 424.38,
    netPay: 321.50,
    status: 'completed',
    notes: 'Sprint deployment release prep & QA staging',
    location: 'Montreal Office',
  },
  {
    id: 'entry_tuesday',
    jobId: 'job_acme_tech',
    date: '2026-10-21',
    dayLabel: 'Monday, Oct 21',
    punchIn: '08:45 AM',
    breakMinutes: 45,
    punchOut: '05:30 PM',
    regularHours: 8.0,
    overtimeHours: 0,
    holidayHours: 0,
    totalHours: 8.0,
    grossPay: 388.00,
    netPay: 294.10,
    status: 'approved',
    notes: 'Core architecture review',
    location: 'Remote Work',
  },
  {
    id: 'entry_monday',
    jobId: 'job_acme_tech',
    date: '2026-10-20',
    dayLabel: 'Friday, Oct 17',
    punchIn: '09:00 AM',
    breakMinutes: 30,
    punchOut: '05:30 PM',
    regularHours: 8.0,
    overtimeHours: 0,
    holidayHours: 0,
    totalHours: 8.0,
    grossPay: 388.00,
    netPay: 294.10,
    status: 'approved',
    notes: 'Client alignment meeting',
    location: 'Montreal Office',
  },
  {
    id: 'entry_prev_ot',
    jobId: 'job_acme_tech',
    date: '2026-10-16',
    dayLabel: 'Thursday, Oct 16',
    punchIn: '08:00 AM',
    breakMinutes: 30,
    punchOut: '06:30 PM',
    regularHours: 8.0,
    overtimeHours: 2.0,
    holidayHours: 0,
    totalHours: 10.0,
    grossPay: 533.50,
    netPay: 404.39,
    status: 'approved',
    notes: 'Overtime push for Q3 deliverables',
    location: 'Montreal Office',
  },
];

const INITIAL_AUDITS: AuditRecord[] = [
  {
    id: 'aud_1',
    entryId: 'entry_thursday_ot',
    date: '2026-10-22',
    fieldChanged: 'Punch Out',
    originalValue: '05:00 PM',
    newValue: '05:30 PM',
    reason: 'Approved overtime 30 mins for sprint release QA',
    changedAt: 'Oct 22, 2026 06:15 PM',
    changedBy: 'Nabil (Employee)',
  },
  {
    id: 'aud_2',
    entryId: 'entry_tuesday',
    date: '2026-10-21',
    fieldChanged: 'Break Duration',
    originalValue: '30 mins',
    newValue: '45 mins',
    reason: 'Adjusted meal break to match actual duration',
    changedAt: 'Oct 21, 2026 05:40 PM',
    changedBy: 'Nabil (Employee)',
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: "Review Yesterday's Punch",
    description: 'Scheduled shift finished at 5:00 PM yesterday without a checkout stamp.',
    type: 'missed_punch',
    timestamp: '1 hour ago',
    read: false,
    actionable: true,
    actionLabel: 'Adjust Punch',
  },
  {
    id: 'notif_2',
    title: 'Approaching Overtime Threshold',
    description: 'Weekly clocked hours reached 34.2 hrs (85% of standard 40.0h limit).',
    type: 'overtime_warning',
    timestamp: '4 hours ago',
    read: false,
  },
  {
    id: 'notif_3',
    title: 'Pay Period Close & Review',
    description: 'Biweekly cycle #21 closes in 7 days (Oct 31). Review pending punch items.',
    type: 'payroll_close',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'notif_4',
    title: 'Public Holiday Notice',
    description: 'Upcoming Quebec statutory holiday scheduled next month with 2.0x multiplier.',
    type: 'holiday',
    timestamp: '3 days ago',
    read: true,
  },
];

interface AppContextType {
  jobs: Job[];
  activeJob: Job;
  activeJobId: string;
  switchJob: (jobId: string) => void;
  addJob: (newJob: Job) => void;
  updateJob: (updatedJob: Job) => void;

  punchState: PunchState;
  setPunchState: (state: PunchState) => void;
  elapsedSeconds: number;
  breakElapsedSeconds: number;
  todayTimeline: PunchTimelineEvent[];
  punchIn: () => void;
  startBreak: () => void;
  endBreak: () => void;
  punchOut: () => void;
  simulateState: (state: PunchState) => void;

  timeEntries: TimeEntry[];
  jobTimeEntries: TimeEntry[];
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'grossPay' | 'netPay'>) => void;
  updateTimeEntry: (entry: TimeEntry, reason: string) => void;
  deleteTimeEntry: (id: string) => void;
  resolveMissedPunch: (entryId: string, correctedTime: string, reason: string) => void;

  auditRecords: AuditRecord[];
  customHolidays: HolidayItem[];
  addCustomHoliday: (holiday: HolidayItem) => void;
  deleteCustomHoliday: (id: string) => void;

  notifications: NotificationItem[];
  dismissNotification: (id: string) => void;
  markAllNotificationsRead: () => void;

  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  isIPhoneMode: boolean;
  toggleIPhoneMode: () => void;

  toast: { message: string; icon?: string; isError?: boolean } | null;
  showToast: (message: string, icon?: string, isError?: boolean) => void;

  currentSalaryBreakdown: SalaryBreakdown;
  todayEarnings: { hours: number; gross: number; net: number; tax: number };
  weeklyStats: { hours: number; overtime: number; gross: number; net: number };

  // My Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  importExpenses: (newExpenses: Omit<Expense, 'id' | 'createdAt'>[]) => void;

  recurringBills: RecurringBill[];
  addRecurringBill: (bill: Omit<RecurringBill, 'id'>) => void;
  updateRecurringBill: (bill: RecurringBill) => void;
  deleteRecurringBill: (id: string) => void;
  toggleBillPaid: (id: string) => void;

  budgetSettings: BudgetSettings;
  updateBudgetSettings: (settings: Partial<BudgetSettings>) => void;

  expenseStats: {
    monthlyTotal: number;
    groceryTotal: number;
    groceryWeeklyAvg: number;
    weeklyGroceryTotal: number;
    billsTotal: number;
    otherTotal: number;
    remainingBudget: number;
    budgetPercentage: number;
    categoryBreakdown: {
      category: ExpenseCategory;
      amount: number;
      percentage: number;
      color: string;
      bgColor: string;
      icon: string;
    }[];
    upcomingBills: RecurringBill[];
  };

  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Load state from localStorage or use defaults
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_jobs`);
      return saved ? JSON.parse(saved) : DEFAULT_JOBS;
    } catch {
      return DEFAULT_JOBS;
    }
  });

  const [activeJobId, setActiveJobId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activeJobId`);
      return saved || DEFAULT_JOBS[0].id;
    } catch {
      return DEFAULT_JOBS[0].id;
    }
  });

  const [punchState, setPunchState] = useState<PunchState>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_punchState`);
      return (saved as PunchState) || 'WORKING';
    } catch {
      return 'WORKING';
    }
  });

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(3 * 3600 + 42 * 60 + 14); // 3h 42m 14s
  const [breakElapsedSeconds, setBreakElapsedSeconds] = useState<number>(0);

  const [todayTimeline, setTodayTimeline] = useState<PunchTimelineEvent[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_timeline`);
      return saved ? JSON.parse(saved) : INITIAL_TIMELINE;
    } catch {
      return INITIAL_TIMELINE;
    }
  });

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_entries`);
      return saved ? JSON.parse(saved) : INITIAL_ENTRIES;
    } catch {
      return INITIAL_ENTRIES;
    }
  });

  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_audits`);
      return saved ? JSON.parse(saved) : INITIAL_AUDITS;
    } catch {
      return INITIAL_AUDITS;
    }
  });

  const [customHolidays, setCustomHolidays] = useState<HolidayItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_holidays`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Expenses State
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_recurring_bills`);
      return saved ? JSON.parse(saved) : INITIAL_RECURRING_BILLS;
    } catch {
      return INITIAL_RECURRING_BILLS;
    }
  });

  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_budget_settings`);
      return saved ? JSON.parse(saved) : INITIAL_BUDGET;
    } catch {
      return INITIAL_BUDGET;
    }
  });

  const [currentView, setCurrentView] = useState<AppView>('clock');
  const [isIPhoneMode, setIsIPhoneMode] = useState<boolean>(true); // iPhone mobile shell by default
  const [toast, setToast] = useState<{ message: string; icon?: string; isError?: boolean } | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_jobs`, JSON.stringify(jobs));
      localStorage.setItem(`${STORAGE_KEY}_activeJobId`, activeJobId);
      localStorage.setItem(`${STORAGE_KEY}_punchState`, punchState);
      localStorage.setItem(`${STORAGE_KEY}_timeline`, JSON.stringify(todayTimeline));
      localStorage.setItem(`${STORAGE_KEY}_entries`, JSON.stringify(timeEntries));
      localStorage.setItem(`${STORAGE_KEY}_audits`, JSON.stringify(auditRecords));
      localStorage.setItem(`${STORAGE_KEY}_holidays`, JSON.stringify(customHolidays));
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
      localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
      localStorage.setItem(`${STORAGE_KEY}_recurring_bills`, JSON.stringify(recurringBills));
      localStorage.setItem(`${STORAGE_KEY}_budget_settings`, JSON.stringify(budgetSettings));
    } catch (e) {
      console.warn('Failed to persist to localStorage', e);
    }
  }, [jobs, activeJobId, punchState, todayTimeline, timeEntries, auditRecords, customHolidays, notifications, expenses, recurringBills, budgetSettings]);

  // Active Job lookup
  const activeJob = useMemo(() => {
    return jobs.find((j) => j.id === activeJobId) || jobs[0];
  }, [jobs, activeJobId]);

  // Active Job Time Entries
  const jobTimeEntries = useMemo(() => {
    return timeEntries.filter((e) => e.jobId === activeJobId);
  }, [timeEntries, activeJobId]);

  // Live Timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      if (punchState === 'WORKING') {
        setElapsedSeconds((prev) => prev + 1);
      } else if (punchState === 'ON_BREAK') {
        setBreakElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [punchState]);

  // Toast Helper
  const showToast = (message: string, icon = 'check_circle', isError = false) => {
    setToast({ message, icon, isError });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const toggleIPhoneMode = () => {
    setIsIPhoneMode((prev) => !prev);
  };

  const getCurrentTimeString = () => {
    const now = new Date();
    const rawHours = now.getHours();
    const hours = String(rawHours % 12 || 12).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = rawHours >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${ampm}`;
  };

  // State Transitions
  const punchIn = () => {
    if (punchState === 'CLOCKED_OUT') {
      setElapsedSeconds(0);
      setBreakElapsedSeconds(0);
    }
    setPunchState('WORKING');
    const timeStr = getCurrentTimeString();
    const newEvent: PunchTimelineEvent = {
      id: `tl_${Date.now()}`,
      title: 'Clocked In',
      detail: `${activeJob.companyName} • Shift Active`,
      timeStr,
      timestamp: Date.now(),
      type: 'in',
      icon: 'login',
      iconBg: 'bg-secondary-container',
      iconColor: 'text-on-secondary-container',
    };
    setTodayTimeline((prev) => [...prev, newEvent]);
    showToast(`Clocked in at ${timeStr}`, 'login');
  };

  const startBreak = () => {
    setPunchState('ON_BREAK');
    setBreakElapsedSeconds(0);
    const timeStr = getCurrentTimeString();
    const newEvent: PunchTimelineEvent = {
      id: `tl_${Date.now()}`,
      title: 'Break Started',
      detail: 'Standard meal/rest pause',
      timeStr,
      timestamp: Date.now(),
      type: 'break_start',
      icon: 'free_breakfast',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-800',
    };
    setTodayTimeline((prev) => [...prev, newEvent]);
    showToast(`Break started at ${timeStr}`, 'free_breakfast');
  };

  const endBreak = () => {
    setPunchState('WORKING');
    const timeStr = getCurrentTimeString();
    const newEvent: PunchTimelineEvent = {
      id: `tl_${Date.now()}`,
      title: 'Break Ended',
      detail: 'Resumed active shift',
      timeStr,
      timestamp: Date.now(),
      type: 'break_end',
      icon: 'play_arrow',
      iconBg: 'bg-surface-container',
      iconColor: 'text-on-surface-variant',
    };
    setTodayTimeline((prev) => [...prev, newEvent]);
    showToast(`Break ended at ${timeStr} — shift resumed`, 'play_arrow');
  };

  const punchOut = () => {
    setPunchState('CLOCKED_OUT');
    const timeStr = getCurrentTimeString();
    const newEvent: PunchTimelineEvent = {
      id: `tl_${Date.now()}`,
      title: 'Clocked Out',
      detail: 'Shift ended • Daily summary synchronized',
      timeStr,
      timestamp: Date.now(),
      type: 'out',
      icon: 'logout',
      iconBg: 'bg-error-container',
      iconColor: 'text-on-error-container',
    };
    setTodayTimeline((prev) => [...prev, newEvent]);

    // Update today's entry in time entries
    const todayHours = Number((elapsedSeconds / 3600).toFixed(2));
    const breakdown = calculateSalary(activeJob, todayHours, 0, 0);

    const now = new Date();
    const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const dayLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    setTimeEntries((prev) => {
      const existingIdx = prev.findIndex(
        (e) => (e.date === todayISO || e.id === 'entry_today') && e.jobId === activeJobId
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          punchOut: timeStr,
          regularHours: todayHours,
          totalHours: todayHours,
          grossPay: breakdown.grossPay,
          netPay: breakdown.netPay,
          status: 'completed',
        };
        return updated;
      } else {
        const newEntry: TimeEntry = {
          id: `entry_${Date.now()}`,
          jobId: activeJobId,
          date: todayISO,
          dayLabel,
          punchIn: '08:45 AM',
          breakMinutes: 30,
          punchOut: timeStr,
          regularHours: todayHours,
          overtimeHours: 0,
          holidayHours: 0,
          totalHours: todayHours,
          grossPay: breakdown.grossPay,
          netPay: breakdown.netPay,
          status: 'completed',
        };
        return [newEntry, ...prev];
      }
    });

    showToast(`Clocked out at ${timeStr}. Daily summary saved!`, 'logout');
  };

  const simulateState = (state: PunchState) => {
    setPunchState(state);
    if (state === 'WORKING') {
      showToast('Simulated state: WORKING', 'login');
    } else if (state === 'ON_BREAK') {
      setBreakElapsedSeconds(0);
      showToast('Simulated state: ON BREAK', 'free_breakfast');
    } else if (state === 'CLOCKED_OUT') {
      showToast('Simulated state: CLOCKED OUT', 'logout');
    } else if (state === 'MISSED_PUNCH') {
      showToast('Simulated state: MISSED PUNCH ALERT', 'warning', true);
    }
  };

  // Resolve missed punch
  const resolveMissedPunch = (entryId: string, correctedTime: string, reason: string) => {
    const entry = timeEntries.find((e) => e.id === entryId);
    if (!entry) return;

    const originalPunch = entry.punchOut;
    const breakdown = calculateSalary(activeJob, entry.regularHours, entry.overtimeHours, entry.holidayHours);

    // Update entry
    setTimeEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? {
              ...e,
              punchOut: correctedTime,
              status: 'completed',
              notes: `${e.notes || ''} [Corrected: ${reason}]`,
              grossPay: breakdown.grossPay,
              netPay: breakdown.netPay,
            }
          : e
      )
    );

    // Add Audit Record
    const audit: AuditRecord = {
      id: `aud_${Date.now()}`,
      entryId,
      date: entry.date,
      fieldChanged: 'Punch Out',
      originalValue: originalPunch,
      newValue: correctedTime,
      reason,
      changedAt: `${new Date().toLocaleDateString()} ${getCurrentTimeString()}`,
      changedBy: 'Current User',
    };
    setAuditRecords((prev) => [audit, ...prev]);

    // Dismiss notice
    setNotifications((prev) => prev.filter((n) => n.id !== 'notif_1'));
    showToast(`Punch corrected to ${correctedTime}. Audit logged.`, 'verified');
  };

  // Add time entry
  const addTimeEntry = (entryData: Omit<TimeEntry, 'id' | 'grossPay' | 'netPay'>) => {
    const breakdown = calculateSalary(activeJob, entryData.regularHours, entryData.overtimeHours, entryData.holidayHours);
    const newEntry: TimeEntry = {
      ...entryData,
      id: `entry_${Date.now()}`,
      grossPay: breakdown.grossPay,
      netPay: breakdown.netPay,
    };
    setTimeEntries((prev) => [newEntry, ...prev]);

    // Audit log
    const audit: AuditRecord = {
      id: `aud_${Date.now()}`,
      entryId: newEntry.id,
      date: newEntry.date,
      fieldChanged: 'Manual Entry Created',
      originalValue: 'None',
      newValue: `${newEntry.totalHours} hrs (${newEntry.punchIn} - ${newEntry.punchOut})`,
      reason: 'Manual past shift addition',
      changedAt: `${new Date().toLocaleDateString()} ${getCurrentTimeString()}`,
      changedBy: 'Current User',
    };
    setAuditRecords((prev) => [audit, ...prev]);
    showToast('Manual time entry added successfully', 'add_circle');
  };

  // Edit time entry
  const updateTimeEntry = (updatedEntry: TimeEntry, reason: string) => {
    const existing = timeEntries.find((e) => e.id === updatedEntry.id);
    const breakdown = calculateSalary(activeJob, updatedEntry.regularHours, updatedEntry.overtimeHours, updatedEntry.holidayHours);

    const finalizedEntry: TimeEntry = {
      ...updatedEntry,
      grossPay: breakdown.grossPay,
      netPay: breakdown.netPay,
    };

    setTimeEntries((prev) => prev.map((e) => (e.id === updatedEntry.id ? finalizedEntry : e)));

    if (existing) {
      const audit: AuditRecord = {
        id: `aud_${Date.now()}`,
        entryId: updatedEntry.id,
        date: updatedEntry.date,
        fieldChanged: 'Hours / Punch modified',
        originalValue: `${existing.totalHours} hrs (${existing.punchIn} - ${existing.punchOut})`,
        newValue: `${finalizedEntry.totalHours} hrs (${finalizedEntry.punchIn} - ${finalizedEntry.punchOut})`,
        reason: reason || 'Shift adjustment',
        changedAt: `${new Date().toLocaleDateString()} ${getCurrentTimeString()}`,
        changedBy: 'Current User',
      };
      setAuditRecords((prev) => [audit, ...prev]);
    }

    showToast('Entry updated & audit recorded', 'verified');
  };

  const deleteTimeEntry = (id: string) => {
    setTimeEntries((prev) => prev.filter((e) => e.id !== id));
    showToast('Time entry deleted', 'delete');
  };

  // Job operations
  const switchJob = (jobId: string) => {
    setActiveJobId(jobId);
    const target = jobs.find((j) => j.id === jobId);
    if (target) {
      showToast(`Switched active job to ${target.shortName}`, 'business');
    }
  };

  const addJob = (newJob: Job) => {
    setJobs((prev) => [...prev, newJob]);
    setActiveJobId(newJob.id);
    showToast(`Added job "${newJob.shortName}"`, 'badge');
  };

  const updateJob = (updatedJob: Job) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    showToast(`Updated settings for ${updatedJob.shortName}`, 'check');
  };

  // Holiday operations
  const addCustomHoliday = (holiday: HolidayItem) => {
    setCustomHolidays((prev) => [...prev, holiday]);
    showToast(`Added custom holiday "${holiday.name}"`, 'celebration');
  };

  const deleteCustomHoliday = (id: string) => {
    setCustomHolidays((prev) => prev.filter((h) => h.id !== id));
    showToast('Holiday removed', 'delete');
  };

  // Notifications
  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification dismissed');
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read');
  };

  // Expenses Management
  const addExpense = (newExpenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    showToast(`Added expense: ${newExpense.name} (${activeJob.currencySymbol}${newExpense.amount.toFixed(2)})`, 'add_circle');
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e)));
    showToast(`Updated expense: ${updatedExpense.name}`, 'check_circle');
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Expense removed', 'delete');
  };

  const importExpenses = (newExpensesData: Omit<Expense, 'id' | 'createdAt'>[]) => {
    const formatted: Expense[] = newExpensesData.map((d, i) => ({
      ...d,
      id: `exp_import_${Date.now()}_${i}`,
      createdAt: Date.now() - i * 1000,
    }));
    setExpenses((prev) => [...formatted, ...prev]);
    showToast(`Successfully imported ${formatted.length} transactions`, 'cloud_download');
  };

  // Recurring Bills
  const addRecurringBill = (newBillData: Omit<RecurringBill, 'id'>) => {
    const newBill: RecurringBill = {
      ...newBillData,
      id: `bill_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setRecurringBills((prev) => [...prev, newBill]);
    showToast(`Scheduled recurring bill: ${newBill.name}`, 'event_repeat');
  };

  const updateRecurringBill = (updatedBill: RecurringBill) => {
    setRecurringBills((prev) => prev.map((b) => (b.id === updatedBill.id ? updatedBill : b)));
    showToast(`Updated bill: ${updatedBill.name}`, 'check_circle');
  };

  const deleteRecurringBill = (id: string) => {
    setRecurringBills((prev) => prev.filter((b) => b.id !== id));
    showToast('Recurring bill removed', 'delete');
  };

  const toggleBillPaid = (id: string) => {
    setRecurringBills((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const willBePaid = !b.isPaid;
          return {
            ...b,
            isPaid: willBePaid,
            lastPaidDate: willBePaid ? new Date().toISOString().slice(0, 10) : b.lastPaidDate,
          };
        }
        return b;
      })
    );
    showToast('Bill status updated', 'published_with_changes');
  };

  const updateBudgetSettings = (settings: Partial<BudgetSettings>) => {
    setBudgetSettings((prev) => ({ ...prev, ...settings }));
    showToast('Budget preferences saved', 'savings');
  };

  // Expense Statistics Computations
  const expenseStats = useMemo(() => {
    const currentMonthPrefix = new Date().toISOString().slice(0, 7); // e.g. "2026-10"
    const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthPrefix));

    const monthlyTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Groceries
    const groceryExpenses = monthExpenses.filter((e) => e.category === 'Groceries');
    const groceryTotal = groceryExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Recent 7 days groceries
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysIso = sevenDaysAgo.toISOString().slice(0, 10);
    const weeklyGroceryTotal = groceryExpenses
      .filter((e) => e.date >= sevenDaysIso)
      .reduce((sum, e) => sum + e.amount, 0);

    const dayOfMonth = new Date().getDate();
    const currentWeeks = Math.max(1, dayOfMonth / 7);
    const groceryWeeklyAvg = groceryTotal / currentWeeks;

    // Recurring Bills total this month
    const billsTotal = monthExpenses
      .filter((e) => ['Rent', 'Internet', 'Mobile', 'Utilities'].includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);

    // Other daily expenses
    const otherTotal = Math.max(0, monthlyTotal - groceryTotal - billsTotal);

    // Remaining Budget
    const remainingBudget = budgetSettings.monthlyBudget - monthlyTotal;
    const budgetPercentage = Math.round((monthlyTotal / (budgetSettings.monthlyBudget || 1)) * 100);

    // Category breakdown
    const categoryTotals: Record<ExpenseCategory, number> = {} as any;
    EXPENSE_CATEGORIES.forEach((c) => {
      categoryTotals[c.category] = 0;
    });

    monthExpenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const categoryBreakdown = EXPENSE_CATEGORIES.map((catConfig) => {
      const amount = categoryTotals[catConfig.category] || 0;
      const percentage = monthlyTotal > 0 ? Math.round((amount / monthlyTotal) * 100) : 0;
      return {
        category: catConfig.category,
        amount,
        percentage,
        color: catConfig.color,
        bgColor: catConfig.bgColor,
        icon: catConfig.icon,
      };
    }).sort((a, b) => b.amount - a.amount);

    // Upcoming unpaid bills
    const upcomingBills = recurringBills
      .filter((b) => !b.isPaid)
      .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));

    return {
      monthlyTotal,
      groceryTotal,
      groceryWeeklyAvg,
      weeklyGroceryTotal,
      billsTotal,
      otherTotal,
      remainingBudget,
      budgetPercentage,
      categoryBreakdown,
      upcomingBills,
    };
  }, [expenses, recurringBills, budgetSettings]);

  // Metrics Computations
  const todayHours = elapsedSeconds / 3600;
  const todayBreakdown = useMemo(() => {
    return calculateSalary(activeJob, todayHours, 0, 0);
  }, [activeJob, todayHours]);

  const todayEarnings = {
    hours: Number(todayHours.toFixed(1)),
    gross: todayBreakdown.grossPay,
    net: todayBreakdown.netPay,
    tax: todayBreakdown.totalDeductions,
  };

  // Weekly Stats (sum of recent completed/in-progress entries)
  const weeklyStats = useMemo(() => {
    const recent = jobTimeEntries.slice(0, 5);
    const totalH = recent.reduce((sum, e) => sum + e.totalHours, 0);
    const otH = recent.reduce((sum, e) => sum + e.overtimeHours, 0);
    const regH = totalH - otH;
    const breakdown = calculateSalary(activeJob, regH, otH, 0);
    return {
      hours: Number(totalH.toFixed(1)),
      overtime: Number(otH.toFixed(1)),
      gross: breakdown.grossPay,
      net: breakdown.netPay,
    };
  }, [jobTimeEntries, activeJob]);

  // Full Pay Period Salary breakdown (Standard 72h + 4.5h OT matching Stitch design)
  const currentSalaryBreakdown = useMemo(() => {
    return calculateSalary(activeJob, 72.0, 4.5, 0);
  }, [activeJob]);

  const resetToDemoData = () => {
    localStorage.clear();
    setJobs(DEFAULT_JOBS);
    setActiveJobId(DEFAULT_JOBS[0].id);
    setPunchState('WORKING');
    setElapsedSeconds(3 * 3600 + 42 * 60 + 14);
    setBreakElapsedSeconds(0);
    setTodayTimeline(INITIAL_TIMELINE);
    setTimeEntries(INITIAL_ENTRIES);
    setAuditRecords(INITIAL_AUDITS);
    setCustomHolidays([]);
    setNotifications(INITIAL_NOTIFICATIONS);
    setExpenses(INITIAL_EXPENSES);
    setRecurringBills(INITIAL_RECURRING_BILLS);
    setBudgetSettings(INITIAL_BUDGET);
    showToast('Reset to demo sample data successfully', 'refresh');
  };

  return (
    <AppContext.Provider
      value={{
        jobs,
        activeJob,
        activeJobId,
        switchJob,
        addJob,
        updateJob,

        punchState,
        setPunchState,
        elapsedSeconds,
        breakElapsedSeconds,
        todayTimeline,
        punchIn,
        startBreak,
        endBreak,
        punchOut,
        simulateState,

        timeEntries,
        jobTimeEntries,
        addTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        resolveMissedPunch,

        auditRecords,
        customHolidays,
        addCustomHoliday,
        deleteCustomHoliday,

        notifications,
        dismissNotification,
        markAllNotificationsRead,

        currentView,
        setCurrentView,

        isIPhoneMode,
        toggleIPhoneMode,

        toast,
        showToast,

        currentSalaryBreakdown,
        todayEarnings,
        weeklyStats,

        // Expenses
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        importExpenses,

        recurringBills,
        addRecurringBill,
        updateRecurringBill,
        deleteRecurringBill,
        toggleBillPaid,

        budgetSettings,
        updateBudgetSettings,

        expenseStats,

        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
