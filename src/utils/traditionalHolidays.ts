export interface TraditionalHoliday {
  name: string;
  lunarMonth: number;
  lunarDay: number;
  type: 'festival' | 'solar-term';
}

export const TRADITIONAL_HOLIDAYS: { year: number; holidays: TraditionalHoliday[] }[] = [
  {
    year: 2025,
    holidays: [
      { name: '腊八节', lunarMonth: 12, lunarDay: 8, type: 'festival' },
      { name: '小年', lunarMonth: 12, lunarDay: 23, type: 'festival' },
      { name: '除夕', lunarMonth: 12, lunarDay: 30, type: 'festival' },
      { name: '春节', lunarMonth: 1, lunarDay: 1, type: 'festival' },
      { name: '元宵节', lunarMonth: 1, lunarDay: 15, type: 'festival' },
      { name: '龙抬头', lunarMonth: 2, lunarDay: 2, type: 'festival' },
      { name: '上巳节', lunarMonth: 3, lunarDay: 3, type: 'festival' },
      { name: '端午节', lunarMonth: 5, lunarDay: 5, type: 'festival' },
      { name: '七夕节', lunarMonth: 7, lunarDay: 7, type: 'festival' },
      { name: '中元节', lunarMonth: 7, lunarDay: 15, type: 'festival' },
      { name: '中秋节', lunarMonth: 8, lunarDay: 15, type: 'festival' },
      { name: '重阳节', lunarMonth: 9, lunarDay: 9, type: 'festival' },
      { name: '寒衣节', lunarMonth: 10, lunarDay: 1, type: 'festival' },
      { name: '下元节', lunarMonth: 10, lunarDay: 15, type: 'festival' },
    ],
  },
  {
    year: 2026,
    holidays: [
      { name: '腊八节', lunarMonth: 12, lunarDay: 8, type: 'festival' },
      { name: '小年', lunarMonth: 12, lunarDay: 23, type: 'festival' },
      { name: '除夕', lunarMonth: 12, lunarDay: 29, type: 'festival' },
      { name: '春节', lunarMonth: 1, lunarDay: 1, type: 'festival' },
      { name: '元宵节', lunarMonth: 1, lunarDay: 15, type: 'festival' },
      { name: '龙抬头', lunarMonth: 2, lunarDay: 2, type: 'festival' },
      { name: '上巳节', lunarMonth: 3, lunarDay: 3, type: 'festival' },
      { name: '端午节', lunarMonth: 5, lunarDay: 5, type: 'festival' },
      { name: '七夕节', lunarMonth: 7, lunarDay: 7, type: 'festival' },
      { name: '中元节', lunarMonth: 7, lunarDay: 15, type: 'festival' },
      { name: '中秋节', lunarMonth: 8, lunarDay: 15, type: 'festival' },
      { name: '重阳节', lunarMonth: 9, lunarDay: 9, type: 'festival' },
      { name: '寒衣节', lunarMonth: 10, lunarDay: 1, type: 'festival' },
      { name: '下元节', lunarMonth: 10, lunarDay: 15, type: 'festival' },
    ],
  },
];

export function getTraditionalHolidayName(
  year: number,
  lunarMonth: number,
  lunarDay: number,
): TraditionalHoliday | null {
  const yearData = TRADITIONAL_HOLIDAYS.find((h) => h.year === year);
  if (!yearData) return null;

  return yearData.holidays.find(
    (h) => h.lunarMonth === lunarMonth && h.lunarDay === lunarDay,
  ) || null;
}

export function getAllTraditionalHolidaysInMonth(
  year: number,
  month: number,
): TraditionalHoliday[] {
  const yearData = TRADITIONAL_HOLIDAYS.find((h) => h.year === year);
  if (!yearData) return [];

  return yearData.holidays.filter((h) => {
    return isLunarDateInMonth(year, month, h.lunarMonth);
  });
}

function isLunarDateInMonth(
  year: number,
  month: number,
  lunarMonth: number,
): boolean {
  const lunarEnd = new Date(year, month, 0);

  const lunarOfMonthStart = getLunarMonth(year, month, 1);
  const lunarOfMonthEnd = getLunarMonth(year, month, lunarEnd.getDate());

  return lunarMonth >= lunarOfMonthStart && lunarMonth <= lunarOfMonthEnd;
}

function getLunarMonth(year: number, month: number, day: number): number {
  const lunarDates: { [key: string]: { month: number; day: number } } = {
    '2025-1-1': { month: 12, day: 1 },
    '2025-1-31': { month: 12, day: 29 },
    '2025-2-1': { month: 1, day: 1 },
    '2025-2-28': { month: 1, day: 30 },
    '2025-3-1': { month: 2, day: 1 },
    '2025-3-30': { month: 2, day: 29 },
    '2025-3-31': { month: 3, day: 1 },
    '2025-4-29': { month: 3, day: 30 },
    '2025-4-30': { month: 4, day: 1 },
    '2025-5-29': { month: 4, day: 30 },
    '2025-5-30': { month: 5, day: 1 },
    '2025-6-28': { month: 5, day: 30 },
    '2025-6-29': { month: 6, day: 1 },
    '2025-7-27': { month: 6, day: 29 },
    '2025-7-28': { month: 7, day: 1 },
    '2025-8-26': { month: 7, day: 29 },
    '2025-8-27': { month: 8, day: 1 },
    '2025-9-25': { month: 8, day: 30 },
    '2025-9-26': { month: 9, day: 1 },
    '2025-10-25': { month: 9, day: 30 },
    '2025-10-26': { month: 10, day: 1 },
    '2025-11-24': { month: 10, day: 30 },
    '2025-11-25': { month: 11, day: 1 },
    '2025-12-24': { month: 11, day: 30 },
    '2025-12-25': { month: 12, day: 1 },
    '2026-1-23': { month: 12, day: 30 },
    '2026-1-24': { month: 1, day: 1 },
    '2026-2-22': { month: 1, day: 29 },
    '2026-2-23': { month: 2, day: 1 },
    '2026-3-24': { month: 2, day: 30 },
    '2026-3-25': { month: 3, day: 1 },
    '2026-4-23': { month: 3, day: 30 },
    '2026-4-24': { month: 4, day: 1 },
    '2026-5-23': { month: 4, day: 30 },
    '2026-5-24': { month: 5, day: 1 },
    '2026-6-22': { month: 5, day: 30 },
    '2026-6-23': { month: 6, day: 1 },
    '2026-7-21': { month: 6, day: 29 },
    '2026-7-22': { month: 7, day: 1 },
    '2026-8-20': { month: 7, day: 29 },
    '2026-8-21': { month: 8, day: 1 },
    '2026-9-19': { month: 8, day: 30 },
    '2026-9-20': { month: 9, day: 1 },
    '2026-10-19': { month: 9, day: 30 },
    '2026-10-20': { month: 10, day: 1 },
    '2026-11-18': { month: 10, day: 30 },
    '2026-11-19': { month: 11, day: 1 },
    '2026-12-18': { month: 11, day: 30 },
    '2026-12-19': { month: 12, day: 1 },
  };

  const key = `${year}-${month}-${day}`;
  if (lunarDates[key]) {
    return lunarDates[key].month;
  }

  const approxLunarMonth = month + 1;
  return approxLunarMonth;
}
