export type DateStatus = 'normal' | 'rest' | 'work' | 'holiday_rest' | 'holiday_work';

export interface HolidayArrangement {
  name: string;
  restDays: string[];
  workDays: string[];
}

export interface YearHolidays {
  year: number;
  holidays: HolidayArrangement[];
}

export const HOLIDAYS_DATA: YearHolidays[] = [
  {
    year: 2025,
    holidays: [
      {
        name: '元旦',
        restDays: generateDateRange(2025, 1, 1, 1),
        workDays: [],
      },
      {
        name: '春节',
        restDays: generateDateRange(2025, 1, 28, 8),
        workDays: [formatDate(2025, 1, 26), formatDate(2025, 2, 8)],
      },
      {
        name: '清明节',
        restDays: generateDateRange(2025, 4, 4, 3),
        workDays: [],
      },
      {
        name: '劳动节',
        restDays: generateDateRange(2025, 5, 1, 5),
        workDays: [formatDate(2025, 4, 27)],
      },
      {
        name: '端午节',
        restDays: generateDateRange(2025, 5, 31, 3),
        workDays: [],
      },
      {
        name: '中秋节·国庆节',
        restDays: generateDateRange(2025, 10, 1, 8),
        workDays: [formatDate(2025, 9, 28), formatDate(2025, 10, 11)],
      },
    ],
  },
  {
    year: 2026,
    holidays: [
      {
        name: '元旦',
        restDays: generateDateRange(2026, 1, 1, 3),
        workDays: [formatDate(2026, 1, 4)],
      },
      {
        name: '春节',
        restDays: generateDateRange(2026, 2, 15, 9),
        workDays: [formatDate(2026, 2, 14), formatDate(2026, 2, 28)],
      },
      {
        name: '清明节',
        restDays: generateDateRange(2026, 4, 4, 3),
        workDays: [],
      },
      {
        name: '劳动节',
        restDays: generateDateRange(2026, 5, 1, 5),
        workDays: [formatDate(2026, 5, 9)],
      },
      {
        name: '端午节',
        restDays: generateDateRange(2026, 6, 19, 3),
        workDays: [],
      },
      {
        name: '中秋节',
        restDays: generateDateRange(2026, 9, 25, 3),
        workDays: [],
      },
      {
        name: '国庆节',
        restDays: generateDateRange(2026, 10, 1, 7),
        workDays: [formatDate(2026, 9, 20), formatDate(2026, 10, 10)],
      },
    ],
  },
];

let onlineData: YearHolidays[] | null = null;

export function setOnlineHolidays(data: YearHolidays[]): void {
  onlineData = data;
}

export function getActiveHolidays(): YearHolidays[] {
  if (onlineData && onlineData.length > 0) {
    const merged = [...onlineData];
    for (const localYear of HOLIDAYS_DATA) {
      if (!merged.some((y) => y.year === localYear.year)) {
        merged.push(localYear);
      }
    }
    return merged;
  }
  return HOLIDAYS_DATA;
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generateDateRange(year: number, startMonth: number, startDay: number, count: number): string[] {
  const dates: string[] = [];
  const start = new Date(year, startMonth - 1, startDay);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(formatDate(d.getFullYear(), d.getMonth() + 1, d.getDate()));
  }
  return dates;
}

interface DayInfo {
  status: DateStatus;
  holidayName?: string;
}

export function getDayInfo(year: number, month: number, day: number): DayInfo {
  const dateStr = formatDate(year, month, day);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const activeData = getActiveHolidays();

  for (const yearData of activeData) {
    if (yearData.year !== year) continue;
    for (const holiday of yearData.holidays) {
      if (holiday.restDays.includes(dateStr)) {
        return { status: 'holiday_rest', holidayName: holiday.name };
      }
      if (holiday.workDays.includes(dateStr)) {
        return { status: 'holiday_work', holidayName: holiday.name };
      }
    }
  }

  if (isWeekend) {
    return { status: 'rest' };
  }

  return { status: 'normal' };
}

export function getMonthHolidays(year: number, month: number): HolidayArrangement[] {
  const activeData = getActiveHolidays();
  const yearData = activeData.find((d) => d.year === year);
  if (!yearData) return [];

  const monthStr = `-${String(month).padStart(2, '0')}-`;
  return yearData.holidays
    .filter((h) => {
      const hasRestInMonth = h.restDays.some((d) => d.includes(monthStr));
      const hasWorkInMonth = h.workDays.some((d) => d.includes(monthStr));
      return hasRestInMonth || hasWorkInMonth;
    })
    .map((h) => ({
      ...h,
      restDays: h.restDays.filter((d) => d.includes(monthStr)),
      workDays: h.workDays.filter((d) => d.includes(monthStr)),
    }));
}

export interface UpcomingHoliday {
  name: string;
  restDays: string[];
  workDays: string[];
  daysUntil: number;
}

export function getNextHoliday(fromDate: Date = new Date()): UpcomingHoliday | null {
  const fromStr = formatDate(fromDate.getFullYear(), fromDate.getMonth() + 1, fromDate.getDate());

  let closest: UpcomingHoliday | null = null;

  const activeData = getActiveHolidays();

  for (const yearData of activeData) {
    for (const holiday of yearData.holidays) {
      const firstRestDay = holiday.restDays[0];
      if (!firstRestDay) continue;

      if (firstRestDay >= fromStr) {
        const holidayStart = new Date(firstRestDay);
        const diffMs = holidayStart.getTime() - fromDate.getTime();
        const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (daysUntil >= 0 && (!closest || daysUntil < closest.daysUntil)) {
          closest = {
            name: holiday.name,
            restDays: holiday.restDays,
            workDays: holiday.workDays,
            daysUntil,
          };
        }
      }
    }
  }

  return closest;
}

export function getYearHolidays(year: number): HolidayArrangement[] {
  const activeData = getActiveHolidays();
  const yearData = activeData.find((d) => d.year === year);
  return yearData ? yearData.holidays : [];
}

export interface YearStats {
  totalDays: number;
  normalWorkdays: number;
  weekendDays: number;
  holidayRestDays: number;
  holidayWorkDays: number;
  actualRestDays: number;
  actualWorkdays: number;
}

export function getYearStats(year: number): YearStats {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  let normalWorkdays = 0;
  let weekendDays = 0;
  let holidayRestDays = 0;
  let holidayWorkDays = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const info = getDayInfo(d.getFullYear(), d.getMonth() + 1, d.getDate());
    switch (info.status) {
      case 'normal':
        normalWorkdays++;
        break;
      case 'rest':
        weekendDays++;
        break;
      case 'holiday_rest':
        holidayRestDays++;
        break;
      case 'holiday_work':
        holidayWorkDays++;
        break;
    }
  }

  return {
    totalDays,
    normalWorkdays,
    weekendDays,
    holidayRestDays,
    holidayWorkDays,
    actualRestDays: weekendDays + holidayRestDays,
    actualWorkdays: normalWorkdays + holidayWorkDays,
  };
}

export const MONTH_NAMES = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

export const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];
