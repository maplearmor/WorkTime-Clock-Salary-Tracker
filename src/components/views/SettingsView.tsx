import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CountryCode, WageType, PayFrequency } from '../../types';
import { exportTimesheetCSV, exportAuditJSON } from '../../services/exportService';
import { SUPPORTED_LANGUAGES } from '../../services/i18n';

export const SettingsView: React.FC = () => {
  const { activeJob, updateJob, jobTimeEntries, auditRecords, showToast, resetToDemoData, language, setLanguage, t } = useApp();

  const [country, setCountry] = useState<CountryCode>(activeJob.country);
  const [province, setProvince] = useState(activeJob.province);
  const [city, setCity] = useState(activeJob.city);
  const [taxYear, setTaxYear] = useState(activeJob.taxYear);
  const [companyEntity, setCompanyEntity] = useState(activeJob.companyEntity);
  const [position, setPosition] = useState(activeJob.position);
  const [wageType, setWageType] = useState<WageType>(activeJob.wageType);
  const [hourlyRate, setHourlyRate] = useState(activeJob.hourlyRate);
  const [annualSalary, setAnnualSalary] = useState(activeJob.annualSalary);
  const [payFrequency, setPayFrequency] = useState<PayFrequency>(activeJob.payFrequency);
  const [autoDeductBreak, setAutoDeductBreak] = useState(activeJob.autoDeductUnpaidBreak);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // When country changes, update default province and currency
  const handleCountryChange = (c: CountryCode) => {
    setCountry(c);
    if (c === 'ca') {
      setProvince('QC');
      setCity('Montreal');
    } else if (c === 'us') {
      setProvince('NY');
      setCity('New York');
    } else if (c === 'cn') {
      setProvince('SN');
      setCity("Xi'an");
    } else if (c === 'uk') {
      setProvince('ENG');
      setCity('London');
    } else {
      setProvince('BY');
      setCity('Munich');
    }
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const countryNames: Record<CountryCode, string> = {
        ca: 'Canada',
        us: 'United States',
        cn: 'China',
        uk: 'United Kingdom',
        de: 'Germany',
      };

      const currencies: Record<CountryCode, { cur: string; sym: string }> = {
        ca: { cur: 'CAD', sym: '$' },
        us: { cur: 'USD', sym: '$' },
        cn: { cur: 'CNY', sym: '¥' },
        uk: { cur: 'GBP', sym: '£' },
        de: { cur: 'EUR', sym: '€' },
      };

      const provinceNames: Record<string, string> = {
        QC: 'Quebec',
        ON: 'Ontario',
        BC: 'British Columbia',
        AB: 'Alberta',
        NY: 'New York',
        CA: 'California',
        TX: 'Texas',
        SN: 'Shaanxi',
        ENG: 'England',
        BY: 'Bavaria',
      };

      const periodsMap: Record<PayFrequency, number> = {
        weekly: 52,
        biweekly: 26,
        'semi-monthly': 24,
        monthly: 12,
      };

      const computedHourly = wageType === 'hourly' ? Number(hourlyRate) : Number((annualSalary / (periodsMap[payFrequency] * 40)).toFixed(2));

      updateJob({
        ...activeJob,
        companyName: companyEntity,
        companyEntity,
        position,
        country,
        countryName: countryNames[country] || 'Canada',
        province,
        provinceName: provinceNames[province] || province,
        city,
        taxYear,
        wageType,
        hourlyRate: computedHourly,
        annualSalary: Number(annualSalary),
        payFrequency,
        periodsPerYear: periodsMap[payFrequency],
        currency: currencies[country].cur,
        currencySymbol: currencies[country].sym,
        autoDeductUnpaidBreak: autoDeductBreak,
      });

      setSaving(false);
      setSavedSuccess(true);
      showToast('Location, tax rules & job settings saved and synced.');
      setTimeout(() => setSavedSuccess(false), 2500);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full px-3.5 sm:px-4 pb-24 gap-3.5 pt-2">
      {/* Compliance & Tax Engine Hero Banner */}
      <div className="relative overflow-hidden rounded-xl bg-[#eff4ff] p-3.5 shadow-sm border border-slate-200/50">
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-[#006c4a] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">assured_workload</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-semibold text-sm text-[#0b1c30]">
                {t('complianceTitle')}
              </span>
              <span className="px-2 py-0.2 rounded-full bg-[#82f5c1] text-[#00714e] text-[9px] uppercase font-bold tracking-wider">
                {t('activeBadge')}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-snug">
              {province} ({country.toUpperCase()}) {t('complianceSubtitle')} {taxYear}.
            </p>
          </div>
        </div>
      </div>

      {/* Language & Regional Preferences Section */}
      <section className="rounded-xl bg-white p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-[18px]">translate</span>
            <h2 className="font-display font-semibold text-sm text-[#0b1c30]">
              {t('languageSettingsTitle')}
            </h2>
          </div>
          <span className="font-mono text-[11px] text-[#006c4a] bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200 uppercase">
            {language}
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-snug">
          {t('languageSettingsSubtitle')}
        </p>

        {/* Interactive Language Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  showToast(t('languageSavedToast'));
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#006c4a] bg-emerald-50/70 text-[#006c4a] ring-1 ring-[#006c4a] shadow-sm'
                    : 'border-slate-200 bg-[#eff4ff]/60 hover:bg-[#eff4ff] text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl leading-none flex-shrink-0" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold truncate">
                        {lang.nativeName}
                      </span>
                      {lang.nativeName !== lang.name && (
                        <span className="text-[10px] text-slate-400 font-medium truncate">
                          ({lang.name})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {lang.region}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 pl-2">
                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-[#006c4a] text-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-transparent">
                      <span className="material-symbols-outlined text-[12px]">check</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 1: Jurisdiction & Currency */}
      <section className="rounded-xl bg-white p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-[18px]">public</span>
            <h2 className="font-display font-semibold text-sm text-[#0b1c30]">Jurisdiction &amp; Currency</h2>
          </div>
          <span className="font-mono text-[11px] text-slate-500 bg-[#eff4ff] px-2 py-0.5 rounded font-medium">
            {province}-{country.toUpperCase()}-{taxYear}
          </span>
        </div>

        {/* Country Select */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-600" htmlFor="country-select">
            Tax Jurisdiction (Country)
          </label>
          <div className="relative">
            <select
              id="country-select"
              value={country}
              onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
              className="w-full h-11 bg-[#eff4ff] text-[#0b1c30] text-xs font-medium rounded-lg px-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
            >
              <option value="ca">Canada (CA) 🇨🇦</option>
              <option value="us">United States (US) 🇺🇸</option>
              <option value="cn">China (CN) 🇨🇳</option>
              <option value="uk">United Kingdom (UK) 🇬🇧</option>
              <option value="de">Germany (DE) 🇩🇪</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
              unfold_more
            </span>
          </div>
        </div>

        {/* Province & City 2-column */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600" htmlFor="province-select">
              Province / State
            </label>
            <div className="relative">
              <select
                id="province-select"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full h-11 bg-[#eff4ff] text-[#0b1c30] text-xs font-medium rounded-lg px-2.5 pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
              >
                {country === 'ca' ? (
                  <>
                    <option value="QC">Quebec (QC)</option>
                    <option value="ON">Ontario (ON)</option>
                    <option value="BC">British Columbia (BC)</option>
                    <option value="AB">Alberta (AB)</option>
                  </>
                ) : country === 'us' ? (
                  <>
                    <option value="NY">New York (NY)</option>
                    <option value="CA">California (CA)</option>
                    <option value="TX">Texas (TX)</option>
                  </>
                ) : country === 'cn' ? (
                  <>
                    <option value="SN">Shaanxi (SN)</option>
                    <option value="BJ">Beijing (BJ)</option>
                    <option value="SH">Shanghai (SH)</option>
                  </>
                ) : (
                  <>
                    <option value="ENG">England</option>
                    <option value="BY">Bavaria</option>
                  </>
                )}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[16px]">
                expand_more
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600" htmlFor="city-input">
              Municipal City
            </label>
            <input
              id="city-input"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-11 bg-[#eff4ff] text-[#0b1c30] text-xs font-medium rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
            />
          </div>
        </div>

        {/* Tax Year Selector Pills */}
        <div className="space-y-1.5">
          <span className="block text-xs font-semibold text-slate-600">Fiscal Year Calculation Matrix</span>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#eff4ff] rounded-lg">
            {['2024', '2025', '2026', '2027'].map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setTaxYear(year)}
                className={`h-8 rounded-md font-mono text-xs font-semibold flex items-center justify-center transition-all ${
                  taxYear === year
                    ? 'bg-white text-[#006c4a] shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Job Profile & Wage Settings */}
      <section className="rounded-xl bg-white p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-3">
        <div className="flex items-center gap-2 pb-0.5">
          <span className="material-symbols-outlined text-[#006c4a] text-[18px]">badge</span>
          <h2 className="font-display font-semibold text-sm text-[#0b1c30]">Job Profile &amp; Compensation</h2>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600" htmlFor="company-input">
              Company Entity
            </label>
            <input
              id="company-input"
              type="text"
              value={companyEntity}
              onChange={(e) => setCompanyEntity(e.target.value)}
              className="w-full h-11 bg-[#eff4ff] text-[#0b1c30] text-xs font-medium rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600" htmlFor="position-input">
              Role / Position
            </label>
            <input
              id="position-input"
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full h-11 bg-[#eff4ff] text-[#0b1c30] text-xs font-medium rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
            />
          </div>
        </div>

        {/* Wage Type Segmented Control */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600">Wage Structure</span>
            <span className="font-mono text-[#006c4a] font-semibold">
              {wageType === 'hourly'
                ? `${activeJob.currencySymbol}${Number(hourlyRate).toFixed(2)} / hr`
                : `${activeJob.currencySymbol}${Number(annualSalary).toLocaleString()} / yr`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#eff4ff] rounded-lg">
            <button
              type="button"
              onClick={() => setWageType('hourly')}
              className={`h-9 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                wageType === 'hourly'
                  ? 'bg-white text-[#0b1c30] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#006c4a]">hourglass_top</span>
              <span>Hourly</span>
            </button>
            <button
              type="button"
              onClick={() => setWageType('salary')}
              className={`h-9 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                wageType === 'salary'
                  ? 'bg-white text-[#0b1c30] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-blue-600">account_balance_wallet</span>
              <span>Annual Salary</span>
            </button>
          </div>
        </div>

        {/* Rate Input */}
        {wageType === 'hourly' ? (
          <div className="p-2.5 bg-[#eff4ff] rounded-lg space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-semibold text-slate-600">Base Hourly Rate</span>
              <span className="text-[#006c4a] font-bold">Standard shift rate</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-500">
                {activeJob.currencySymbol}
              </span>
              <input
                type="number"
                step="0.25"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                className="w-full h-11 bg-white text-[#0b1c30] font-mono text-sm font-semibold pl-7 pr-16 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006c4a] shadow-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                {activeJob.currency} / hr
              </span>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-[#eff4ff] rounded-lg space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-semibold text-slate-600">Annual Gross Base</span>
              <span className="text-[#006c4a] font-bold">Pre-tax salary</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-500">
                {activeJob.currencySymbol}
              </span>
              <input
                type="number"
                step="1000"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(parseFloat(e.target.value) || 0)}
                className="w-full h-11 bg-white text-[#0b1c30] font-mono text-sm font-semibold pl-7 pr-16 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006c4a] shadow-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                {activeJob.currency} / yr
              </span>
            </div>
          </div>
        )}

        {/* Pay Frequency */}
        <div className="space-y-1.5">
          <span className="block text-xs font-semibold text-slate-600">Pay Period Cadence</span>
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#eff4ff] rounded-lg">
            {(['weekly', 'biweekly', 'semi-monthly', 'monthly'] as PayFrequency[]).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setPayFrequency(freq)}
                className={`h-8 rounded-md text-[11px] font-semibold capitalize transition-all ${
                  payFrequency === freq
                    ? 'bg-white text-[#006c4a] shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {freq === 'semi-monthly' ? 'Semi-Mo' : freq}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Overtime & Break Policies */}
      <section className="rounded-xl bg-white p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-[18px]">timelapse</span>
            <h2 className="font-display font-semibold text-sm text-[#0b1c30]">Overtime &amp; Break Policies</h2>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">{activeJob.province} Rules</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 bg-[#eff4ff] rounded-lg space-y-0.5">
            <span className="text-[11px] text-slate-500 block">Daily Threshold</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-lg font-bold text-[#0b1c30]">8.0</span>
              <span className="text-[11px] text-slate-500">hrs / day</span>
            </div>
            <p className="text-[10px] text-[#006c4a] font-semibold">Standard shift limit</p>
          </div>

          <div className="p-2.5 bg-[#eff4ff] rounded-lg space-y-0.5">
            <span className="text-[11px] text-slate-500 block">Weekly Threshold</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-lg font-bold text-[#0b1c30]">40.0</span>
              <span className="text-[11px] text-slate-500">hrs / week</span>
            </div>
            <p className="text-[10px] text-[#006c4a] font-semibold">Statutory overtime rate</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-2 bg-[#eff4ff] rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#006c4a]">trending_up</span>
              <span className="text-slate-800">Standard Overtime Multiplier</span>
            </div>
            <span className="font-mono font-bold bg-white px-2 py-0.5 rounded text-[#0b1c30]">
              {activeJob.overtimeMultiplier}×
            </span>
          </div>

          <div className="flex items-center justify-between p-2 bg-[#eff4ff] rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">celebration</span>
              <span className="text-slate-800">Statutory Holiday Multiplier</span>
            </div>
            <span className="font-mono font-bold bg-white px-2 py-0.5 rounded text-[#0b1c30]">
              {activeJob.holidayMultiplier}×
            </span>
          </div>
        </div>

        {/* Auto Deduct Unpaid Break */}
        <div className="p-2.5 bg-[#eff4ff] rounded-lg flex items-center justify-between gap-2">
          <div className="space-y-0.5 min-w-0 pr-2">
            <span className="text-xs font-semibold text-[#0b1c30] block">
              Unpaid Break Auto-Deduction
            </span>
            <p className="text-[11px] text-slate-500">
              Auto-deduct 30 mins when continuous shift exceeds 5.0 hours
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAutoDeductBreak(!autoDeductBreak)}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 flex-shrink-0 ${
              autoDeductBreak ? 'bg-[#006c4a]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                autoDeductBreak ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Section 4: Data Governance & Export Options */}
      <section className="rounded-xl bg-white p-3.5 shadow-sm border border-slate-200/60 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-[18px]">security</span>
            <h2 className="font-display font-semibold text-sm text-[#0b1c30]">Data Governance &amp; Export</h2>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#006c4a] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a] animate-pulse" />
            <span>Local Persistent</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => exportTimesheetCSV(activeJob, jobTimeEntries)}
            className="min-h-[42px] px-3 py-2 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-[#006c4a]">table_view</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportAuditJSON(activeJob, auditRecords)}
            className="min-h-[42px] px-3 py-2 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-600">data_object</span>
            <span>Audit JSON</span>
          </button>
        </div>

        {/* Primary Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full min-h-[46px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
            savedSuccess
              ? 'bg-[#006c4a] text-white'
              : 'bg-[#131b2e] hover:bg-black text-white'
          }`}
          type="button"
        >
          {saving ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
              <span>Saving Configuration...</span>
            </>
          ) : savedSuccess ? (
            <>
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Saved &amp; Synchronized!</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Location &amp; Tax Rules</span>
            </>
          )}
        </button>

        {/* Reset Demo Data Action */}
        <div className="pt-2 border-t border-slate-100 flex justify-center">
          <button
            onClick={resetToDemoData}
            className="text-xs text-slate-500 hover:text-red-700 flex items-center gap-1.5 transition-colors p-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset All Applet Data to Demo Defaults</span>
          </button>
        </div>
      </section>
    </div>
  );
};
