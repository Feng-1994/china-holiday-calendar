interface LunarInfo {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
  lunarMonthName: string;
  lunarDayName: string;
  solarTerm: string | null;
  zodiac: string;
}

const LUNAR_MONTH_NAMES = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const LUNAR_DAY_NAMES = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
];
const ZODIAC_NAMES = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

const SOLAR_TERMS: { [key: string]: { month: number; day: number; yearRange: [number, number] } } = {
  小寒: { month: 1, day: 5, yearRange: [2020, 2030] },
  大寒: { month: 1, day: 20, yearRange: [2020, 2030] },
  立春: { month: 2, day: 3, yearRange: [2020, 2030] },
  雨水: { month: 2, day: 18, yearRange: [2020, 2030] },
  惊蛰: { month: 3, day: 5, yearRange: [2020, 2030] },
  春分: { month: 3, day: 20, yearRange: [2020, 2030] },
  清明: { month: 4, day: 4, yearRange: [2020, 2030] },
  谷雨: { month: 4, day: 19, yearRange: [2020, 2030] },
  立夏: { month: 5, day: 5, yearRange: [2020, 2030] },
  小满: { month: 5, day: 20, yearRange: [2020, 2030] },
  芒种: { month: 6, day: 5, yearRange: [2020, 2030] },
  夏至: { month: 6, day: 21, yearRange: [2020, 2030] },
  小暑: { month: 7, day: 6, yearRange: [2020, 2030] },
  大暑: { month: 7, day: 22, yearRange: [2020, 2030] },
  立秋: { month: 8, day: 7, yearRange: [2020, 2030] },
  处暑: { month: 8, day: 22, yearRange: [2020, 2030] },
  白露: { month: 9, day: 7, yearRange: [2020, 2030] },
  秋分: { month: 9, day: 22, yearRange: [2020, 2030] },
  寒露: { month: 10, day: 8, yearRange: [2020, 2030] },
  霜降: { month: 10, day: 23, yearRange: [2020, 2030] },
  立冬: { month: 11, day: 7, yearRange: [2020, 2030] },
  小雪: { month: 11, day: 22, yearRange: [2020, 2030] },
  大雪: { month: 12, day: 7, yearRange: [2020, 2030] },
  冬至: { month: 12, day: 21, yearRange: [2020, 2030] },
};

const LUNAR_INFO_DATA: { [year: number]: { leapMonth: number; months: number[]; baseDate: Date } } = {};

function initLunarData() {
  if (LUNAR_INFO_DATA[2025]) return;

  const lunarBase = new Date(2000, 0, 6, 0, 0, 0);

  LUNAR_INFO_DATA[2025] = {
    leapMonth: 6,
    months: [0, 30, 59, 89, 118, 147, 177, 206, 236, 265, 295, 324, 354, 383, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    baseDate: lunarBase,
  };
}

function solarToLunar(year: number, month: number, day: number): LunarInfo {
  initLunarData();

  const solarDate = new Date(year, month - 1, day);
  const lunarBase = new Date(2000, 0, 6, 0, 0, 0);

  const daysDiff = Math.floor((solarDate.getTime() - lunarBase.getTime()) / (1000 * 60 * 60 * 24));

  let lunarYear = 2000;
  let lunarMonth = 1;
  let lunarDay = 1;
  let isLeapMonth = false;

  const lunarYears = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const leapMonths = [4, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0];
  const monthDays = [
    [30, 30, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30],
    [29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29],
    [30, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30],
    [29, 30, 29, 29, 30, 30, 29, 30, 29, 30, 30, 29],
    [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 29],
    [30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 30],
    [29, 30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30],
    [29, 30, 30, 29, 30, 30, 29, 29, 30, 29, 29, 30],
    [29, 30, 30, 30, 29, 30, 29, 30, 29, 30, 29, 29],
    [30, 29, 30, 30, 29, 30, 30, 29, 30, 29, 30, 29],
    [30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30],
    [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 29, 30],
    [30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 29, 30],
    [30, 29, 30, 30, 29, 29, 30, 29, 29, 30, 29, 30],
    [29, 30, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30],
    [29, 30, 30, 29, 30, 30, 29, 30, 29, 29, 30, 29],
    [30, 29, 30, 29, 30, 30, 29, 30, 30, 29, 29, 30],
    [29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30, 29],
    [30, 29, 29, 30, 29, 30, 29, 30, 30, 29, 30, 30],
    [29, 30, 29, 29, 30, 29, 29, 30, 30, 29, 30, 30],
    [29, 30, 30, 29, 29, 30, 29, 29, 30, 29, 30, 30],
    [29, 30, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30],
    [29, 30, 30, 29, 30, 30, 29, 30, 29, 29, 30, 29],
    [30, 29, 30, 29, 30, 30, 29, 30, 30, 29, 29, 30],
    [29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29],
    [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 29],
    [30, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 29],
    [29, 30, 30, 29, 30, 29, 30, 29, 29, 30, 30, 29],
    [29, 30, 30, 29, 30, 29, 30, 30, 29, 29, 30, 30],
    [29, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30],
    [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30],
  ];

  let days = daysDiff;
  for (let i = 0; i < lunarYears.length; i++) {
    const year = lunarYears[i];
    const leap = leapMonths[i];
    const isLeapYear = leap > 0;
    let yearDays = 0;

    for (let m = 0; m < 12; m++) {
      yearDays += monthDays[i][m];
    }
    if (isLeapYear) {
      yearDays += monthDays[i][leap - 1];
    }

    if (days < yearDays) {
      lunarYear = year;
      const leapM = leap;
      let monthOffset = 0;

      for (let m = 0; m < 12; m++) {
        const daysInMonth = monthDays[i][m];
        if (days < daysInMonth) {
          lunarMonth = m + 1;
          lunarDay = days + 1;
          break;
        }
        days -= daysInMonth;
        monthOffset++;

        if (leapM > 0 && monthOffset === leapM) {
          if (days < monthDays[i][leapM - 1]) {
            lunarMonth = leapM;
            lunarDay = days + 1;
            isLeapMonth = true;
            break;
          }
          days -= monthDays[i][leapM - 1];
          monthOffset++;
        }
      }
      break;
    }
    days -= yearDays;
  }

  let solarTerm: string | null = null;
  for (const [termName, info] of Object.entries(SOLAR_TERMS)) {
    if (year >= info.yearRange[0] && year <= info.yearRange[1]) {
      if (info.month === month && info.day === day) {
        solarTerm = termName;
        break;
      }
    }
  }

  const zodiacIndex = (lunarYear - 2000 + 2) % 12;

  return {
    lunarYear,
    lunarMonth,
    lunarDay,
    isLeapMonth,
    lunarMonthName: LUNAR_MONTH_NAMES[lunarMonth - 1],
    lunarDayName: LUNAR_DAY_NAMES[lunarDay - 1],
    solarTerm,
    zodiac: ZODIAC_NAMES[zodiacIndex],
  };
}

export function getLunarInfo(year: number, month: number, day: number): LunarInfo {
  return solarToLunar(year, month, day);
}

export function formatLunarMonth(isLeap: boolean, monthName: string): string {
  if (isLeap) {
    return `闰${monthName}`;
  }
  return monthName;
}

export { SOLAR_TERMS };
