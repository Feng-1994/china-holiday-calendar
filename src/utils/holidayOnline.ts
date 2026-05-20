import type { YearHolidays, HolidayArrangement } from './holidayData';

const CDN_BASE = 'https://unpkg.com/holiday-calendar/data/CN';
const CACHE_KEY = 'holiday-online-data';
const CACHE_TIMESTAMP_KEY = 'holiday-online-timestamp';
const CACHE_VERSION_KEY = 'holiday-online-version';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

interface OnlineDateEntry {
  date: string;
  name: string;
  name_cn: string;
  type: 'public_holiday' | 'transfer_workday';
}

interface OnlineYearData {
  year: number;
  region: string;
  dates: OnlineDateEntry[];
}

function getCacheVersion(): string {
  const currentYear = new Date().getFullYear();
  return `${currentYear}`;
}

function isCacheValid(): boolean {
  const version = localStorage.getItem(CACHE_VERSION_KEY);
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!version || !timestamp) return false;
  if (version !== getCacheVersion()) return false;
  return Date.now() - parseInt(timestamp) < CACHE_DURATION;
}

function getCachedData(): YearHolidays[] | null {
  if (!isCacheValid()) return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setCacheData(data: YearHolidays[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
    localStorage.setItem(CACHE_VERSION_KEY, getCacheVersion());
  } catch (e) {
    console.error('Failed to cache holiday data:', e);
  }
}

function transformOnlineData(onlineData: OnlineYearData): YearHolidays {
  const holidayMap = new Map<string, { restDays: string[]; workDays: string[] }>();

  for (const entry of onlineData.dates) {
    let holidayName = entry.name_cn || entry.name;

    if (entry.type === 'transfer_workday') {
      holidayName = holidayName.replace(/补班$/, '');
      if (holidayName === '') holidayName = '调休';
    } else {
      holidayName = holidayName.replace(/[、，].*/, '');
    }

    if (!holidayMap.has(holidayName)) {
      holidayMap.set(holidayName, { restDays: [], workDays: [] });
    }

    const group = holidayMap.get(holidayName)!;
    if (entry.type === 'public_holiday') {
      if (!group.restDays.includes(entry.date)) {
        group.restDays.push(entry.date);
      }
    } else if (entry.type === 'transfer_workday') {
      if (!group.workDays.includes(entry.date)) {
        group.workDays.push(entry.date);
      }
    }
  }

  const holidays: HolidayArrangement[] = [];
  for (const [name, days] of holidayMap) {
    days.restDays.sort();
    days.workDays.sort();
    if (days.restDays.length > 0 || days.workDays.length > 0) {
      holidays.push({ name, ...days });
    }
  }

  return {
    year: onlineData.year,
    holidays,
  };
}

export async function fetchOnlineHolidays(years?: number[]): Promise<{
  data: YearHolidays[];
  success: boolean;
  error?: string;
}> {
  const currentYear = new Date().getFullYear();
  const targetYears = years || [currentYear, currentYear + 1];

  try {
    const settled = await Promise.allSettled(
      targetYears.map(async (year) => {
        const url = `${CDN_BASE}/${year}.json`;
        const response = await fetch(url, {
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for year ${year}`);
        }
        const data: OnlineYearData = await response.json();
        return transformOnlineData(data);
      }),
    );

    const results = settled
      .filter((r): r is PromiseFulfilledResult<YearHolidays> => r.status === 'fulfilled')
      .map((r) => r.value);

    if (results.length === 0) {
      const errors = settled
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map((r) => r.reason instanceof Error ? r.reason.message : '未知错误');
      return { data: [], success: false, error: errors.join('; ') };
    }

    setCacheData(results);
    return { data: results, success: true };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : '未知错误';
    console.error('Failed to fetch online holidays:', errMsg);
    return { data: [], success: false, error: errMsg };
  }
}

export function getOnlineHolidays(): YearHolidays[] | null {
  return getCachedData();
}

export function shouldCheckUpdate(): boolean {
  return !isCacheValid();
}

export function getLastUpdateTime(): string | null {
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!timestamp) return null;
  return new Date(parseInt(timestamp)).toLocaleString('zh-CN');
}
