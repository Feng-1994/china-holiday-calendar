export interface SolarHoliday {
  name: string;
  month: number;
  day?: number;
  nthWeek?: number;
  weekday?: number;
  type: 'modern' | 'international';
}

export const FIXED_SOLAR_HOLIDAYS: SolarHoliday[] = [
  { name: '情人节', month: 2, day: 14, type: 'international' },
  { name: '妇女节', month: 3, day: 8, type: 'modern' },
  { name: '植树节', month: 3, day: 12, type: 'modern' },
  { name: '愚人节', month: 4, day: 1, type: 'international' },
  { name: '青年节', month: 5, day: 4, type: 'modern' },
  { name: '护士节', month: 5, day: 12, type: 'modern' },
  { name: '儿童节', month: 6, day: 1, type: 'modern' },
  { name: '建党节', month: 7, day: 1, type: 'modern' },
  { name: '建军节', month: 8, day: 1, type: 'modern' },
  { name: '教师节', month: 9, day: 10, type: 'modern' },
  { name: '万圣节', month: 10, day: 31, type: 'international' },
  { name: '平安夜', month: 12, day: 24, type: 'international' },
  { name: '圣诞节', month: 12, day: 25, type: 'international' },
];

export const DYNAMIC_SOLAR_HOLIDAYS: SolarHoliday[] = [
  { name: '母亲节', month: 5, nthWeek: 2, weekday: 0, type: 'international' },
  { name: '父亲节', month: 6, nthWeek: 3, weekday: 0, type: 'international' },
  { name: '感恩节', month: 11, nthWeek: 4, weekday: 4, type: 'international' },
];

function getNthWeekdayOfMonth(year: number, month: number, nthWeek: number, weekday: number): number {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const firstOccurrence = 1 + ((weekday - firstDay + 7) % 7);
  return firstOccurrence + (nthWeek - 1) * 7;
}

export function getSolarHoliday(year: number, month: number, day: number): SolarHoliday | null {
  const fixed = FIXED_SOLAR_HOLIDAYS.find((h) => h.month === month && h.day === day);
  if (fixed) return fixed;

  for (const h of DYNAMIC_SOLAR_HOLIDAYS) {
    if (h.month === month && h.nthWeek && h.weekday !== undefined) {
      const calculatedDay = getNthWeekdayOfMonth(year, month, h.nthWeek, h.weekday);
      if (calculatedDay === day) return h;
    }
  }

  return null;
}

export function getSolarHolidaysInMonth(year: number, month: number): SolarHoliday[] {
  const result: SolarHoliday[] = [];

  for (const h of FIXED_SOLAR_HOLIDAYS) {
    if (h.month === month) {
      result.push(h);
    }
  }

  for (const h of DYNAMIC_SOLAR_HOLIDAYS) {
    if (h.month === month && h.nthWeek && h.weekday !== undefined) {
      const day = getNthWeekdayOfMonth(year, month, h.nthWeek, h.weekday);
      result.push({ ...h, day });
    }
  }

  return result;
}
