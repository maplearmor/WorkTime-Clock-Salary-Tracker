import { Job, SalaryBreakdown, TaxDeductionItem } from '../types';

export function calculateSalary(
  job: Job,
  regularHours: number,
  overtimeHours: number = 0,
  holidayHours: number = 0
): SalaryBreakdown {
  const hourlyRate = job.hourlyRate;
  const otRate = hourlyRate * (job.overtimeMultiplier || 1.5);
  const holRate = hourlyRate * (job.holidayMultiplier || 2.0);

  const regularPay = Number((regularHours * hourlyRate).toFixed(2));
  const overtimePay = Number((overtimeHours * otRate).toFixed(2));
  const holidayPay = Number((holidayHours * holRate).toFixed(2));
  const grossPay = Number((regularPay + overtimePay + holidayPay).toFixed(2));

  // Determine deductions based on Country & Region
  const deductions: TaxDeductionItem[] = [];

  if (job.country === 'ca') {
    if (job.province === 'QC') {
      // Quebec Statutory Rules (CRA Federal + Revenu Québec TP-1015 + QPP + EI/QPIP + Benefits)
      const fedRate = 0.1001; // ~10.01% effective on this period after basic personal deduction proration
      const provRate = 0.0861; // ~8.61% Revenu Québec
      const qppRate = 0.0508; // QPP contribution
      const eiQpipRate = 0.00519; // EI & QPIP parental combined

      const fedAmount = Number((grossPay * fedRate).toFixed(2));
      const provAmount = Number((grossPay * provRate).toFixed(2));
      const qppAmount = Number((grossPay * qppRate).toFixed(2));
      const eiQpipAmount = Number((grossPay * eiQpipRate).toFixed(2));

      // Voluntary
      const dentalAmount = 45.00;
      const rrspAmount = Number((grossPay * 0.03).toFixed(2)); // 3% RRSP match

      deductions.push(
        {
          id: 'cra_fed',
          name: 'CRA Federal Tax',
          category: 'federal',
          rateLabel: 'Calculated bracket 20.5% after BPA',
          amount: fedAmount,
          isDeduction: true,
        },
        {
          id: 'rq_prov',
          name: 'Revenu Québec (TP-1015)',
          category: 'regional',
          rateLabel: 'Progressive baseline rate',
          amount: provAmount,
          isDeduction: true,
        },
        {
          id: 'qpp_pension',
          name: 'QPP / Pension Contribution',
          category: 'pension',
          rateLabel: 'Rate: 6.40% (Max $4,055/yr)',
          amount: qppAmount,
          ceilingProgress: 62,
          isDeduction: true,
        },
        {
          id: 'ei_qpip',
          name: 'EI & QPIP Parental Benefit',
          category: 'insurance',
          rateLabel: 'Combined regional rate 0.494%',
          amount: eiQpipAmount,
          isDeduction: true,
        },
        {
          id: 'dental_health',
          name: 'Comprehensive Dental & Health',
          category: 'voluntary',
          rateLabel: 'Sun Life Tier-2 Plan',
          amount: dentalAmount,
          isDeduction: true,
        },
        {
          id: 'rrsp_match',
          name: 'Group RRSP Contribution',
          category: 'voluntary',
          rateLabel: `Employer matches up to $${rrspAmount.toFixed(2)}`,
          amount: rrspAmount,
          isDeduction: true,
        }
      );
    } else {
      // Ontario & Other Canadian provinces (CPP + EI + Fed + Prov)
      const fedAmount = Number((grossPay * 0.115).toFixed(2));
      const provAmount = Number((grossPay * 0.075).toFixed(2));
      const cppAmount = Number((grossPay * 0.0595).toFixed(2));
      const eiAmount = Number((grossPay * 0.0163).toFixed(2));
      const benefits = 50.00;

      deductions.push(
        {
          id: 'cra_fed',
          name: 'CRA Federal Income Tax',
          category: 'federal',
          rateLabel: 'Standard Federal Bracket',
          amount: fedAmount,
          isDeduction: true,
        },
        {
          id: 'prov_tax',
          name: `${job.provinceName} Provincial Tax`,
          category: 'regional',
          rateLabel: 'Provincial Progressive Bracket',
          amount: provAmount,
          isDeduction: true,
        },
        {
          id: 'cpp_pension',
          name: 'CPP Retirement Pension',
          category: 'pension',
          rateLabel: 'CPP Rate: 5.95%',
          amount: cppAmount,
          ceilingProgress: 58,
          isDeduction: true,
        },
        {
          id: 'ei_ins',
          name: 'Employment Insurance (EI)',
          category: 'insurance',
          rateLabel: 'EI Premium: 1.63%',
          amount: eiAmount,
          isDeduction: true,
        },
        {
          id: 'health_plan',
          name: 'Extended Health & Dental',
          category: 'voluntary',
          rateLabel: 'Group Plan Standard',
          amount: benefits,
          isDeduction: true,
        }
      );
    }
  } else if (job.country === 'us') {
    // US (Federal Income Tax + State Tax + Social Security + Medicare + 401k)
    const fedAmount = Number((grossPay * 0.12).toFixed(2));
    const stateRate = job.province === 'TX' ? 0 : job.province === 'CA' ? 0.088 : 0.065;
    const stateLabel =
      job.province === 'TX'
        ? 'No State Income Tax (0%)'
        : job.province === 'CA'
        ? 'California FTB Progressive Bracket (8.8%)'
        : 'New York State Withholding (6.5%)';
    const stateAmount = Number((grossPay * stateRate).toFixed(2));
    const socSecAmount = Number((grossPay * 0.062).toFixed(2));
    const medicareAmount = Number((grossPay * 0.0145).toFixed(2));
    const k401Amount = Number((grossPay * 0.04).toFixed(2));

    deductions.push(
      {
        id: 'irs_fed',
        name: 'IRS Federal Withholding',
        category: 'federal',
        rateLabel: 'US Federal W-4 Standard',
        amount: fedAmount,
        isDeduction: true,
      },
      {
        id: 'state_tax',
        name: `${job.provinceName} State Tax`,
        category: 'regional',
        rateLabel: stateLabel,
        amount: stateAmount,
        isDeduction: true,
      },
      {
        id: 'fica_ss',
        name: 'Social Security (OASDI)',
        category: 'pension',
        rateLabel: 'FICA Rate 6.20%',
        amount: socSecAmount,
        ceilingProgress: 68,
        isDeduction: true,
      },
      {
        id: 'fica_med',
        name: 'Medicare Tax',
        category: 'insurance',
        rateLabel: 'FICA Rate 1.45%',
        amount: medicareAmount,
        isDeduction: true,
      },
      {
        id: 'plan_401k',
        name: '401(k) Retirement Deferral',
        category: 'voluntary',
        rateLabel: '4% Pre-Tax Employee Deferral',
        amount: k401Amount,
        isDeduction: true,
      }
    );
  } else if (job.country === 'cn') {
    // China Individual Income Tax (IIT) + Five Insurances and Housing Fund
    const pension = Number((grossPay * 0.08).toFixed(2));
    const medical = Number((grossPay * 0.02).toFixed(2));
    const unemployment = Number((grossPay * 0.005).toFixed(2));
    const housing = Number((grossPay * 0.12).toFixed(2));
    const iit = Number((grossPay * 0.05).toFixed(2));

    deductions.push(
      {
        id: 'cn_iit',
        name: 'Individual Income Tax (IIT)',
        category: 'federal',
        rateLabel: 'Tier-1 Progressive Brackets',
        amount: iit,
        isDeduction: true,
      },
      {
        id: 'cn_pension',
        name: 'Basic Pension Insurance',
        category: 'pension',
        rateLabel: 'Social Pool 8.0%',
        amount: pension,
        ceilingProgress: 75,
        isDeduction: true,
      },
      {
        id: 'cn_housing',
        name: 'Housing Provident Fund',
        category: 'voluntary',
        rateLabel: 'Municipal Standard 12.0%',
        amount: housing,
        isDeduction: true,
      },
      {
        id: 'cn_med_unemp',
        name: 'Medical & Unemployment',
        category: 'insurance',
        rateLabel: 'Statutory 2.5%',
        amount: Number((medical + unemployment).toFixed(2)),
        isDeduction: true,
      }
    );
  } else {
    // UK or DE or generic European fallback
    const natTax = Number((grossPay * 0.15).toFixed(2));
    const social = Number((grossPay * 0.09).toFixed(2));
    deductions.push(
      {
        id: 'eu_tax',
        name: 'National Income Tax (PAYE)',
        category: 'federal',
        rateLabel: 'Standard Code Brackets',
        amount: natTax,
        isDeduction: true,
      },
      {
        id: 'eu_social',
        name: 'National Social Insurance',
        category: 'insurance',
        rateLabel: 'Class 1 / Statutory Pool',
        amount: social,
        isDeduction: true,
      }
    );
  }

  const totalTaxes = Number(
    deductions
      .filter((d) => d.category === 'federal' || d.category === 'regional')
      .reduce((acc, d) => acc + d.amount, 0)
      .toFixed(2)
  );

  const totalBenefits = Number(
    deductions
      .filter((d) => d.category === 'pension' || d.category === 'insurance' || d.category === 'voluntary')
      .reduce((acc, d) => acc + d.amount, 0)
      .toFixed(2)
  );

  const totalDeductions = Number((totalTaxes + totalBenefits).toFixed(2));
  const netPay = Number((grossPay - totalDeductions).toFixed(2));
  const takeHomePercentage = grossPay > 0 ? Number(((netPay / grossPay) * 100).toFixed(1)) : 100;

  const periodsPerYear = job.periodsPerYear || 26;
  const annualGross = Number((grossPay * periodsPerYear).toFixed(2));
  const annualNet = Number((netPay * periodsPerYear).toFixed(2));

  return {
    regularHours,
    overtimeHours,
    holidayHours,
    regularPay,
    overtimePay,
    holidayPay,
    grossPay,
    totalTaxes,
    totalBenefits,
    totalDeductions,
    netPay,
    takeHomePercentage,
    deductions,
    annualGross,
    annualNet,
  };
}
