import { useState, useMemo } from 'react';
import { getNextHoliday } from '@/utils/holidayData';
import { getLunarInfo } from '@/utils/lunarCalendar';
import { Clock, Sun, PartyPopper, StickyNote, Moon, Plus } from 'lucide-react';
import WeatherWidget from '@/components/WeatherWidget';
import CountdownWidget from '@/components/CountdownWidget';
import { getMemosForMonth, deleteMemo, type MemoItem } from '@/utils/memoData';
import { useCalendarStore } from '@/hooks/useCalendarStore';

const ZODIAC_EMOJI: { [key: string]: string } = {
  鼠: '🐭', 牛: '🐮', 虎: '🐯', 兔: '🐰', 龙: '🐲', 蛇: '🐍',
  马: '🐴', 羊: '🐑', 猴: '🐵', 鸡: '🐔', 狗: '🐶', 猪: '🐷',
};

export default function LeftInfoPanel({ onAddMemo }: { onAddMemo?: (date: string) => void }) {
  const nextHoliday = getNextHoliday();
  const now = new Date();
  const currentLunar = getLunarInfo(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const zodiacEmoji = ZODIAC_EMOJI[currentLunar.zodiac] || '📅';
  const { currentYear, currentMonth } = useCalendarStore();
  const [memoVersion, setMemoVersion] = useState(0);

  const memoMap = useMemo(
    () => getMemosForMonth(currentYear, currentMonth),
    [currentYear, currentMonth, memoVersion]
  );

  const allMemos = useMemo(() => {
    const list: (MemoItem & { dateStr: string })[] = [];
    memoMap.forEach((memos, dateStr) => {
      memos.forEach((m) => list.push({ ...m, dateStr }));
    });
    return list.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [memoMap]);

  const handleDeleteMemo = (id: string) => {
    deleteMemo(id);
    setMemoVersion((v) => v + 1);
  };

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <WeatherWidget />

      <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xl">{zodiacEmoji}</span>
          <span className="font-lxgw text-sm" style={{ color: 'var(--text-secondary)' }}>今年属相</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-lxgw text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{currentLunar.zodiac}</span>
          <span className="font-lxgw text-sm" style={{ color: 'var(--text-muted)' }}>年</span>
        </div>
      </div>

      {nextHoliday && (
        <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--vermilion-border)', background: 'var(--vermilion-bg)' }}>
          <div className="mb-2 flex items-center gap-2">
            <PartyPopper className="h-5 w-5" style={{ color: 'var(--vermilion)' }} />
            <span className="font-lxgw text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>下一个假期</span>
          </div>
          <div className="font-lxgw text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{nextHoliday.name}</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-lxgw text-4xl font-black" style={{ color: 'var(--vermilion)' }}>{nextHoliday.daysUntil}</span>
            <span className="font-lxgw text-sm" style={{ color: 'var(--text-muted)' }}>天后</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Clock className="h-3 w-3" />
            <span className="font-lxgw">
              {nextHoliday.restDays[0]} ~ {nextHoliday.restDays[nextHoliday.restDays.length - 1]}
            </span>
            <span className="font-lxgw" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>共{nextHoliday.restDays.length}天</span>
          </div>
          {nextHoliday.workDays.length > 0 && (
            <div className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: 'var(--amber)' }}>
              <Sun className="h-3 w-3" />
              <span className="font-lxgw">需补班：{nextHoliday.workDays.join('、')}</span>
            </div>
          )}
        </div>
      )}

      <CountdownWidget />

      {allMemos.length > 0 && (
        <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
          <div className="mb-2 flex items-center gap-2">
            <StickyNote className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
            <span className="font-lxgw text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>本月备忘</span>
            <span className="font-lxgw text-[10px]" style={{ color: 'var(--text-muted)' }}>{allMemos.length}条</span>
          </div>
          <div className="space-y-1.5">
            {allMemos.map((memo) => {
              const day = parseInt(memo.dateStr.split('-')[2]);
              return (
                <div
                  key={memo.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                  style={{ background: 'var(--bg-cell)' }}
                >
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: memo.color }}
                  />
                  <span className="font-lxgw text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {day}日
                  </span>
                  <span className="font-lxgw flex-1 truncate text-xs" style={{ color: 'var(--text-primary)' }}>
                    {memo.title}
                  </span>
                  {memo.isLunar && (
                    <Moon className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--amber)', opacity: 0.7 }} />
                  )}
                  <button
                    onClick={() => handleDeleteMemo(memo.id)}
                    className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-70"
                    style={{ color: 'var(--text-muted)' }}
                    title="删除"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
