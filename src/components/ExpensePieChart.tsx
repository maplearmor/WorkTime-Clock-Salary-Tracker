import React, { useMemo, useState } from 'react';
import { Expense } from '../types';

interface ExpensePieChartProps {
  expenses: Expense[];
  currencySymbol: string;
  currency: string;
}

interface CategorySegment {
  key: 'bills' | 'groceries' | 'misc';
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  hoverColor: string;
  bgLight: string;
  amount: number;
  percentage: number;
}

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({
  expenses,
  currencySymbol,
  currency,
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const currentMonthDate = new Date();
  const currentMonthPrefix = currentMonthDate.toISOString().slice(0, 7);
  const monthName = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(currentMonthDate);

  // Filter expenses strictly to the current month
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date && e.date.startsWith(currentMonthPrefix));
  }, [expenses, currentMonthPrefix]);

  const totalMonthlyExpenses = useMemo(() => {
    return monthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [monthExpenses]);

  // 1. Mandatory Bills: Rent, internet, mobile phone, utilities, insurance, and other recurring essential bills
  const mandatoryBillsTotal = useMemo(() => {
    return monthExpenses
      .filter((e) => ['Rent', 'Internet', 'Mobile', 'Utilities'].includes(e.category))
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [monthExpenses]);

  // 2. Groceries & Daily Expenses: Grocery shopping, food, and everyday purchases
  const groceriesTotal = useMemo(() => {
    return monthExpenses
      .filter((e) => e.category === 'Groceries')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [monthExpenses]);

  // 3. Miscellaneous Expenses: Shopping, transportation, entertainment, and other non-essential expenses
  const miscTotal = useMemo(() => {
    return monthExpenses
      .filter(
        (e) => !['Rent', 'Internet', 'Mobile', 'Utilities', 'Groceries'].includes(e.category)
      )
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [monthExpenses]);

  // Categories metadata & percentages
  const segments: CategorySegment[] = useMemo(() => {
    const total = totalMonthlyExpenses;

    const calcPct = (amount: number) => {
      if (total <= 0) return 0;
      return (amount / total) * 100;
    };

    return [
      {
        key: 'bills',
        title: 'Mandatory Bills',
        subtitle: 'Rent, utilities, mobile, internet & subscriptions',
        icon: 'receipt_long',
        color: '#4F46E5', // Indigo
        hoverColor: '#4338CA',
        bgLight: 'rgba(79, 70, 229, 0.08)',
        amount: mandatoryBillsTotal,
        percentage: calcPct(mandatoryBillsTotal),
      },
      {
        key: 'groceries',
        title: 'Groceries & Daily Expenses',
        subtitle: 'Grocery shopping, food & everyday necessities',
        icon: 'local_grocery_store',
        color: '#006c4a', // WorkTime Emerald
        hoverColor: '#005338',
        bgLight: 'rgba(0, 108, 74, 0.08)',
        amount: groceriesTotal,
        percentage: calcPct(groceriesTotal),
      },
      {
        key: 'misc',
        title: 'Miscellaneous Expenses',
        subtitle: 'Shopping, transportation, leisure & other spend',
        icon: 'shopping_bag',
        color: '#D97706', // Warm Amber
        hoverColor: '#B45309',
        bgLight: 'rgba(217, 119, 6, 0.08)',
        amount: miscTotal,
        percentage: calcPct(miscTotal),
      },
    ];
  }, [totalMonthlyExpenses, mandatoryBillsTotal, groceriesTotal, miscTotal]);

  // SVG Donut Path calculations
  const cx = 80;
  const cy = 80;
  const outerR = 68;
  const innerR = 44;

  const paths = useMemo(() => {
    if (totalMonthlyExpenses <= 0) return [];

    let currentAngle = -90; // Start at top 12 o'clock
    return segments
      .filter((seg) => seg.amount > 0)
      .map((seg) => {
        const sweepAngle = (seg.amount / totalMonthlyExpenses) * 360;
        const startRad = (currentAngle * Math.PI) / 180;
        const endRad = ((currentAngle + sweepAngle) * Math.PI) / 180;

        const isFullCircle = sweepAngle >= 359.99;

        let d = '';
        if (isFullCircle) {
          // If only 1 segment accounts for 100%, render two half-ring arcs
          d = `
            M ${cx} ${cy - outerR}
            A ${outerR} ${outerR} 0 1 0 ${cx} ${cy + outerR}
            A ${outerR} ${outerR} 0 1 0 ${cx} ${cy - outerR}
            M ${cx} ${cy - innerR}
            A ${innerR} ${innerR} 0 1 1 ${cx} ${cy + innerR}
            A ${innerR} ${innerR} 0 1 1 ${cx} ${cy - innerR}
            Z
          `;
        } else {
          const x1 = cx + outerR * Math.cos(startRad);
          const y1 = cy + outerR * Math.sin(startRad);
          const x2 = cx + outerR * Math.cos(endRad);
          const y2 = cy + outerR * Math.sin(endRad);

          const x3 = cx + innerR * Math.cos(endRad);
          const y3 = cy + innerR * Math.sin(endRad);
          const x4 = cx + innerR * Math.cos(startRad);
          const y4 = cy + innerR * Math.sin(startRad);

          const largeArcFlag = sweepAngle > 180 ? 1 : 0;

          d = `
            M ${x1} ${y1}
            A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4}
            Z
          `;
        }

        currentAngle += sweepAngle;
        return {
          key: seg.key,
          d,
          color: seg.color,
          hoverColor: seg.hoverColor,
          title: seg.title,
          amount: seg.amount,
          percentage: seg.percentage,
        };
      });
  }, [totalMonthlyExpenses, segments]);

  const activeSegment = segments.find((s) => s.key === hoveredKey);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4 transition-all">
      {/* Header & Prominent Total */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#006c4a]">pie_chart</span>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
              Monthly Expense Breakdown
            </h2>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {monthName}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Essential bills, grocery food habits &amp; miscellaneous spending
          </p>
        </div>

        {/* Prominent Total Callout */}
        <div className="bg-[#eff4ff] sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl flex items-baseline justify-between sm:block text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Monthly Spend
          </span>
          <div className="flex items-baseline gap-1 sm:justify-end">
            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-[#0b1c30]">
              {currencySymbol}
              {totalMonthlyExpenses.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs font-bold text-slate-500">{currency}</span>
          </div>
        </div>
      </div>

      {/* Center Layout: Donut Pie Chart + Legend */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left Column: Visual Donut Chart */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative py-1">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg
              viewBox="0 0 160 160"
              className="w-full h-full transform transition-transform duration-300"
            >
              {totalMonthlyExpenses <= 0 ? (
                // Empty state donut ring
                <path
                  d={`
                    M ${cx} ${cy - outerR}
                    A ${outerR} ${outerR} 0 1 0 ${cx} ${cy + outerR}
                    A ${outerR} ${outerR} 0 1 0 ${cx} ${cy - outerR}
                    M ${cx} ${cy - innerR}
                    A ${innerR} ${innerR} 0 1 1 ${cx} ${cy + innerR}
                    A ${innerR} ${innerR} 0 1 1 ${cx} ${cy - innerR}
                    Z
                  `}
                  fill="#E2E8F0"
                />
              ) : (
                paths.map((p) => {
                  const isHovered = hoveredKey === p.key;
                  return (
                    <path
                      key={p.key}
                      d={p.d}
                      fill={isHovered ? p.hoverColor : p.color}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        transformOrigin: `${cx}px ${cy}px`,
                        transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                        filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                      }}
                      onMouseEnter={() => setHoveredKey(p.key)}
                      onMouseLeave={() => setHoveredKey(null)}
                    >
                      <title>{`${p.title}: ${currencySymbol}${p.amount.toFixed(2)} (${p.percentage.toFixed(1)}%)`}</title>
                    </path>
                  );
                })
              )}
            </svg>

            {/* Inner Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {activeSegment ? (
                <div className="animate-fade-in">
                  <span
                    className="material-symbols-outlined text-[18px] block"
                    style={{ color: activeSegment.color }}
                  >
                    {activeSegment.icon}
                  </span>
                  <span className="text-[12px] font-black font-mono text-slate-800 block leading-tight">
                    {activeSegment.percentage.toFixed(1)}%
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter truncate max-w-[80px] block">
                    {activeSegment.title.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <div>
                  <span className="material-symbols-outlined text-[20px] text-slate-400 block">
                    account_balance_wallet
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-700 block leading-tight">
                    {monthExpenses.length}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Records
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-medium mt-1">
            {totalMonthlyExpenses > 0 ? 'Hover or tap slices to inspect' : 'No expenses recorded yet'}
          </div>
        </div>

        {/* Right Column: Category Legend & Breakdown Details */}
        <div className="md:col-span-7 space-y-2.5">
          {segments.map((seg) => {
            const isHovered = hoveredKey === seg.key;
            return (
              <div
                key={seg.key}
                onMouseEnter={() => setHoveredKey(seg.key)}
                onMouseLeave={() => setHoveredKey(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? 'border-slate-300 bg-slate-50/80 shadow-xs'
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 transition-transform"
                      style={{
                        backgroundColor: seg.color,
                        transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {seg.title}
                        </span>
                        <span
                          className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded"
                          style={{
                            backgroundColor: seg.bgLight,
                            color: seg.color,
                          }}
                        >
                          {seg.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {seg.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 block">
                      {currencySymbol}
                      {seg.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {seg.amount > 0 ? `${seg.percentage.toFixed(1)}% of total` : '0.00 spend'}
                    </span>
                  </div>
                </div>

                {/* Mini proportional progress track */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, seg.percentage)}%`,
                      backgroundColor: seg.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State Banner if no expenses */}
      {totalMonthlyExpenses === 0 && (
        <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
          <p className="font-medium">
            No expenses recorded for {monthName} yet. Tap <strong>Add Expense</strong> or{' '}
            <strong>Import CSV</strong> to start tracking your spending.
          </p>
        </div>
      )}
    </div>
  );
};
