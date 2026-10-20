import {
  Expense,
  ExpenseCategory,
  PaymentMethod,
  RecurringBill,
  BudgetSettings,
  StagedTransaction,
} from '../types';

export const EXPENSE_CATEGORIES: {
  category: ExpenseCategory;
  icon: string;
  color: string;
  bgColor: string;
}[] = [
  { category: 'Groceries', icon: 'local_grocery_store', color: '#006c4a', bgColor: '#e6f7f0' },
  { category: 'Rent', icon: 'home', color: '#1e3a8a', bgColor: '#eff4ff' },
  { category: 'Internet', icon: 'wifi', color: '#0284c7', bgColor: '#e0f2fe' },
  { category: 'Mobile', icon: 'smartphone', color: '#6366f1', bgColor: '#eef2ff' },
  { category: 'Utilities', icon: 'bolt', color: '#d97706', bgColor: '#fef3c7' },
  { category: 'Transportation', icon: 'directions_subway', color: '#059669', bgColor: '#ecfdf5' },
  { category: 'Shopping', icon: 'shopping_bag', color: '#db2777', bgColor: '#fdf2f8' },
  { category: 'Healthcare', icon: 'medical_services', color: '#dc2626', bgColor: '#fef2f2' },
  { category: 'Entertainment', icon: 'movie', color: '#7c3aed', bgColor: '#f3e8ff' },
  { category: 'Other', icon: 'receipt_long', color: '#475569', bgColor: '#f1f5f9' },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Credit Card',
  'Debit Card',
  'Cash',
  'Bank Transfer',
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    name: 'Metro Supermarket',
    amount: 142.50,
    category: 'Groceries',
    paymentMethod: 'Credit Card',
    date: '2026-10-11',
    notes: 'Weekly fresh groceries and pantry supplies',
    items: [
      { id: 'i1', name: 'Organic Whole Milk 2L', price: 5.49 },
      { id: 'i2', name: 'Artisan Sourdough Loaf', price: 4.80 },
      { id: 'i3', name: 'Atlantic Salmon Fillets 600g', price: 21.50 },
      { id: 'i4', name: 'Honeycrisp Apples 1.5kg', price: 6.90 },
      { id: 'i5', name: 'Greek Yogurt Plain 750g', price: 5.79 },
      { id: 'i6', name: 'Extra Virgin Olive Oil 1L', price: 16.90 },
      { id: 'i7', name: 'Assorted Vegetables & Greens', price: 18.20 },
      { id: 'i8', name: 'Free-range Eggs 18pk', price: 7.45 },
      { id: 'i9', name: 'Pantry items & spices', price: 55.47 },
    ],
    source: 'manual',
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'exp_2',
    name: 'Costco Wholesale',
    amount: 218.40,
    category: 'Groceries',
    paymentMethod: 'Debit Card',
    date: '2026-10-04',
    notes: 'Bulk household food and household paper items',
    items: [
      { id: 'c1', name: 'Organic Chicken Breasts 2kg', price: 34.50 },
      { id: 'c2', name: 'Rolled Oats 5kg', price: 11.20 },
      { id: 'c3', name: 'Paper Towels 12pk', price: 22.80 },
      { id: 'c4', name: 'Almond Butter 1kg', price: 13.90 },
      { id: 'c5', name: 'Frozen Berries 2kg', price: 15.50 },
      { id: 'c6', name: 'Bulk snacks & cheese', price: 120.50 },
    ],
    source: 'manual',
    createdAt: Date.now() - 9 * 86400000,
  },
  {
    id: 'exp_3',
    name: 'Local Farmers Market',
    amount: 45.00,
    category: 'Groceries',
    paymentMethod: 'Cash',
    date: '2026-10-08',
    notes: 'Fresh organic berries, local honey, and root vegetables',
    items: [
      { id: 'f1', name: 'Fresh Blueberries', price: 12.00 },
      { id: 'f2', name: 'Raw Honey Jar', price: 14.00 },
      { id: 'f3', name: 'Heirloom Carrots & Beets', price: 19.00 },
    ],
    source: 'manual',
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'exp_4',
    name: 'October Apartment Rent',
    amount: 1450.00,
    category: 'Rent',
    paymentMethod: 'Bank Transfer',
    date: '2026-10-01',
    notes: 'Downtown 1-Bedroom Lease payment',
    source: 'manual',
    createdAt: Date.now() - 12 * 86400000,
  },
  {
    id: 'exp_5',
    name: 'Hydro-Québec Electricity',
    amount: 84.20,
    category: 'Utilities',
    paymentMethod: 'Debit Card',
    date: '2026-10-05',
    notes: 'Bi-monthly power invoice',
    source: 'manual',
    createdAt: Date.now() - 8 * 86400000,
  },
  {
    id: 'exp_6',
    name: 'Bell Fibe Gigabit Internet',
    amount: 75.00,
    category: 'Internet',
    paymentMethod: 'Credit Card',
    date: '2026-09-18',
    notes: 'Home work fiber connection',
    source: 'manual',
    createdAt: Date.now() - 25 * 86400000,
  },
  {
    id: 'exp_7',
    name: 'Fido Mobile 5G Plan',
    amount: 45.00,
    category: 'Mobile',
    paymentMethod: 'Credit Card',
    date: '2026-09-20',
    notes: 'Unlimited calling & 40GB data',
    source: 'manual',
    createdAt: Date.now() - 23 * 86400000,
  },
  {
    id: 'exp_8',
    name: 'OPUS Monthly Transit Pass',
    amount: 97.00,
    category: 'Transportation',
    paymentMethod: 'Debit Card',
    date: '2026-10-01',
    notes: 'Monthly commuter train & metro pass',
    source: 'manual',
    createdAt: Date.now() - 12 * 86400000,
  },
  {
    id: 'exp_9',
    name: 'Uniqlo Autumn Outerwear',
    amount: 89.90,
    category: 'Shopping',
    paymentMethod: 'Credit Card',
    date: '2026-10-06',
    notes: 'Warm water-repellent jacket for commute',
    source: 'manual',
    createdAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'exp_10',
    name: 'Pharmaprix Pharmacy',
    amount: 28.50,
    category: 'Healthcare',
    paymentMethod: 'Debit Card',
    date: '2026-10-09',
    notes: 'Vitamins & wellness care',
    source: 'manual',
    createdAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'exp_11',
    name: 'Netflix & Spotify Premium',
    amount: 24.98,
    category: 'Entertainment',
    paymentMethod: 'Credit Card',
    date: '2026-10-03',
    notes: 'Monthly streaming bundle',
    source: 'manual',
    createdAt: Date.now() - 10 * 86400000,
  },
];

export const INITIAL_RECURRING_BILLS: RecurringBill[] = [
  {
    id: 'bill_1',
    name: 'Downtown Apartment Rent',
    amount: 1450.00,
    category: 'Rent',
    frequency: 'monthly',
    nextDueDate: '2026-11-01',
    reminderDaysBefore: 3,
    hasReminder: true,
    isPaid: true,
    autoPayment: true,
    lastPaidDate: '2026-10-01',
  },
  {
    id: 'bill_2',
    name: 'Bell Fibe Fiber Internet',
    amount: 75.00,
    category: 'Internet',
    frequency: 'monthly',
    nextDueDate: '2026-10-18',
    reminderDaysBefore: 2,
    hasReminder: true,
    isPaid: false,
    autoPayment: true,
  },
  {
    id: 'bill_3',
    name: 'Fido 5G Mobile Plan',
    amount: 45.00,
    category: 'Mobile',
    frequency: 'monthly',
    nextDueDate: '2026-10-20',
    reminderDaysBefore: 2,
    hasReminder: true,
    isPaid: false,
    autoPayment: true,
  },
  {
    id: 'bill_4',
    name: 'Hydro-Québec Power',
    amount: 85.00,
    category: 'Utilities',
    frequency: 'monthly',
    nextDueDate: '2026-10-26',
    reminderDaysBefore: 3,
    hasReminder: true,
    isPaid: false,
    autoPayment: false,
  },
  {
    id: 'bill_5',
    name: 'Tenant Home Insurance',
    amount: 28.00,
    category: 'Utilities',
    frequency: 'monthly',
    nextDueDate: '2026-11-05',
    reminderDaysBefore: 2,
    hasReminder: true,
    isPaid: true,
    autoPayment: true,
    lastPaidDate: '2026-10-05',
  },
  {
    id: 'bill_6',
    name: 'Gym & Fitness Membership',
    amount: 49.00,
    category: 'Healthcare',
    frequency: 'monthly',
    nextDueDate: '2026-10-16',
    reminderDaysBefore: 1,
    hasReminder: true,
    isPaid: false,
    autoPayment: false,
  },
];

export const INITIAL_BUDGET: BudgetSettings = {
  monthlyBudget: 2600.00,
  enableBudgetAlerts: true,
  alertThresholdPercent: 80,
  categoryBudgets: {
    Groceries: 500,
    Rent: 1500,
    Utilities: 150,
    Internet: 80,
    Mobile: 50,
    Transportation: 150,
    Shopping: 100,
    Healthcare: 80,
    Entertainment: 60,
  },
};

export const SAMPLE_BANK_TRANSACTIONS_RAW: Omit<StagedTransaction, 'id' | 'confirmed' | 'selected'>[] = [
  {
    date: '2026-10-12',
    description: 'IGA Extra St-Denis Grocery',
    amount: 68.45,
    suggestedCategory: 'Groceries',
    paymentMethod: 'Debit Card',
  },
  {
    date: '2026-10-11',
    description: 'Starbucks Coffee Montreal',
    amount: 7.25,
    suggestedCategory: 'Entertainment',
    paymentMethod: 'Credit Card',
  },
  {
    date: '2026-10-10',
    description: 'STM Opus Auto-Reload',
    amount: 22.00,
    suggestedCategory: 'Transportation',
    paymentMethod: 'Debit Card',
  },
  {
    date: '2026-10-09',
    description: 'Amazon.ca Order Electronics',
    amount: 42.10,
    suggestedCategory: 'Shopping',
    paymentMethod: 'Credit Card',
  },
  {
    date: '2026-10-08',
    description: 'Jean Coutu Pharmacy',
    amount: 19.80,
    suggestedCategory: 'Healthcare',
    paymentMethod: 'Debit Card',
  },
];

export function autoCategorizeDescription(description: string): ExpenseCategory {
  const desc = description.toLowerCase();
  if (desc.includes('market') || desc.includes('supermarket') || desc.includes('grocery') || desc.includes('iga') || desc.includes('costco') || desc.includes('metro') || desc.includes('walmart') || desc.includes('loblaws')) {
    return 'Groceries';
  }
  if (desc.includes('rent') || desc.includes('lease') || desc.includes('landlord')) {
    return 'Rent';
  }
  if (desc.includes('internet') || desc.includes('wifi') || desc.includes('bell') || desc.includes('rogers') || desc.includes('videotron')) {
    return 'Internet';
  }
  if (desc.includes('mobile') || desc.includes('wireless') || desc.includes('fido') || desc.includes('telus') || desc.includes('koodo')) {
    return 'Mobile';
  }
  if (desc.includes('hydro') || desc.includes('power') || desc.includes('electric') || desc.includes('gas') || desc.includes('energy') || desc.includes('water')) {
    return 'Utilities';
  }
  if (desc.includes('transit') || desc.includes('subway') || desc.includes('metro') || desc.includes('uber') || desc.includes('lyft') || desc.includes('gas station') || desc.includes('shell') || desc.includes('petro')) {
    return 'Transportation';
  }
  if (desc.includes('pharmacy') || desc.includes('clinic') || desc.includes('dental') || desc.includes('doctor') || desc.includes('gym') || desc.includes('fitness')) {
    return 'Healthcare';
  }
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('cinema') || desc.includes('theatre') || desc.includes('coffee') || desc.includes('restaurant') || desc.includes('bar')) {
    return 'Entertainment';
  }
  if (desc.includes('amazon') || desc.includes('uniqlo') || desc.includes('clothing') || desc.includes('store') || desc.includes('apple')) {
    return 'Shopping';
  }
  return 'Other';
}

export function exportExpensesCSV(expenses: Expense[], currencySymbol = '$'): void {
  const headers = [
    'Date',
    'Expense Name',
    'Category',
    'Payment Method',
    `Amount (${currencySymbol})`,
    'Source',
    'Notes',
  ];

  const rows = expenses.map((e) => [
    `"${e.date}"`,
    `"${e.name.replace(/"/g, '""')}"`,
    `"${e.category}"`,
    `"${e.paymentMethod}"`,
    e.amount.toFixed(2),
    `"${e.source || 'manual'}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `My_Expenses_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCSVToStagedTransactions(csvText: string): StagedTransaction[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const dateIdx = headers.findIndex((h) => h.includes('date'));
  const descIdx = headers.findIndex((h) => h.includes('desc') || h.includes('name') || h.includes('merchant'));
  const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('price') || h.includes('cost') || h.includes('total'));
  const catIdx = headers.findIndex((h) => h.includes('category'));

  const results: StagedTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const values = rawLine.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const rawDesc = descIdx >= 0 && values[descIdx] ? values[descIdx] : `Transaction #${i}`;
    const rawDate = dateIdx >= 0 && values[dateIdx] ? values[dateIdx] : new Date().toISOString().slice(0, 10);
    const rawAmount = amountIdx >= 0 && values[amountIdx] ? Math.abs(parseFloat(values[amountIdx])) : 25.0;

    let cat: ExpenseCategory = 'Other';
    if (catIdx >= 0 && values[catIdx]) {
      const match = EXPENSE_CATEGORIES.find((c) => c.category.toLowerCase() === values[catIdx].toLowerCase());
      if (match) cat = match.category;
      else cat = autoCategorizeDescription(rawDesc);
    } else {
      cat = autoCategorizeDescription(rawDesc);
    }

    results.push({
      id: `staged_${Date.now()}_${i}`,
      date: rawDate.length === 10 ? rawDate : new Date().toISOString().slice(0, 10),
      description: rawDesc,
      amount: isNaN(rawAmount) ? 10.0 : Number(rawAmount.toFixed(2)),
      suggestedCategory: cat,
      paymentMethod: 'Debit Card',
      confirmed: false,
      selected: true,
    });
  }

  return results;
}

export function generateLocalAIResponse(prompt: string, context: {
  monthlyTotal: number;
  groceryTotal: number;
  groceryWeeklyAvg: number;
  billsTotal: number;
  otherTotal: number;
  remainingBudget: number;
  monthlyBudget: number;
  categoryBreakdown: { category: ExpenseCategory; amount: number; percentage: number }[];
  upcomingBills: RecurringBill[];
  currencySymbol: string;
}): string {
  const p = prompt.toLowerCase();
  const sym = context.currencySymbol;

  if (p.includes('grocery') || p.includes('food')) {
    return `You have spent **${sym}${context.groceryTotal.toFixed(2)}** on groceries this month across ${context.categoryBreakdown.find((c) => c.category === 'Groceries')?.percentage || 0}% of your total expenses. That averages approximately **${sym}${context.groceryWeeklyAvg.toFixed(2)}/week**.
\n*Recommendation*: Creating a weekly shopping meal-plan and leveraging bulk staple purchases can save you roughly ${sym}40–${sym}60 per month.`;
  }

  if (p.includes('bill') || p.includes('due') || p.includes('next week')) {
    if (context.upcomingBills.length === 0) {
      return `Good news! You have no unpaid bills due right now. Total recurring bills scheduled this month amount to **${sym}${context.billsTotal.toFixed(2)}**.`;
    }
    const dueList = context.upcomingBills
      .map((b) => `• **${b.name}**: ${sym}${b.amount.toFixed(2)} (Due: ${b.nextDueDate})`)
      .join('\n');
    return `Here are your upcoming unpaid bills:\n\n${dueList}\n\n*Total upcoming*: **${sym}${context.upcomingBills.reduce((s, b) => s + b.amount, 0).toFixed(2)}**. Ensure accounts have sufficient funds prior to due dates.`;
  }

  if (p.includes('reduce') || p.includes('save') || p.includes('cut')) {
    const topCat = context.categoryBreakdown[0];
    const secondCat = context.categoryBreakdown[1];
    return `Based on your current spending, here are realistic ways to optimize:
1. **${topCat?.category || 'Top Category'}** accounts for **${topCat?.percentage || 0}%** (${sym}${topCat?.amount.toFixed(2)}). Even a 5% optimization here yields ${sym}${((topCat?.amount || 0) * 0.05).toFixed(2)} in monthly savings.
2. **Review Recurring Subscriptions**: You currently allocate **${sym}${context.billsTotal.toFixed(2)}** to recurring bills. Check if streaming or fitness subscriptions can be paused or shared.
3. **Weekly Grocery Cap**: Target keeping weekly groceries below ${sym}${(context.groceryWeeklyAvg * 0.85).toFixed(2)} to free up cash.
4. **Current Remaining Budget**: You currently have **${sym}${context.remainingBudget.toFixed(2)}** unspent this month.`;
  }

  if (p.includes('summar') || p.includes('month') || p.includes('overview') || p.includes('how much')) {
    return `**Monthly Spending Summary:**
• Total Spent: **${sym}${context.monthlyTotal.toFixed(2)}**
• Groceries & Food: **${sym}${context.groceryTotal.toFixed(2)}**
• Recurring Bills: **${sym}${context.billsTotal.toFixed(2)}**
• Daily & Other: **${sym}${context.otherTotal.toFixed(2)}**
• Monthly Budget: **${sym}${context.monthlyBudget.toFixed(2)}** (${context.remainingBudget >= 0 ? `${sym}${context.remainingBudget.toFixed(2)} remaining` : `Over budget by ${sym}${Math.abs(context.remainingBudget).toFixed(2)}`})

Your top spending area is **${context.categoryBreakdown[0]?.category}** (${context.categoryBreakdown[0]?.percentage}% of total spending).`;
  }

  if (p.includes('budget') || p.includes('set')) {
    return `Your monthly budget is currently set at **${sym}${context.monthlyBudget.toFixed(2)}**.
You have spent **${sym}${context.monthlyTotal.toFixed(2)}** (${((context.monthlyTotal / (context.monthlyBudget || 1)) * 100).toFixed(1)}% of your limit).
*Advice*: A balanced 50/30/20 budget allocates 50% to essential bills/rent, 30% to daily needs/groceries, and 20% to savings. You can adjust your budget anytime in the Expense Settings panel.`;
  }

  return `Here is an analysis of your current spending:
• Total expenses recorded: **${sym}${context.monthlyTotal.toFixed(2)}**.
• Groceries total: **${sym}${context.groceryTotal.toFixed(2)}** (${context.categoryBreakdown.find((c) => c.category === 'Groceries')?.percentage || 0}%).
• Upcoming unpaid bills: **${context.upcomingBills.length}** pending.
• Remaining budget: **${sym}${context.remainingBudget.toFixed(2)}**.

Feel free to ask questions like:
- "What bills are due next week?"
- "How much did I spend on groceries this month?"
- "Where can I reduce expenses?"`;
}
