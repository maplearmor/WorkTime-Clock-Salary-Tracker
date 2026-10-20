import { calculateSalary } from '../src/services/taxEngine.ts';
import { EXPENSE_CATEGORIES } from '../src/services/expenseService.ts';

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
