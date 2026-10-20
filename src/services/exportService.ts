import { TimeEntry, Job, SalaryBreakdown, AuditRecord } from '../types';

export function exportTimesheetCSV(job: Job, entries: TimeEntry[]) {
  const headers = [
    'Date',
    'Day',
    'Company',
    'Role',
    'Punch In',
    'Break (Mins)',
    'Punch Out',
    'Regular Hours',
    'Overtime Hours',
    'Total Hours',
    `Gross Pay (${job.currency})`,
    `Net Pay (${job.currency})`,
    'Status',
    'Notes',
  ];

  const rows = entries.map((e) => [
    `"${e.date}"`,
    `"${e.dayLabel}"`,
    `"${job.companyName}"`,
    `"${job.position}"`,
    `"${e.punchIn}"`,
    e.breakMinutes,
    `"${e.punchOut}"`,
    e.regularHours.toFixed(2),
    e.overtimeHours.toFixed(2),
    e.totalHours.toFixed(2),
    e.grossPay.toFixed(2),
    e.netPay.toFixed(2),
    `"${e.status}"`,
    `"${e.notes || ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `WorkTime_Timesheet_${job.shortName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAuditJSON(job: Job, audits: AuditRecord[]) {
  const payload = {
    exportDate: new Date().toISOString(),
    application: 'WorkTime Clock & Salary Tracker',
    job: {
      id: job.id,
      name: job.companyName,
      rate: job.hourlyRate,
      currency: job.currency,
      jurisdiction: `${job.province}, ${job.country.toUpperCase()}`,
    },
    auditCount: audits.length,
    events: audits,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `WorkTime_AuditLog_${job.shortName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportPayStubPDF(job: Job, salary: SalaryBreakdown, periodLabel: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Pay Stub Statement - ${job.companyName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #0b1c30; background: #fff; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .brand { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; }
    .badge { background: #e5eeff; color: #006c4a; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 13px; }
    .card { background: #f8fafe; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .card-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th { text-align: left; padding: 8px; background: #f1f5f9; border-bottom: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; color: #475569; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .hero-net { background: #006c4a; color: #ffffff; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin: 24px 0; }
    .net-val { font-size: 28px; font-weight: 800; font-family: monospace; }
    .footer { font-size: 11px; color: #64748b; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 16px; text-align: right;">
    <button onclick="window.print()" style="background:#0f172a; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:600; cursor:pointer;">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div>
      <div class="brand">WorkTime · Statement of Earnings</div>
      <div style="color: #64748b; font-size: 13px; margin-top: 4px;">Employee: Current User · Ref #WT-2026-06</div>
    </div>
    <div style="text-align: right;">
      <span class="badge">Official Estimate</span>
      <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Pay Period: ${periodLabel}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Employer Information</div>
      <div style="font-weight: 700; font-size: 15px;">${job.companyName}</div>
      <div style="color: #475569;">${job.city}, ${job.provinceName}, ${job.countryName}</div>
      <div style="color: #64748b; margin-top: 4px;">Tax Jurisdiction: ${job.province}-${job.country.toUpperCase()}-${job.taxYear}</div>
    </div>
    <div class="card">
      <div class="card-title">Pay Details</div>
      <div>Role: <strong>${job.position}</strong></div>
      <div>Base Rate: <strong>${job.currencySymbol}${job.hourlyRate.toFixed(2)} ${job.currency}/hr</strong></div>
      <div>Frequency: <strong>${job.payFrequency.toUpperCase()}</strong> (${job.periodsPerYear} periods/yr)</div>
    </div>
  </div>

  <div class="card-title" style="margin-top: 20px;">Earnings Breakdown</div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Hours</th>
        <th class="text-right">Rate</th>
        <th class="text-right">Total (${job.currency})</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Regular Shift Hours</td>
        <td class="text-right">${salary.regularHours.toFixed(2)}</td>
        <td class="text-right">${job.currencySymbol}${job.hourlyRate.toFixed(2)}</td>
        <td class="text-right">${job.currencySymbol}${salary.regularPay.toFixed(2)}</td>
      </tr>
      ${salary.overtimeHours > 0 ? `
      <tr>
        <td>Overtime Hours (${job.overtimeMultiplier}x)</td>
        <td class="text-right">${salary.overtimeHours.toFixed(2)}</td>
        <td class="text-right">${job.currencySymbol}${(job.hourlyRate * job.overtimeMultiplier).toFixed(2)}</td>
        <td class="text-right">${job.currencySymbol}${salary.overtimePay.toFixed(2)}</td>
      </tr>` : ''}
      <tr style="font-weight: 700; background: #f8fafc;">
        <td colspan="3">Total Gross Pay</td>
        <td class="text-right">${job.currencySymbol}${salary.grossPay.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="card-title" style="margin-top: 24px;">Statutory &amp; Voluntary Deductions</div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Category / Authority</th>
        <th class="text-right">Amount (${job.currency})</th>
      </tr>
    </thead>
    <tbody>
      ${salary.deductions.map(d => `
        <tr>
          <td><strong>${d.name}</strong><br><small style="color:#64748b">${d.rateLabel}</small></td>
          <td style="text-transform: capitalize; color:#475569;">${d.category}</td>
          <td class="text-right" style="color: #ba1a1a; font-weight:600;">-${job.currencySymbol}${d.amount.toFixed(2)}</td>
        </tr>
      `).join('')}
      <tr style="font-weight: 700; background: #ffdad6; color: #93000a;">
        <td colspan="2">Total Deductions &amp; Taxes</td>
        <td class="text-right">-${job.currencySymbol}${salary.totalDeductions.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="hero-net">
    <div>
      <div style="font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.05em;">Net Take-Home Pay (${salary.takeHomePercentage}% of Gross)</div>
      <div style="font-size: 13px; opacity: 0.85;">Disbursed via direct deposit</div>
    </div>
    <div class="net-val">${job.currencySymbol}${salary.netPay.toFixed(2)} ${job.currency}</div>
  </div>

  <div class="footer">
    WorkTime Clock &amp; Salary Tracker · Generated on ${new Date().toLocaleDateString()} · Estimated tax computations based on ${job.taxYear} statutory brackets.
  </div>
</body>
</html>
  `;

  // Safe opening: try window.open, otherwise download as printable HTML statement
  let opened = false;
  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      opened = true;
    }
  } catch {
    opened = false;
  }

  if (!opened) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `WorkTime_PayStub_${job.shortName.replace(/\\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
