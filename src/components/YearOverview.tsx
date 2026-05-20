import { getYearHolidays, type HolidayArrangement } from '@/utils/holidayData';
import { useCalendarStore } from '@/hooks/useCalendarStore';
import { CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';

const HOLIDAY_COLORS = [
  '#C53D43', '#2D6A4F', '#E9A319', '#6C5CE7',
  '#00B894', '#E17055', '#0984E3', '#D63031',
];

function parseDateDay(dateStr: string): number {
  return parseInt(dateStr.split('-')[2], 10);
}

function parseDateMonth(dateStr: string): number {
  return parseInt(dateStr.split('-')[1], 10);
}

function formatShortDate(dateStr: string): string {
  const m = parseDateMonth(dateStr);
  const d = parseDateDay(dateStr);
  return `${m}/${d}`;
}

export default function YearOverview() {
  const { currentYear } = useCalendarStore();
  const [expanded, setExpanded] = useState(false);

  const holidays = useMemo(() => getYearHolidays(currentYear), [currentYear]);

  const totalRestDays = holidays.reduce((sum, h) => sum + h.restDays.length, 0);
  const totalWorkDays = holidays.reduce((sum, h) => sum + h.workDays.length, 0);

  const monthMarkers = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    pos: ((i + 0.5) / 12) * 100,
  }));

  const timelineSegments = useMemo(() => {
    const segments: { holiday: HolidayArrangement; startPct: number; widthPct: number; color: string }[] = [];
    const totalDaysInYear = (new Date(currentYear, 11, 31).getTime() - new Date(currentYear, 0, 1).getTime()) / (1000 * 60 * 60 * 24) + 1;

    holidays.forEach((h, idx) => {
      if (h.restDays.length === 0) return;
      const firstDay = new Date(h.restDays[0]);
      const lastDay = new Date(h.restDays[h.restDays.length - 1]);
      const yearStart = new Date(currentYear, 0, 1);
      const startPct = ((firstDay.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) / totalDaysInYear * 100;
      const widthPct = ((lastDay.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24) + 1) / totalDaysInYear * 100;
      segments.push({
        holiday: h,
        startPct,
        widthPct: Math.max(widthPct, 1.5),
        color: HOLIDAY_COLORS[idx % HOLIDAY_COLORS.length],
      });
    });
    return segments;
  }, [holidays, currentYear]);

  return (
    <div className="rounded-xl border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-3"
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" style={{ color: 'var(--vermilion)' }} />
          <span className="font-lxgw text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {currentYear}年假期概览
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-lxgw text-xs" style={{ color: 'var(--vermilion)' }}>
            {totalRestDays}天假
          </span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3">
          <div className="relative mb-1 h-6 w-full overflow-hidden rounded" style={{ background: 'var(--bg-cell)' }}>
            {timelineSegments.map((seg, i) => (
              <div
                key={i}
                className="absolute top-0.5 h-5 rounded-sm cursor-default"
                style={{
                  left: `${seg.startPct}%`,
                  width: `${seg.widthPct}%`,
                  backgroundColor: seg.color,
                  opacity: 0.7,
                }}
                title={`${seg.holiday.name}: ${formatShortDate(seg.holiday.restDays[0])} ~ ${formatShortDate(seg.holiday.restDays[seg.holiday.restDays.length - 1])}`}
              />
            ))}
          </div>
          <div className="relative mb-3 h-3 w-full">
            {monthMarkers.map((m) => (
              <span
                key={m.month}
                className="absolute top-0 -translate-x-1/2 font-lxgw text-[8px]"
                style={{ left: `${m.pos}%`, color: 'var(--text-muted)', opacity: 0.6 }}
              >
                {m.month}
              </span>
            ))}
          </div>

          <div className="space-y-2">
            {holidays.map((holiday, idx) => {
              const color = HOLIDAY_COLORS[idx % HOLIDAY_COLORS.length];
              return (
                <div
                  key={idx}
                  className="flex items-start gap-2 rounded-lg p-2"
                  style={{ background: 'var(--bg-cell)' }}
                >
                  <span
                    className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                    style={{ backgroundColor: color, opacity: 0.8 }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-lxgw text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                        {holiday.name}
                      </span>
                      <span className="font-lxgw text-[10px]" style={{ color: 'var(--vermilion)', opacity: 0.8 }}>
                        {holiday.restDays.length}天
                      </span>
                    </div>
                    <div className="font-lxgw text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {formatShortDate(holiday.restDays[0])} ~ {formatShortDate(holiday.restDays[holiday.restDays.length - 1])}
                      {holiday.workDays.length > 0 && (
                        <span style={{ color: 'var(--amber)' }}>
                          {' '}· 补班{holiday.workDays.length}天
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--border-color)' }}>
            <span className="font-lxgw text-[10px]" style={{ color: 'var(--text-muted)' }}>
              共{holidays.length}个法定假期
            </span>
            <div className="flex items-center gap-3">
              <span className="font-lxgw text-[10px]" style={{ color: 'var(--vermilion)' }}>
                休息{totalRestDays}天
              </span>
              <span className="font-lxgw text-[10px]" style={{ color: 'var(--amber)' }}>
                补班{totalWorkDays}天
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
