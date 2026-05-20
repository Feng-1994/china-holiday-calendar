import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useCalendarStore } from '@/hooks/useCalendarStore';
import { useThemeStore, THEME_LABELS, THEME_ICONS } from '@/hooks/useThemeStore';
import { MONTH_NAMES } from '@/utils/holidayData';

export default function CalendarNav() {
  const { currentYear, currentMonth, prevMonth, nextMonth, goToday } = useCalendarStore();
  const { theme, cycleTheme } = useThemeStore();

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={prevMonth}
          className="group flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}
        >
          <ChevronLeft className="h-4 w-4 transition-colors" style={{ color: 'var(--text-secondary)' }} />
        </button>

        <div className="min-w-[180px] text-center">
          <span className="font-lxgw text-2xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            {currentYear}
          </span>
          <span className="font-lxgw mx-1 text-2xl font-bold" style={{ color: 'var(--vermilion)' }}>年</span>
          <span className="font-lxgw text-2xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            {MONTH_NAMES[currentMonth - 1]}
          </span>
        </div>

        <button
          onClick={nextMonth}
          className="group flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}
        >
          <ChevronRight className="h-4 w-4 transition-colors" style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={cycleTheme}
          className="flex items-center gap-1.5 rounded-xl border px-3 py-2 font-lxgw text-sm transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
          title={THEME_LABELS[theme]}
        >
          <span className="text-base">{THEME_ICONS[theme]}</span>
          <span className="hidden sm:inline">{THEME_LABELS[theme]}</span>
        </button>

        <button
          onClick={goToday}
          className="group flex items-center gap-2 rounded-xl border px-4 py-2 font-lxgw text-sm transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ borderColor: 'var(--vermilion-border)', background: 'var(--vermilion-bg)', color: 'var(--vermilion)' }}
        >
          <CalendarDays className="h-4 w-4 transition-transform group-hover:scale-110" />
          今天
        </button>
      </div>
    </div>
  );
}
