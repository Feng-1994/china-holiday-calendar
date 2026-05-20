export interface TaxDeadline {
  month: number;
  day: number;
  label: string;
}

export interface ExamEvent {
  name: string;
  startDate: string;
  endDate: string;
  type: 'registration' | 'exam';
}

export interface YearFinancialData {
  year: number;
  taxDeadlines: TaxDeadline[];
  examEvents: ExamEvent[];
}

const FINANCIAL_DATA: YearFinancialData[] = [
  {
    year: 2025,
    taxDeadlines: [
      { month: 1, day: 15, label: '1月报税截止' },
      { month: 2, day: 20, label: '2月报税截止（春节顺延）' },
      { month: 3, day: 17, label: '3月报税截止（周末顺延）' },
      { month: 4, day: 18, label: '4月报税截止（清明顺延）' },
      { month: 5, day: 22, label: '5月报税截止（五一顺延）' },
      { month: 6, day: 16, label: '6月报税截止（周末顺延）' },
      { month: 7, day: 15, label: '7月报税截止' },
      { month: 8, day: 15, label: '8月报税截止' },
      { month: 9, day: 15, label: '9月报税截止' },
      { month: 10, day: 27, label: '10月报税截止（国庆顺延）' },
      { month: 11, day: 17, label: '11月报税截止（周末顺延）' },
      { month: 12, day: 15, label: '12月报税截止' },
    ],
    examEvents: [
      {
        name: '中级会计师报名',
        startDate: '2025-06-12',
        endDate: '2025-07-02',
        type: 'registration',
      },
      {
        name: '中级会计师考试',
        startDate: '2025-09-06',
        endDate: '2025-09-08',
        type: 'exam',
      },
    ],
  },
  {
    year: 2026,
    taxDeadlines: [
      { month: 1, day: 20, label: '1月报税截止（元旦顺延）' },
      { month: 2, day: 24, label: '2月报税截止（春节顺延）' },
      { month: 3, day: 16, label: '3月报税截止（周末顺延）' },
      { month: 4, day: 20, label: '4月报税截止（清明顺延）' },
      { month: 5, day: 22, label: '5月报税截止（五一顺延）' },
      { month: 6, day: 15, label: '6月报税截止' },
      { month: 7, day: 15, label: '7月报税截止' },
      { month: 8, day: 17, label: '8月报税截止（周末顺延）' },
      { month: 9, day: 15, label: '9月报税截止' },
      { month: 10, day: 26, label: '10月报税截止（国庆顺延）' },
      { month: 11, day: 16, label: '11月报税截止（周末顺延）' },
      { month: 12, day: 15, label: '12月报税截止' },
    ],
    examEvents: [
      {
        name: '中级会计师报名',
        startDate: '2026-06-12',
        endDate: '2026-07-02',
        type: 'registration',
      },
      {
        name: '中级会计师考试',
        startDate: '2026-09-05',
        endDate: '2026-09-06',
        type: 'exam',
      },
    ],
  },
];

export function getTaxDeadlines(year: number, month: number): TaxDeadline[] {
  const yearData = FINANCIAL_DATA.find((d) => d.year === year);
  if (!yearData) return [];
  return yearData.taxDeadlines.filter((d) => d.month === month);
}

export function getTaxDeadlineForDate(year: number, month: number, day: number): TaxDeadline | null {
  const deadlines = getTaxDeadlines(year, month);
  return deadlines.find((d) => d.day === day) || null;
}

export function getExamEventsInMonth(year: number, month: number): ExamEvent[] {
  const yearData = FINANCIAL_DATA.find((d) => d.year === year);
  if (!yearData) return [];
  const monthStr = `-${String(month).padStart(2, '0')}-`;
  return yearData.examEvents.filter(
    (e) => e.startDate.includes(monthStr) || e.endDate.includes(monthStr) || isDateInRange(e.startDate, e.endDate, year, month),
  );
}

export function getExamEventForDate(year: number, month: number, day: number): ExamEvent | null {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const yearData = FINANCIAL_DATA.find((d) => d.year === year);
  if (!yearData) return null;
  for (const event of yearData.examEvents) {
    if (dateStr >= event.startDate && dateStr <= event.endDate) {
      return event;
    }
  }
  return null;
}

export function getNextTaxDeadline(fromDate: Date = new Date()): TaxDeadline & { year: number; daysUntil: number } | null {
  const year = fromDate.getFullYear();
  const month = fromDate.getMonth() + 1;
  const day = fromDate.getDate();

  const yearData = FINANCIAL_DATA.find((d) => d.year === year);
  if (!yearData) return null;

  for (const deadline of yearData.taxDeadlines) {
    if (deadline.month > month || (deadline.month === month && deadline.day >= day)) {
      const targetDate = new Date(year, deadline.month - 1, deadline.day);
      const diffMs = targetDate.getTime() - fromDate.getTime();
      const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return { ...deadline, year, daysUntil };
    }
  }

  const nextYearData = FINANCIAL_DATA.find((d) => d.year === year + 1);
  if (nextYearData && nextYearData.taxDeadlines.length > 0) {
    const deadline = nextYearData.taxDeadlines[0];
    const targetDate = new Date(year + 1, deadline.month - 1, deadline.day);
    const diffMs = targetDate.getTime() - fromDate.getTime();
    const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { ...deadline, year: year + 1, daysUntil };
  }

  return null;
}

export function getNextExamEvent(fromDate: Date = new Date()): (ExamEvent & { year: number; daysUntil: number }) | null {
  const year = fromDate.getFullYear();
  const fromStr = `${year}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-${String(fromDate.getDate()).padStart(2, '0')}`;

  let closest: (ExamEvent & { year: number; daysUntil: number }) | null = null;

  for (const yearData of FINANCIAL_DATA) {
    for (const event of yearData.examEvents) {
      if (event.startDate >= fromStr) {
        const eventStart = new Date(event.startDate);
        const diffMs = eventStart.getTime() - fromDate.getTime();
        const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && (!closest || daysUntil < closest.daysUntil)) {
          closest = { ...event, year: yearData.year, daysUntil };
        }
      }
    }
  }

  return closest;
}

function isDateInRange(startStr: string, endStr: string, year: number, month: number): boolean {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const start = new Date(startStr);
  const end = new Date(endStr);
  return start <= monthEnd && end >= monthStart;
}
