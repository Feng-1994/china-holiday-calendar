import { useState, useMemo } from 'react';
import { getDayInfo, WEEKDAY_NAMES, type DateStatus } from '@/utils/holidayData';
import { getLunarInfo } from '@/utils/lunarCalendar';
import { getSolarHoliday } from '@/utils/solarHolidays';
import { getTaxDeadlineForDate, getExamEventForDate } from '@/utils/financialData';
import { useCalendarStore } from '@/hooks/useCalendarStore';
import DateDetailModal from '@/components/DateDetailModal';
import MemoEditor from '@/components/MemoEditor';
import { getMemosForMonth, type MemoItem } from '@/utils/memoData';
import { cn } from '@/lib/utils';

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

function isToday(year: number, month: number, day: number): boolean {
  const now = new Date();
  return year === now.getFullYear() && month === now.getMonth() + 1 && day === now.getDate();
}

function getStatusBadge(status: DateStatus): string | null {
  switch (status) {
    case 'holiday_rest':
    case 'rest':
      return '休';
    case 'holiday_work':
    case 'work':
      return '班';
    default:
      return null;
  }
}

const TRADITIONAL_FESTIVALS: { [key: string]: string } = {
  '1-1': '春节',
  '1-15': '元宵',
  '2-2': '龙抬头',
  '5-5': '端午',
  '7-7': '七夕',
  '7-15': '中元',
  '8-15': '中秋',
  '9-9': '重阳',
  '12-8': '腊八',
  '12-23': '小年',
  '12-30': '除夕',
};

export default function CalendarGrid() {
  const { currentYear, currentMonth, selectedDate, selectDate } = useCalendarStore();
  const isElectron = typeof window !== 'undefined' && window.__ELECTRON__;
  const [detailDate, setDetailDate] = useState<string | null>(null);
  const [memoDate, setMemoDate] = useState<string | null>(null);
  const [memoVersion, setMemoVersion] = useState(0);

  const memoMap = useMemo(() => getMemosForMonth(currentYear, currentMonth), [currentYear, currentMonth, memoVersion]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(
    currentMonth === 1 ? currentYear - 1 : currentYear,
    currentMonth === 1 ? 12 : currentMonth - 1,
  );

  const cells: {
    day: number;
    isCurrentMonth: boolean;
    year: number;
    month: number;
  }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const m = currentMonth === 1 ? 12 : currentMonth - 1;
    const y = currentMonth === 1 ? currentYear - 1 : currentYear;
    cells.push({ day: prevMonthDays - i, isCurrentMonth: false, year: y, month: m });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true, year: currentYear, month: currentMonth });
  }

  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = currentMonth === 12 ? 1 : currentMonth + 1;
    const y = currentMonth === 12 ? currentYear + 1 : currentYear;
    cells.push({ day: d, isCurrentMonth: false, year: y, month: m });
  }

  const dateKey = (y: number, m: number, d: number) =>
    `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const cellMinH = isElectron ? 'min-h-[60px]' : 'min-h-[72px]';

  return (
    <div className={isElectron ? 'relative px-3 pb-3' : 'relative px-4 pb-4'}>
      {detailDate && <DateDetailModal date={detailDate} onClose={() => setDetailDate(null)} />}
      {memoDate && (
        <MemoEditor
          date={memoDate}
          onClose={() => setMemoDate(null)}
          onChanged={() => setMemoVersion((v) => v + 1)}
        />
      )}

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_NAMES.map((name, i) => (
          <div
            key={i}
            className="py-1.5 text-center font-lxgw text-xs font-medium"
            style={{ color: i === 0 || i === 6 ? 'var(--weekend-header)' : 'var(--weekday-header)' }}
          >
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          const info = getDayInfo(cell.year, cell.month, cell.day);
          const badge = getStatusBadge(info.status);
          const today = isToday(cell.year, cell.month, cell.day);
          const key = dateKey(cell.year, cell.month, cell.day);
          const isSelected = selectedDate === key;

          const lunar = cell.isCurrentMonth
            ? getLunarInfo(cell.year, cell.month, cell.day)
            : null;
          const solarHoliday = cell.isCurrentMonth
            ? getSolarHoliday(cell.year, cell.month, cell.day)
            : null;
          const taxDeadline = cell.isCurrentMonth
            ? getTaxDeadlineForDate(cell.year, cell.month, cell.day)
            : null;
          const examEvent = cell.isCurrentMonth
            ? getExamEventForDate(cell.year, cell.month, cell.day)
            : null;

          const isSolarTerm = lunar?.solarTerm != null;
          const isLunarNewYear = lunar?.lunarDay === 1;
          const isTraditionalFestival = lunar
            ? TRADITIONAL_FESTIVALS[`${lunar.lunarMonth}-${lunar.lunarDay}`] !== undefined
            : false;
          const traditionalName = lunar
            ? TRADITIONAL_FESTIVALS[`${lunar.lunarMonth}-${lunar.lunarDay}`]
            : null;

          const hasSpecialLabel = solarHoliday || isSolarTerm || traditionalName;

          let cellBg: string;
          let cellBorder: string;
          switch (info.status) {
            case 'holiday_rest':
              cellBg = 'var(--vermilion-bg)';
              cellBorder = 'var(--vermilion-border)';
              break;
            case 'holiday_work':
              cellBg = 'var(--amber-bg)';
              cellBorder = 'var(--amber-border)';
              break;
            case 'rest':
              cellBg = 'var(--pine-bg)';
              cellBorder = 'var(--pine-border)';
              break;
            case 'work':
              cellBg = 'var(--amber-bg)';
              cellBorder = 'var(--amber-border)';
              break;
            default:
              cellBg = 'var(--bg-cell)';
              cellBorder = 'var(--border-color)';
          }

          let labelColor = 'var(--text-lunar)';
          if (solarHoliday) labelColor = 'var(--pine)';
          else if (isSolarTerm) labelColor = 'var(--amber)';
          else if (isTraditionalFestival) labelColor = 'var(--moonwhite)';
          else if (isLunarNewYear) labelColor = 'var(--pine)';

          let badgeBg: string;
          let badgeTextColor: string;
          switch (info.status) {
            case 'holiday_rest':
              badgeBg = 'var(--vermilion)';
              badgeTextColor = '#fff';
              break;
            case 'holiday_work':
            case 'work':
              badgeBg = 'var(--amber)';
              badgeTextColor = 'var(--bg-primary)';
              break;
            case 'rest':
              badgeBg = 'var(--badge-rest-bg)';
              badgeTextColor = '#fff';
              break;
            default:
              badgeBg = '';
              badgeTextColor = '';
          }

          return (
            <button
              key={idx}
              onClick={() => {
                if (cell.isCurrentMonth) {
                  selectDate(isSelected ? null : key);
                  setDetailDate(key);
                }
              }}
              onContextMenu={(e) => {
                if (cell.isCurrentMonth) {
                  e.preventDefault();
                  setMemoDate(key);
                }
              }}
              className={cn(
                `group relative flex ${cellMinH} flex-col items-center justify-center rounded-xl border transition-all duration-200`,
                !cell.isCurrentMonth && 'opacity-30',
                today && 'ring-2',
                isSelected && 'ring-2 scale-[1.02]',
                'hover:scale-[1.04] hover:shadow-lg',
                info.status === 'holiday_rest' && cell.isCurrentMonth && 'animate-subtle-glow',
              )}
              style={{
                backgroundColor: cell.isCurrentMonth ? cellBg : 'transparent',
                borderColor: cell.isCurrentMonth ? cellBorder : 'transparent',
                ...(today ? { '--tw-ring-color': 'var(--vermilion)' } as React.CSSProperties : {}),
                ...(isSelected ? { '--tw-ring-color': 'var(--border-color)' } as React.CSSProperties : {}),
                boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : undefined,
              }}
            >
              <span
                className="font-lxgw text-sm font-semibold leading-tight"
                style={{ color: today ? 'var(--vermilion)' : cell.isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                {cell.day}
              </span>

              {cell.isCurrentMonth && (
                <span
                  className="mt-0.5 max-w-full truncate px-0.5 font-lxgw text-[9px] leading-tight"
                  style={{ color: labelColor, fontWeight: hasSpecialLabel ? 600 : 400 }}
                >
                  {solarHoliday
                    ? solarHoliday.name
                    : isSolarTerm
                      ? lunar!.solarTerm
                      : traditionalName
                        ? traditionalName
                        : lunar
                          ? isLunarNewYear ? '初一' : lunar.lunarDayName
                          : ''}
                </span>
              )}

              {cell.isCurrentMonth && !hasSpecialLabel && info.holidayName && (
                <span
                  className="mt-0.5 max-w-full truncate px-0.5 font-lxgw text-[9px] leading-tight"
                  style={{ color: 'var(--vermilion)', opacity: 0.8 }}
                >
                  {info.holidayName}
                </span>
              )}

              {cell.isCurrentMonth && taxDeadline && (
                <span
                  className="mt-0.5 max-w-full truncate px-0.5 font-lxgw text-[9px] leading-tight"
                  style={{ color: '#6C5CE7', fontWeight: 600 }}
                >
                  📋报税
                </span>
              )}

              {cell.isCurrentMonth && examEvent && !taxDeadline && (
                <span
                  className="mt-0.5 max-w-full truncate px-0.5 font-lxgw text-[9px] leading-tight"
                  style={{ color: examEvent.type === 'exam' ? '#E17055' : '#00B894', fontWeight: 600 }}
                >
                  {examEvent.type === 'exam' ? '📝考试' : '📝报名'}
                </span>
              )}

              {cell.isCurrentMonth && badge && (
                <span
                  className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-[3px] font-lxgw text-[9px] font-bold"
                  style={{ backgroundColor: badgeBg, color: badgeTextColor }}
                >
                  {badge}
                </span>
              )}

              {today && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" style={{ backgroundColor: 'var(--vermilion)' }} />
              )}

              {cell.isCurrentMonth && memoMap.has(key) && (
                <div className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-0.5">
                  {memoMap.get(key)!.slice(0, 3).map((m: MemoItem) => (
                    <span
                      key={m.id}
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
