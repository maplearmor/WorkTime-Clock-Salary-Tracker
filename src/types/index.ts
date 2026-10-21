export type PunchState = 'WORKING' | 'ON_BREAK' | 'CLOCKED_OUT' | 'MISSED_PUNCH';

export type AppView = 'clock' | 'timesheet' | 'salary' | 'expenses' | 'reports' | 'calendar' | 'settings';

export type ExpenseCategory =
  | 'Groceries'
  | 'Rent'
  | 'Internet'
  | 'Mobile'
  | 'Utilities'
  | 'Transportation'
  | 'Shopping'
  | 'Healthcare'
  | 'Entertainment'
  | 'Other';

export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'Cash' | 'Bank Transfer';

export interface GroceryItem {
  id: string;
  name: string;
  price: number;
  quantity?: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  notes?: string;
  items?: GroceryItem[];
  source?: 'manual' | 'csv' | 'bank_import';
  recurringBillId?: string;
  createdAt: number;
}

export type BillFrequency = 'weekly' | 'monthly' | 'yearly';

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  frequency: BillFrequency;
  nextDueDate: string; // YYYY-MM-DD
  reminderDaysBefore?: number;
  hasReminder: boolean;
  isPaid: boolean;
  autoPayment: boolean;
  lastPaidDate?: string;
}

export interface BudgetSettings {
  monthlyBudget: number;
  enableBudgetAlerts: boolean;
  alertThresholdPercent: number;
  categoryBudgets?: Partial<Record<ExpenseCategory, number>>;
}

export interface StagedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  suggestedCategory: ExpenseCategory;
  paymentMethod: PaymentMethod;
  confirmed: boolean;
  selected: boolean;
}

export interface AIAssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  dataContext?: any;
}

export type ReportGranularity = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface ReportSummary {
  periodLabel: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  grossPay: number;
  estimatedTaxes: number;
  estimatedNetPay: number;
  deductions: number;
  shiftsCount: number;
}


export type CountryCode = 'ca' | 'us' | 'uk' | 'cn' | 'de';

export type AppLanguage = 'en' | 'fr' | 'es' | 'zh' | 'de';

export type PayFrequency = 'weekly' | 'biweekly' | 'semi-monthly' | 'monthly';

export type WageType = 'hourly' | 'salary';

export interface TaxDeductionItem {
  id: string;
  name: string;
  category: 'federal' | 'regional' | 'pension' | 'insurance' | 'voluntary';
  rateLabel: string;
  amount: number;
  ceilingProgress?: number; // e.g. 62%
  isDeduction: boolean;
}

export interface SalaryBreakdown {
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  regularPay: number;
  overtimePay: number;
  holidayPay: number;
  grossPay: number;
  totalTaxes: number;
  totalBenefits: number;
  totalDeductions: number;
  netPay: number;
  takeHomePercentage: number;
  deductions: TaxDeductionItem[];
  annualGross: number;
  annualNet: number;
}

export interface Job {
  id: string;
  companyName: string;
  companyEntity: string;
  shortName: string;
  position: string;
  country: CountryCode;
  countryName: string;
  province: string;
  provinceName: string;
  city: string;
  currency: string;
  currencySymbol: string;
  hourlyRate: number;
  wageType: WageType;
  annualSalary: number;
  payFrequency: PayFrequency;
  periodsPerYear: number;
  standardDailyHours: number;
  standardWeeklyHours: number;
  overtimeMultiplier: number;
  holidayMultiplier: number;
  autoDeductUnpaidBreak: boolean;
  taxYear: string;
  color: string;
  accentBg: string;
}

export interface PunchTimelineEvent {
  id: string;
  title: string;
  detail: string;
  timeStr: string;
  timestamp: number;
  type: 'in' | 'break_start' | 'break_end' | 'out' | 'correction' | 'manual';
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface AuditRecord {
  id: string;
  entryId: string;
  date: string;
  fieldChanged: string;
  originalValue: string;
  newValue: string;
  reason: string;
  changedAt: string;
  changedBy: string;
}

export interface TimeEntry {
  id: string;
  jobId: string;
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Thursday, Oct 23"
  punchIn: string; // e.g. "08:30 AM"
  breakMinutes: number;
  punchOut: string; // e.g. "05:30 PM" or "--:-- MISSING"
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  totalHours: number;
  grossPay: number;
  netPay: number;
  status: 'completed' | 'in_progress' | 'missed_punch' | 'approved';
  notes?: string;
  location?: string;
  isHoliday?: boolean;
}

export interface HolidayItem {
  id: string;
  country: CountryCode;
  province?: string;
  month: string; // e.g. "JUN"
  day: number; // e.g. 24
  dateString: string; // "2026-06-24"
  name: string;
  typeLabel: string; // e.g. "National Holiday (Fête nationale)"
  multiplier: number;
  isCustom?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'missed_punch' | 'overtime_warning' | 'payroll_close' | 'holiday' | 'info';
  timestamp: string;
  read: boolean;
  actionable?: boolean;
  actionLabel?: string;
}
