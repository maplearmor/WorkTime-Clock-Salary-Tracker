import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CountryCode, Job } from '../../types';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({ isOpen, onClose }) => {
  const { addJob } = useApp();

  const [companyName, setCompanyName] = useState('');
  const [shortName, setShortName] = useState('');
  const [position, setPosition] = useState('');
  const [country, setCountry] = useState<CountryCode>('ca');
  const [province, setProvince] = useState('QC');
  const [city, setCity] = useState('Montreal');
  const [hourlyRate, setHourlyRate] = useState(30.0);
  const [color, setColor] = useState('#006c4a');

  if (!isOpen) return null;

  const handleCountryChange = (c: CountryCode) => {
    setCountry(c);
    if (c === 'ca') {
      setProvince('QC');
      setCity('Montreal');
      setColor('#006c4a');
    } else if (c === 'us') {
      setProvince('NY');
      setCity('New York');
      setColor('#2563eb');
    } else if (c === 'cn') {
      setProvince('SN');
      setCity("Xi'an");
      setColor('#d97706');
    } else if (c === 'uk') {
      setProvince('ENG');
      setCity('London');
      setColor('#7c3aed');
    } else {
      setProvince('BY');
      setCity('Munich');
      setColor('#0284c7');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    const newJob: Job = {
      id: `job_${Date.now()}`,
      companyName: companyName || 'New Company',
      companyEntity: companyName || 'New Company',
      shortName: shortName || companyName.slice(0, 12),
      position: position || 'Contractor',
      country,
      countryName: countryNames[country] || 'Canada',
      province,
      provinceName: provinceNames[province] || province,
      city: city || 'Montreal',
      currency: currencies[country].cur,
      currencySymbol: currencies[country].sym,
      hourlyRate: Number(hourlyRate),
      wageType: 'hourly',
      annualSalary: Number(hourlyRate) * 2080,
      payFrequency: 'biweekly',
      periodsPerYear: 26,
      standardDailyHours: 8.0,
      standardWeeklyHours: 40.0,
      overtimeMultiplier: 1.5,
      holidayMultiplier: 2.0,
      autoDeductUnpaidBreak: true,
      taxYear: '2026',
      color,
      accentBg: '#dbeafe',
    };

    addJob(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-entrance">
      <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-2xl border border-slate-200 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-[20px]">badge</span>
            <h3 className="font-display font-bold text-sm text-[#0b1c30]">Add New Job Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. ABC Manufacturing"
              className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#006c4a]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Short Name</label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. ABC Mfg"
                className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#006c4a]"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Position / Role</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Production Eng"
                className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#006c4a]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
                className="w-full h-10 px-2 bg-[#eff4ff] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#006c4a]"
              >
                <option value="ca">Canada 🇨🇦</option>
                <option value="us">United States 🇺🇸</option>
                <option value="cn">China 🇨🇳</option>
                <option value="uk">United Kingdom 🇬🇧</option>
                <option value="de">Germany 🇩🇪</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">State / Province</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="e.g. QC, NY, SN"
                className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#006c4a]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Montreal, Xi'an"
                className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#006c4a]"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Hourly Rate</label>
              <input
                type="number"
                step="0.5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 bg-[#eff4ff] rounded-lg text-[#0b1c30] font-mono focus:ring-1 focus:ring-[#006c4a]"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-lg bg-[#006c4a] hover:bg-[#005137] text-white font-semibold shadow-sm"
            >
              Create Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
