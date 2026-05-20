import { useState, useEffect, useRef, useCallback } from 'react';
import { getDayInfo, WEEKDAY_NAMES, getNextHoliday, type DateStatus } from '@/utils/holidayData';
import { getLunarInfo } from '@/utils/lunarCalendar';
import { getTaxDeadlineForDate, getExamEventForDate } from '@/utils/financialData';
import { useThemeStore, THEME_LABELS, THEME_ICONS } from '@/hooks/useThemeStore';

type WidgetSize = 'small' | 'medium' | 'large';

const SIZE_LABELS: Record<WidgetSize, string> = { small: '小', medium: '中', large: '大' };
const SIZE_ORDER: WidgetSize[] = ['small', 'medium', 'large'];

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

const MONTH_NAMES = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

export default function WidgetApp() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const { theme, cycleTheme } = useThemeStore();
  const [widgetSize, setWidgetSize] = useState<WidgetSize>(() => {
    return (localStorage.getItem('widget-size') as WidgetSize) || 'medium';
  });
  const [opacity, setOpacity] = useState(() => {
    const saved = localStorage.getItem('widget-opacity');
    return saved ? parseFloat(saved) : 0.95;
  });
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const lunarToday = getLunarInfo(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const nextHoliday = getNextHoliday();
  const zodiacEmoji: { [key: string]: string } = {
    鼠: '🐭', 牛: '🐮', 虎: '🐯', 兔: '🐰', 龙: '🐲', 蛇: '🐍',
    马: '🐴', 羊: '🐑', 猴: '🐵', 鸡: '🐔', 狗: '🐶', 猪: '🐷',
  };

  const resizeToContent = useCallback(() => {
    if (!window.__ELECTRON__ || !window.electronAPI?.resizeWidget) return;
    requestAnimationFrame(() => {
      const el = containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        window.electronAPI!.resizeWidget!(rect.width, rect.height);
      }
    });
  }, []);

  useEffect(() => {
    resizeToContent();
  }, [widgetSize, resizeToContent]);

  const cycleSize = () => {
    const idx = SIZE_ORDER.indexOf(widgetSize);
    const next = SIZE_ORDER[(idx + 1) % SIZE_ORDER.length];
    setWidgetSize(next);
    localStorage.setItem('widget-size', next);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(
    viewMonth === 1 ? viewYear - 1 : viewYear,
    viewMonth === 1 ? 12 : viewMonth - 1,
  );

  const cells: { day: number; isCurrentMonth: boolean; year: number; month: number }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const m = viewMonth === 1 ? 12 : viewMonth - 1;
    const y = viewMonth === 1 ? viewYear - 1 : viewYear;
    cells.push({ day: prevMonthDays - i, isCurrentMonth: false, year: y, month: m });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true, year: viewYear, month: viewMonth });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 12 ? 1 : viewMonth + 1;
    const y = viewMonth === 12 ? viewYear + 1 : viewYear;
    cells.push({ day: d, isCurrentMonth: false, year: y, month: m });
  }

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToday = () => {
    const n = new Date();
    setViewYear(n.getFullYear());
    setViewMonth(n.getMonth() + 1);
  };

  const handleOpenMain = () => {
    if (window.__ELECTRON__ && window.electronAPI?.openMainWindow) {
      window.electronAPI.openMainWindow();
    }
  };

  const widgetWidth = widgetSize === 'large' ? 'w-[380px]' : widgetSize === 'medium' ? 'w-[300px]' : 'w-[220px]';
  const cellMinH = widgetSize === 'large' ? 'min-h-[44px]' : widgetSize === 'medium' ? 'min-h-[32px]' : 'min-h-[24px]';
  const dayFontSize = widgetSize === 'large' ? 'text-sm' : widgetSize === 'medium' ? 'text-[11px]' : 'text-[10px]';
  const lunarFontSize = widgetSize === 'large' ? 'text-[9px]' : widgetSize === 'medium' ? 'text-[7px]' : 'text-[6px]';
  const weekFontSize = widgetSize === 'large' ? 'text-[10px]' : widgetSize === 'medium' ? 'text-[9px]' : 'text-[8px]';
  const badgeSize = widgetSize === 'large' ? 'h-3.5 w-3.5 text-[7px]' : widgetSize === 'medium' ? 'h-2.5 w-2.5 text-[6px]' : 'h-2 w-2 text-[5px]';
  const headerPy = widgetSize === 'large' ? 'py-2.5' : 'py-2';
  const cellGap = widgetSize === 'large' ? 'gap-1' : 'gap-0.5';
  const px = widgetSize === 'large' ? 'px-3' : 'px-2';

  if (widgetSize === 'small') {
    return (
      <div
        ref={containerRef}
        className="flex items-center gap-2 rounded-2xl border px-3 py-2"
        style={{
          backgroundColor: 'var(--bg-card-alpha)',
          borderColor: 'var(--border-color)',
          backdropFilter: 'blur(20px)',
          WebkitAppRegion: 'drag',
          opacity,
        } as React.CSSProperties}
      >
        <span className="font-lxgw text-sm font-bold" style={{ color: 'var(--vermilion)' }}>
          {now.getMonth() + 1}/{now.getDate()}
        </span>
        <span className="font-lxgw text-xs" style={{ color: 'var(--text-muted)' }}>
          {lunarToday.lunarDayName}
        </span>
        {nextHoliday && (
          <span className="font-lxgw text-xs" style={{ color: 'var(--amber)' }}>
            {nextHoliday.name}{nextHoliday.daysUntil}天
          </span>
        )}
        <div className="flex items-center gap-0.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={cycleSize}
            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            title={`切换大小（当前：${SIZE_LABELS[widgetSize]}）`}
          >
            <span className="font-lxgw text-[9px] font-bold">{SIZE_LABELS[widgetSize]}</span>
          </button>
          <button
            onClick={cycleTheme}
            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:opacity-80"
            title={THEME_LABELS[theme]}
          >
            <span className="text-xs">{THEME_ICONS[theme]}</span>
          </button>
          <button
            onClick={() => {
              const newOpacity = opacity <= 0.5 ? 0.95 : opacity - 0.15;
              setOpacity(newOpacity);
              localStorage.setItem('widget-opacity', String(newOpacity));
            }}
            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            title={`透明度 ${Math.round(opacity * 100)}%（点击调节）`}
          >
            <span className="text-[10px]">◐</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex ${widgetWidth} flex-col gap-0 overflow-hidden rounded-2xl border`}
      style={{
        backgroundColor: 'var(--bg-card-alpha)',
        borderColor: 'var(--border-color)',
        backdropFilter: 'blur(20px)',
        opacity,
      }}
    >
      <div
        className={`flex items-center justify-between ${px} ${headerPy}`}
        style={{ borderBottom: '1px solid var(--border-color)', WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-2">
          <span className={widgetSize === 'large' ? 'text-base' : 'text-sm'}>{zodiacEmoji[lunarToday.zodiac] || '📅'}</span>
          <span className={`font-lxgw ${widgetSize === 'large' ? 'text-sm' : 'text-xs'} font-medium`} style={{ color: 'var(--text-secondary)' }}>
            {viewYear}年{MONTH_NAMES[viewMonth - 1]}
          </span>
        </div>
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={handlePrevMonth}
            className={`flex ${widgetSize === 'large' ? 'h-6 w-6' : 'h-5 w-5'} items-center justify-center rounded transition-colors hover:opacity-80`}
            style={{ color: 'var(--text-muted)' }}
          >
            ‹
          </button>
          <button
            onClick={goToday}
            className={`rounded ${widgetSize === 'large' ? 'px-2 py-0.5' : 'px-1.5 py-0.5'} font-lxgw ${widgetSize === 'large' ? 'text-xs' : 'text-[10px]'} transition-colors hover:opacity-80`}
            style={{ color: 'var(--vermilion)', background: 'var(--vermilion-bg)' }}
          >
            今
          </button>
          <button
            onClick={handleNextMonth}
            className={`flex ${widgetSize === 'large' ? 'h-6 w-6' : 'h-5 w-5'} items-center justify-center rounded transition-colors hover:opacity-80`}
            style={{ color: 'var(--text-muted)' }}
          >
            ›
          </button>
          <button
            onClick={cycleSize}
            className="ml-1 flex h-5 w-5 items-center justify-center rounded transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            title={`切换大小（当前：${SIZE_LABELS[widgetSize]}）`}
          >
            <span className="font-lxgw text-[9px] font-bold">{SIZE_LABELS[widgetSize]}</span>
          </button>
          <button
            onClick={cycleTheme}
            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:opacity-80"
            title={THEME_LABELS[theme]}
          >
            <span className="text-xs">{THEME_ICONS[theme]}</span>
          </button>
          <button
            onClick={() => setShowOpacitySlider(!showOpacitySlider)}
            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:opacity-80"
            style={{ color: showOpacitySlider ? 'var(--vermilion)' : 'var(--text-muted)' }}
            title="透明度调节"
          >
            <span className="text-[10px]">◐</span>
          </button>
          <button
            onClick={() => { setWidgetSize('small'); localStorage.setItem('widget-size', 'small'); }}
            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            title="收起"
          >
            −
          </button>
        </div>
      </div>

      {showOpacitySlider && (
        <div
          className={`flex items-center gap-2 ${px} py-1.5`}
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <span className="font-lxgw text-[9px]" style={{ color: 'var(--text-muted)' }}>透明度</span>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setOpacity(v);
              localStorage.setItem('widget-opacity', String(v));
            }}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-lg"
            style={{
              background: `linear-gradient(to right, var(--vermilion) 0%, var(--vermilion) ${((opacity - 0.2) / 0.8) * 100}%, var(--border-color) ${((opacity - 0.2) / 0.8) * 100}%, var(--border-color) 100%)`,
              WebkitAppRegion: 'no-drag',
            } as React.CSSProperties}
          />
          <span className="font-lxgw text-[9px]" style={{ color: 'var(--text-muted)' }}>{Math.round(opacity * 100)}%</span>
        </div>
      )}

      <div className={`grid grid-cols-7 gap-0 ${px} pt-1.5`}>
        {WEEKDAY_NAMES.map((name, i) => (
          <div
            key={i}
            className={`py-0.5 text-center font-lxgw ${weekFontSize} font-medium`}
            style={{ color: i === 0 || i === 6 ? 'var(--weekend-header)' : 'var(--weekday-header)' }}
          >
            {name}
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-7 ${cellGap} ${px} pb-1.5`}>
        {cells.map((cell, idx) => {
          const info = getDayInfo(cell.year, cell.month, cell.day);
          const badge = getStatusBadge(info.status);
          const today = isToday(cell.year, cell.month, cell.day);
          const lunar = cell.isCurrentMonth ? getLunarInfo(cell.year, cell.month, cell.day) : null;
          const taxDeadline = cell.isCurrentMonth ? getTaxDeadlineForDate(cell.year, cell.month, cell.day) : null;
          const examEvent = cell.isCurrentMonth ? getExamEventForDate(cell.year, cell.month, cell.day) : null;

          let cellBg = 'transparent';
          let cellBorder = 'transparent';
          if (cell.isCurrentMonth) {
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
              default:
                cellBg = 'var(--bg-cell)';
                cellBorder = 'var(--border-color)';
            }
          }

          let badgeBg = '';
          let badgeTextColor = '';
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
          }

          const isLunarFirst = lunar?.lunarDay === 1;
          const lunarLabel = lunar
            ? lunar.solarTerm
              ? lunar.solarTerm
              : isLunarFirst
                ? lunar.lunarMonthName + '月'
                : lunar.lunarDayName
            : '';

          let lunarColor = 'var(--text-lunar)';
          if (lunar?.solarTerm) lunarColor = 'var(--amber)';
          else if (isLunarFirst) lunarColor = 'var(--pine)';

          return (
            <div
              key={idx}
              className={`relative flex ${cellMinH} flex-col items-center justify-center rounded-lg border transition-colors`}
              style={{
                backgroundColor: cellBg,
                borderColor: cellBorder,
                opacity: cell.isCurrentMonth ? 1 : 0.25,
                cursor: cell.isCurrentMonth ? 'pointer' : 'default',
              }}
              onClick={handleOpenMain}
            >
              <span
                className={`font-lxgw ${dayFontSize} font-semibold leading-tight`}
                style={{ color: today ? 'var(--vermilion)' : cell.isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                {cell.day}
              </span>
              {cell.isCurrentMonth && (
                <span
                  className={`max-w-full truncate px-0.5 font-lxgw ${lunarFontSize} leading-tight`}
                  style={{ color: lunarColor }}
                >
                  {lunarLabel}
                </span>
              )}
              {cell.isCurrentMonth && badge && (
                <span
                  className={`absolute top-0 right-0 flex ${badgeSize} items-center justify-center rounded-[2px] font-lxgw font-bold`}
                  style={{ backgroundColor: badgeBg, color: badgeTextColor }}
                >
                  {badge}
                </span>
              )}
              {cell.isCurrentMonth && taxDeadline && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" style={{ backgroundColor: '#6C5CE7' }} />
              )}
              {cell.isCurrentMonth && examEvent && !taxDeadline && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" style={{ backgroundColor: examEvent.type === 'exam' ? '#E17055' : '#00B894' }} />
              )}
              {today && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-0.5 -translate-x-1/2 rounded-full" style={{ backgroundColor: 'var(--vermilion)' }} />
              )}
            </div>
          );
        })}
      </div>

      <div
        className={`flex items-center justify-between ${px} py-2`}
        style={{ borderTop: '1px solid var(--border-color)', WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-2">
          <span className={`font-lxgw ${widgetSize === 'large' ? 'text-xs' : 'text-[11px]'}`} style={{ color: 'var(--text-muted)' }}>
            {lunarToday.lunarMonthName}月{lunarToday.lunarDayName}
          </span>
          {lunarToday.solarTerm && (
            <span className={`font-lxgw ${widgetSize === 'large' ? 'text-xs' : 'text-[11px]'}`} style={{ color: 'var(--amber)' }}>
              {lunarToday.solarTerm}
            </span>
          )}
        </div>
        {nextHoliday && (
          <div className="flex items-center gap-1">
            <span className={`font-lxgw ${widgetSize === 'large' ? 'text-[11px]' : 'text-[10px]'}`} style={{ color: 'var(--text-muted)' }}>
              距{nextHoliday.name}
            </span>
            <span className={`font-lxgw ${widgetSize === 'large' ? 'text-base' : 'text-sm'} font-bold`} style={{ color: 'var(--vermilion)' }}>
              {nextHoliday.daysUntil}
            </span>
            <span className={`font-lxgw ${widgetSize === 'large' ? 'text-[11px]' : 'text-[10px]'}`} style={{ color: 'var(--text-muted)' }}>天</span>
          </div>
        )}
      </div>
    </div>
  );
}
