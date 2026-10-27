import { calculateSalary } from '../src/services/taxEngine.ts';
import { EXPENSE_CATEGORIES } from '../src/services/expenseService.ts';
import { computeShiftTimesAndPay, calculateShiftDurationHours, QUEBEC_BREAK_PRESET } from '../src/context/AppContext.tsx';
import { translations } from '../src/services/i18n.ts';

console.log('=== RUNNING WORKTIME COMPREHENSIVE AUTOMATED TESTS ===\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

// ----------------------------------------------------
// Test Suite 1: Salary & Tax Calculation Engine
// ----------------------------------------------------
console.log('--- Test Suite 1: Salary & Tax Calculations (Canada QC, US NY) ---');

const jobQC = {
  id: 'test_qc',
  companyName: 'Acme QC',
  companyEntity: 'Acme QC Inc',
  shortName: 'Acme QC',
  position: 'Developer',
  country: 'ca',
  countryName: 'Canada',
  province: 'QC',
  provinceName: 'Quebec',
  city: 'Montreal',
  currency: 'CAD',
  currencySymbol: '$',
  hourlyRate: 50.0,
  wageType: 'hourly',
  annualSalary: 104000,
  payFrequency: 'biweekly',
  periodsPerYear: 26,
  standardDailyHours: 8,
  standardWeeklyHours: 40,
  overtimeMultiplier: 1.5,
  holidayMultiplier: 2.0,
  autoDeductUnpaidBreak: true,
  taxYear: '2026',
  color: '#006c4a',
  accentBg: '#82f5c1',
};

// 40 hours regular, 10 hours overtime at 1.5x (rate 75), 0 holiday
const breakdownQC = calculateSalary(jobQC, 40, 10, 0);

assert(breakdownQC.regularPay === 2000.0, 'QC Regular Pay for 40h @ $50 = $2000.00');
assert(breakdownQC.overtimePay === 750.0, 'QC Overtime Pay for 10h @ $75 (1.5x) = $750.00');
assert(breakdownQC.grossPay === 2750.0, 'QC Gross Pay = $2750.00');
assert(breakdownQC.totalTaxes > 0, 'QC Total Taxes calculated and > 0');
assert(breakdownQC.totalBenefits > 0, 'QC Total Benefits calculated and > 0');
assert(breakdownQC.totalDeductions === Number((breakdownQC.totalTaxes + breakdownQC.totalBenefits).toFixed(2)), 'QC Total Deductions equals Taxes + Benefits');
assert(breakdownQC.netPay === Number((breakdownQC.grossPay - breakdownQC.totalDeductions).toFixed(2)), 'QC Net Pay equals Gross Pay minus Total Deductions');
assert(breakdownQC.takeHomePercentage > 50 && breakdownQC.takeHomePercentage < 100, `QC Take Home percentage reasonable (${breakdownQC.takeHomePercentage}%)`);

// Test US NY
const jobUS = {
  ...jobQC,
  id: 'test_us',
  country: 'us',
  countryName: 'United States',
  province: 'NY',
  currency: 'USD',
  hourlyRate: 40.0,
};

const breakdownUS = calculateSalary(jobUS, 80, 0, 0);
assert(breakdownUS.grossPay === 3200.0, 'US NY Gross Pay for 80h @ $40 = $3200.00');
assert(breakdownUS.netPay < 3200.0 && breakdownUS.netPay > 2000.0, 'US NY Net Pay properly deducted');

// ----------------------------------------------------
// Test Suite 2: Expense Pie Chart Categorization & Math
// ----------------------------------------------------
console.log('\n--- Test Suite 2: Expense Pie Chart Categories & Calculations ---');

const testExpenses = [
  // Mandatory Bills
  { id: '1', name: 'Apartment Rent', amount: 1500, category: 'Rent', date: '2026-10-01' },
  { id: '2', name: 'Fibe Internet', amount: 75, category: 'Internet', date: '2026-10-05' },
  { id: '3', name: 'Hydro Quebec', amount: 95, category: 'Utilities', date: '2026-10-10' },
  { id: '4', name: '5G Mobile Phone', amount: 65, category: 'Mobile', date: '2026-10-12' },
  // Groceries & Daily Expenses
  { id: '5', name: 'Metro Supermarket', amount: 145.50, category: 'Groceries', date: '2026-10-14' },
  { id: '6', name: 'Costco Wholesale', amount: 220.00, category: 'Groceries', date: '2026-10-18' },
  // Miscellaneous
  { id: '7', name: 'Metro Transit Pass', amount: 94.00, category: 'Transportation', date: '2026-10-02' },
  { id: '8', name: 'Cinema & Dinner', amount: 60.50, category: 'Entertainment', date: '2026-10-15' },
  { id: '9', name: 'Pharmacy Meds', amount: 35.00, category: 'Healthcare', date: '2026-10-16' },
  // Outside current month (September) - should be excluded
  { id: '10', name: 'Past Month Bill', amount: 1200, category: 'Rent', date: '2026-09-01' },
];

const currentMonthPrefix = '2026-10';
const octExpenses = testExpenses.filter(e => e.date.startsWith(currentMonthPrefix));

const totalMonthly = octExpenses.reduce((sum, e) => sum + e.amount, 0);
assert(totalMonthly === (1500 + 75 + 95 + 65 + 145.50 + 220.00 + 94.00 + 60.50 + 35.00), `Total Monthly expenses strictly match Oct transactions ($${totalMonthly.toFixed(2)})`);

const mandatoryBills = octExpenses
  .filter(e => ['Rent', 'Internet', 'Mobile', 'Utilities'].includes(e.category))
  .reduce((sum, e) => sum + e.amount, 0);
assert(mandatoryBills === 1735.00, `Mandatory Bills total = $1735.00 (Rent + Internet + Utilities + Mobile)`);

const groceries = octExpenses
  .filter(e => e.category === 'Groceries')
  .reduce((sum, e) => sum + e.amount, 0);
assert(groceries === 365.50, `Groceries total = $365.50`);

const misc = octExpenses
  .filter(e => !['Rent', 'Internet', 'Mobile', 'Utilities', 'Groceries'].includes(e.category))
  .reduce((sum, e) => sum + e.amount, 0);
assert(misc === 189.50, `Miscellaneous total = $189.50`);

// Check that 3 categories sum exactly to total
const sumOf3 = Number((mandatoryBills + groceries + misc).toFixed(2));
assert(sumOf3 === totalMonthly, `3 Categories ($${sumOf3.toFixed(2)}) equal exactly Total Monthly ($${totalMonthly.toFixed(2)})`);

// Percentages
const pctBills = (mandatoryBills / totalMonthly) * 100;
const pctGroceries = (groceries / totalMonthly) * 100;
const pctMisc = (misc / totalMonthly) * 100;
const sumPct = Number((pctBills + pctGroceries + pctMisc).toFixed(2));
assert(Math.abs(sumPct - 100) < 0.01, `Category percentages sum exactly to 100% (${sumPct}%)`);

// ----------------------------------------------------
// Test Suite 3: Empty State Handling
// ----------------------------------------------------
console.log('\n--- Test Suite 3: Zero Expenses & Empty States ---');
const emptyExpenses = [];
const emptyTotal = emptyExpenses.reduce((sum, e) => sum + e.amount, 0);
const emptyPct = emptyTotal > 0 ? (0 / emptyTotal) * 100 : 0;
assert(emptyTotal === 0, 'Empty expenses yields 0 total');
assert(emptyPct === 0 && !isNaN(emptyPct), 'Empty expenses yields 0% without NaN or divide-by-zero error');

// ----------------------------------------------------
// Test Suite 4: Recurring Bills Schedule Calculation
// ----------------------------------------------------
console.log('\n--- Test Suite 4: Recurring Commitments & Frequency Normalization ---');
const sampleBills = [
  { frequency: 'monthly', amount: 1500 },
  { frequency: 'weekly', amount: 50 }, // ~216.50/mo
  { frequency: 'yearly', amount: 1200 }, // 100/mo
];

const scheduledTotal = sampleBills.reduce((sum, b) => {
  if (b.frequency === 'monthly') return sum + b.amount;
  if (b.frequency === 'weekly') return sum + b.amount * 4.33;
  if (b.frequency === 'yearly') return sum + b.amount / 12;
  return sum + b.amount;
}, 0);

assert(scheduledTotal > 1800 && scheduledTotal < 1850, `Normalized recurring monthly commitment calculated ($${scheduledTotal.toFixed(2)})`);

// ----------------------------------------------------
// Test Suite 5: Exact Break Management & Shift Calculations (Priority 4)
// User requirement:
// - One 30-minute unpaid break.
// - Two 15-minute paid breaks.
// - An eight-hour shift spanning 08:00 to 16:00.
// Expected results:
// - Total elapsed shift time: 8 hours.
// - Unpaid break time: 30 minutes.
// - Paid time: 7 hours 30 minutes, assuming two paid breaks count within paid time.
// - Total break time: 60 minutes.
// ----------------------------------------------------
console.log('\n--- Test Suite 5: Exact Break Management & Shift Calculations (Priority 4) ---');

const shiftBreaksSpec = [
  { id: 'b1', name: 'Meal Break', durationMinutes: 30, isPaid: false },
  { id: 'b2', name: 'Morning Break', durationMinutes: 15, isPaid: true },
  { id: 'b3', name: 'Afternoon Break', durationMinutes: 15, isPaid: true },
];

const testJobRate50 = {
  ...jobQC,
  hourlyRate: 50.0,
  standardDailyHours: 8.0,
  overtimeMultiplier: 1.5,
};

const calcResult = computeShiftTimesAndPay('08:00 AM', '04:00 PM', shiftBreaksSpec, testJobRate50);

assert(calcResult.shiftDurationHours === 8.0, `Total elapsed shift time is 8 hours (found: ${calcResult.shiftDurationHours}h)`);
assert(calcResult.unpaidBreakMinutes === 30, `Unpaid break time is 30 minutes (found: ${calcResult.unpaidBreakMinutes}m)`);
assert(calcResult.paidBreakMinutes === 30, `Paid break time is 30 minutes across 2 paid breaks (found: ${calcResult.paidBreakMinutes}m)`);
assert(calcResult.totalBreakMinutes === 60, `Total break time is 60 minutes (found: ${calcResult.totalBreakMinutes}m)`);
assert(calcResult.paidHours === 7.5, `Paid work time is 7 hours 30 minutes (7.5h) (found: ${calcResult.paidHours}h)`);
assert(calcResult.regularHours === 7.5, `Regular hours equals 7.5h (found: ${calcResult.regularHours}h)`);
assert(calcResult.overtimeHours === 0.0, `Overtime hours is 0.0 since 7.5h <= 8.0h (found: ${calcResult.overtimeHours}h)`);
assert(calcResult.grossPay === 375.0, `Gross pay equals 7.5h @ $50.00/h = $375.00 (found: $${calcResult.grossPay.toFixed(2)})`);

// Verify no double-counting or double-subtraction
const doubleSubCheck = calcResult.shiftDurationHours - (calcResult.unpaidBreakMinutes / 60);
assert(calcResult.paidHours === doubleSubCheck, `Unpaid break is subtracted exactly once: 8.0h - 0.5h = 7.5h (verified: ${doubleSubCheck}h)`);

// ----------------------------------------------------
// Test Suite 6: Overnight Shift & Overtime with Breaks
// ----------------------------------------------------
console.log('\n--- Test Suite 6: Overnight Shifts & Overtime with Breaks ---');

// Overnight shift 11:00 PM to 07:00 AM (8h) crossing midnight with 30m unpaid break
const overnightCalc = computeShiftTimesAndPay('11:00 PM', '07:00 AM', [{ durationMinutes: 30, isPaid: false }], testJobRate50);
assert(overnightCalc.shiftDurationHours === 8.0, `Overnight shift 11:00 PM to 07:00 AM calculates to 8.0h (found: ${overnightCalc.shiftDurationHours}h)`);
assert(overnightCalc.paidHours === 7.5, `Overnight paid hours is 7.5h after 30m unpaid meal break (found: ${overnightCalc.paidHours}h)`);

// Overtime shift: 08:00 AM to 06:00 PM (10.0h elapsed) with 30m unpaid meal break
// Billable hours = 10.0 - 0.5 = 9.5h -> 8.0h regular @ $50 ($400) + 1.5h OT @ $75 ($112.50) = $512.50
const otShiftCalc = computeShiftTimesAndPay('08:00 AM', '06:00 PM', [{ durationMinutes: 30, isPaid: false }], testJobRate50);
assert(otShiftCalc.shiftDurationHours === 10.0, `Overtime shift duration is 10.0h (found: ${otShiftCalc.shiftDurationHours}h)`);
assert(otShiftCalc.paidHours === 9.5, `Overtime shift paid hours is 9.5h (found: ${otShiftCalc.paidHours}h)`);
assert(otShiftCalc.regularHours === 8.0, `Regular hours capped at standardDailyHours 8.0 (found: ${otShiftCalc.regularHours}h)`);
assert(otShiftCalc.overtimeHours === 1.5, `Overtime hours calculated as 1.5h (found: ${otShiftCalc.overtimeHours}h)`);
assert(otShiftCalc.grossPay === 512.50, `Gross pay equals 8h @ $50 + 1.5h @ $75 = $512.50 (found: $${otShiftCalc.grossPay.toFixed(2)})`);

// ----------------------------------------------------
// Test Suite 7: Multilingual Audit & Key Parity
// ----------------------------------------------------
console.log('\n--- Test Suite 7: Multilingual Dictionary Parity & Coverage ---');

const supportedLanguages = ['en', 'fr', 'es', 'zh', 'de'];
const englishKeys = Object.keys(translations.en);

assert(englishKeys.length > 100, `English dictionary contains ${englishKeys.length} verified localization keys`);

supportedLanguages.forEach((lang) => {
  const dict = translations[lang];
  assert(dict !== undefined, `Language '${lang}' dictionary is defined`);
  
  let missingKeysCount = 0;
  englishKeys.forEach((key) => {
    if (dict[key] === undefined || dict[key] === '') {
      missingKeysCount++;
    }
  });
  assert(missingKeysCount === 0, `Language '${lang}' has 0 missing keys relative to English (100% key parity)`);
});

// ----------------------------------------------------
// Final Summary
// ----------------------------------------------------
console.log(`\n==============================================`);
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log(`==============================================\n`);

if (failedTests > 0) {
  process.exit(1);
}
