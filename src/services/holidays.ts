import { CountryCode, HolidayItem } from '../types';

export const INITIAL_HOLIDAYS: HolidayItem[] = [
  // Canada (QC CNESST)
  {
    id: 'hol_ca_qc_1',
    country: 'ca',
    province: 'QC',
    month: 'JAN',
    day: 1,
    dateString: '2026-01-01',
    name: "New Year's Day (Jour de l'An)",
    typeLabel: 'Federal & Provincial Statutory',
    multiplier: 2.0,
  },
  {
    id: 'hol_ca_qc_2',
    country: 'ca',
    province: 'QC',
    month: 'APR',
    day: 3,
    dateString: '2026-04-03',
    name: 'Good Friday (Vendredi saint)',
    typeLabel: 'Statutory Holiday',
    multiplier: 2.0,
  },
  {
    id: 'hol_ca_qc_3',
    country: 'ca',
    province: 'QC',
    month: 'MAY',
    day: 18,
    dateString: '2026-05-18',
    name: 'National Patriots Day (Journée des patriotes)',
    typeLabel: 'Provincial Statutory Holiday',
    multiplier: 2.0,
  },
  {
    id: 'hol_ca_qc_4',
    country: 'ca',
    province: 'QC',
    month: 'JUN',
    day: 24,
    dateString: '2026-06-24',
    name: 'St. Jean Baptiste Day',
    typeLabel: 'National Holiday (Fête nationale)',
    multiplier: 2.0,
  },
  {
    id: 'hol_ca_qc_5',
    country: 'ca',
    province: 'QC',
    month: 'JUL',
    day: 1,
    dateString: '2026-07-01',
    name: 'Canada Day',
    typeLabel: 'Federal & Provincial Stat',
    multiplier: 2.0,
  },
  {
    id: 'hol_ca_qc_6',
    country: 'ca',
    province: 'QC',
    month: 'SEP',
    day: 7,
    dateString: '2026-09-07',
    name: 'Labour Day',
    typeLabel: 'Statutory Holiday',
    multiplier: 2.0,
  },
  {
    id: 'hol_ca_qc_7',
    country: 'ca',
    province: 'QC',
    month: 'OCT',
    day: 12,
    dateString: '2026-10-12',
    name: 'Thanksgiving Day',
    typeLabel: 'Statutory Holiday',
    multiplier: 2.0,
  },
  {
    id: 'hol_ca_qc_8',
    country: 'ca',
    province: 'QC',
    month: 'DEC',
    day: 25,
    dateString: '2026-12-25',
    name: 'Christmas Day (Noël)',
    typeLabel: 'Statutory Holiday',
    multiplier: 2.0,
  },

  // US Holidays
  {
    id: 'hol_us_1',
    country: 'us',
    month: 'JAN',
    day: 1,
    dateString: '2026-01-01',
    name: "New Year's Day",
    typeLabel: 'Federal Holiday',
    multiplier: 2.0,
  },
  {
    id: 'hol_us_2',
    country: 'us',
    month: 'JUL',
    day: 4,
    dateString: '2026-07-04',
    name: 'Independence Day',
    typeLabel: 'Federal Holiday',
    multiplier: 2.0,
  },
  {
    id: 'hol_us_3',
    country: 'us',
    month: 'NOV',
    day: 26,
    dateString: '2026-11-26',
    name: 'Thanksgiving Day',
    typeLabel: 'Federal Holiday',
    multiplier: 2.0,
  },

  // China Holidays
  {
    id: 'hol_cn_1',
    country: 'cn',
    month: 'FEB',
    day: 17,
    dateString: '2026-02-17',
    name: 'Spring Festival (Chinese New Year)',
    typeLabel: 'National Statutory Holiday',
    multiplier: 3.0,
  },
  {
    id: 'hol_cn_2',
    country: 'cn',
    month: 'OCT',
    day: 1,
    dateString: '2026-10-01',
    name: 'National Day (Guoqing)',
    typeLabel: 'Golden Week Holiday',
    multiplier: 3.0,
  },
];

export function getHolidaysForJob(country: CountryCode, province?: string, customHolidays: HolidayItem[] = []): HolidayItem[] {
  const defaults = INITIAL_HOLIDAYS.filter((h) => {
    if (h.country !== country) return false;
    if (h.province && province && h.province !== province) return false;
    return true;
  });

  const matchingCustom = customHolidays.filter((h) => h.country === country);
  return [...defaults, ...matchingCustom];
}
