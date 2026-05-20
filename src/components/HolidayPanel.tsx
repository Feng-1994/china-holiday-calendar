import { getMonthHolidays, getNextHoliday, MONTH_NAMES, setOnlineHolidays } from '@/utils/holidayData';
import { getLunarInfo } from '@/utils/lunarCalendar';
import { getSolarHolidaysInMonth } from '@/utils/solarHolidays';
import { getTaxDeadlines, getExamEventsInMonth, getNextTaxDeadline, getNextExamEvent } from '@/utils/financialData';
import { useCalendarStore } from '@/hooks/useCalendarStore';
import DateCalculator from '@/components/DateCalculator';
import YearOverview from '@/components/YearOverview';
import YearStats from '@/components/YearStats';
import WeatherWidget from '@/components/WeatherWidget';
import { fetchOnlineHolidays, getOnlineHolidays, shouldCheckUpdate, getLastUpdateTime } from '@/utils/holidayOnline';
import { Moon, Sun, Clock, PartyPopper, Sparkles, Globe, RefreshCw, Check, AlertCircle, FileText, GraduationCap } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const ZODIAC_EMOJI: { [key: string]: string } = {
  鼠: '🐭', 牛: '🐮', 虎: '🐯', 兔: '🐰', 龙: '🐲', 蛇: '🐍',
  马: '🐴', 羊: '🐑', 猴: '🐵', 鸡: '🐔', 狗: '🐶', 猪: '🐷',
};

function getTraditionalHolidaysInMonth(month: number): string[] {
  const yearData: { [month: number]: string[] } = {
    1: ['春节', '元宵节'],
    2: ['龙抬头'],
    5: ['端午节'],
    7: ['七夕节', '中元节'],
    8: ['中秋节'],
    9: ['重阳节'],
    12: ['腊八节', '小年', '除夕'],
  };
  return yearData[month] || [];
}

export default function HolidayPanel() {
  const { currentYear, currentMonth } = useCalendarStore();
  const monthHolidays = getMonthHolidays(currentYear, currentMonth);
  const nextHoliday = getNextHoliday();

  const now = new Date();
  const currentLunar = getLunarInfo(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const zodiacEmoji = ZODIAC_EMOJI[currentLunar.zodiac] || '📅';
  const traditionalHolidays = getTraditionalHolidaysInMonth(currentMonth);
  const solarHolidays = getSolarHolidaysInMonth(currentYear, currentMonth);

  const taxDeadlines = getTaxDeadlines(currentYear, currentMonth);
  const examEvents = getExamEventsInMonth(currentYear, currentMonth);
  const nextTax = getNextTaxDeadline();
  const nextExam = getNextExamEvent();

  const [updateStatus, setUpdateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [lastUpdate, setLastUpdate] = useState<string | null>(getLastUpdateTime());

  const checkForUpdates = useCallback(async () => {
    setUpdateStatus('loading');
    const result = await fetchOnlineHolidays();
    if (result.success && result.data.length > 0) {
      setOnlineHolidays(result.data);
      setUpdateStatus('success');
      setLastUpdate(getLastUpdateTime());
    } else {
      setUpdateStatus('error');
    }
    setTimeout(() => setUpdateStatus('idle'), 3000);
  }, []);

  useEffect(() => {
    const cached = getOnlineHolidays();
    if (cached && cached.length > 0) {
      setOnlineHolidays(cached);
    }
    if (shouldCheckUpdate()) {
      checkForUpdates();
    }
  }, [checkForUpdates]);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
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

      <WeatherWidget />

      <YearOverview />
      <YearStats />

      {nextTax && (
        <div className="rounded-xl border p-3" style={{ borderColor: 'rgba(108, 92, 231, 0.3)', background: 'rgba(108, 92, 231, 0.08)' }}>
          <div className="mb-1.5 flex items-center gap-2">
            <FileText className="h-4 w-4" style={{ color: '#6C5CE7' }} />
            <span className="font-lxgw text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>报税提醒</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-lxgw text-lg font-bold" style={{ color: '#6C5CE7' }}>
              {nextTax.month}月{nextTax.day}日
            </span>
            <span className="font-lxgw text-xs" style={{ color: 'var(--text-muted)' }}>
              {nextTax.daysUntil === 0 ? '今天截止！' : nextTax.daysUntil <= 3 ? `仅剩${nextTax.daysUntil}天` : `${nextTax.daysUntil}天后`}
            </span>
          </div>
          {taxDeadlines.length > 0 && (
            <div className="mt-1 font-lxgw text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.8 }}>
              本月截止：{taxDeadlines.map((t) => `${t.day}日`).join('、')}
            </div>
          )}
        </div>
      )}

      {nextExam && (
        <div className="rounded-xl border p-3" style={{ borderColor: nextExam.type === 'exam' ? 'rgba(225, 112, 85, 0.3)' : 'rgba(0, 184, 148, 0.3)', background: nextExam.type === 'exam' ? 'rgba(225, 112, 85, 0.08)' : 'rgba(0, 184, 148, 0.08)' }}>
          <div className="mb-1.5 flex items-center gap-2">
            <GraduationCap className="h-4 w-4" style={{ color: nextExam.type === 'exam' ? '#E17055' : '#00B894' }} />
            <span className="font-lxgw text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {nextExam.type === 'exam' ? '考试提醒' : '报名提醒'}
            </span>
          </div>
          <div className="font-lxgw text-sm font-bold" style={{ color: nextExam.type === 'exam' ? '#E17055' : '#00B894' }}>
            {nextExam.name}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <Clock className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
            <span className="font-lxgw text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {nextExam.startDate.replace(/-/g, '/')} ~ {nextExam.endDate.replace(/-/g, '/')}
            </span>
          </div>
          <div className="mt-0.5 font-lxgw text-xs" style={{ color: nextExam.type === 'exam' ? '#E17055' : '#00B894' }}>
            {nextExam.daysUntil === 0 ? '今天开始！' : `${nextExam.daysUntil}天后`}
          </div>
          {examEvents.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              {examEvents.map((e, i) => (
                <div key={i} className="font-lxgw text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {e.name}：{e.startDate.slice(5).replace(/-/g, '/')} ~ {e.endDate.slice(5).replace(/-/g, '/')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {solarHolidays.length > 0 && (
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--pine-border)', background: 'var(--pine-bg)' }}>
          <div className="mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4" style={{ color: 'var(--pine)', opacity: 0.8 }} />
            <span className="font-lxgw text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>公历节日</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {solarHolidays.map((h, idx) => (
              <span
                key={idx}
                className="rounded-lg px-2 py-1 font-lxgw text-xs"
                style={{ background: 'var(--pine-bg)', color: 'var(--pine)', opacity: 0.9, border: '1px solid var(--pine-border)' }}
              >
                {h.day ? `${h.day}日 ` : ''}{h.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {traditionalHolidays.length > 0 && (
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--moonwhite-bg)', background: 'var(--moonwhite-bg)' }}>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: 'var(--moonwhite)', opacity: 0.7 }} />
            <span className="font-lxgw text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>传统节日</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {traditionalHolidays.map((name, idx) => (
              <span
                key={idx}
                className="rounded-lg px-2 py-1 font-lxgw text-xs"
                style={{ background: 'var(--moonwhite-bg)', color: 'var(--moonwhite)', opacity: 0.85 }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1">
        <h3 className="font-lxgw mb-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {currentYear}年{MONTH_NAMES[currentMonth - 1]}节假日
        </h3>
        {monthHolidays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8" style={{ color: 'var(--text-muted)' }}>
            <Moon className="mb-2 h-8 w-8" />
            <span className="font-lxgw text-sm">本月无法定节假日</span>
          </div>
        ) : (
          <div className="space-y-3">
            {monthHolidays.map((holiday, idx) => (
              <div
                key={idx}
                className="rounded-xl border p-4 transition-colors"
                style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-lxgw text-base font-bold" style={{ color: 'var(--text-primary)' }}>{holiday.name}</span>
                  <span className="font-lxgw text-xs" style={{ color: 'var(--vermilion)', opacity: 0.8 }}>
                    共{holiday.restDays.length}天假期
                  </span>
                </div>
                {holiday.restDays.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <Moon className="h-3.5 w-3.5" style={{ color: 'var(--pine)' }} />
                    <span className="font-lxgw text-xs" style={{ color: 'var(--text-secondary)' }}>
                      休息：{holiday.restDays.join('、')}
                    </span>
                  </div>
                )}
                {holiday.workDays.length > 0 && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5" style={{ color: 'var(--amber)' }} />
                    <span className="font-lxgw text-xs" style={{ color: 'var(--amber)' }}>
                      补班：{holiday.workDays.join('、')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <DateCalculator />

      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
        <h3 className="font-lxgw mb-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>图例说明</h3>
        <div className="grid grid-cols-2 gap-2">
          <LegendItem color="var(--vermilion)" label="法定假日休息" />
          <LegendItem color="var(--amber)" label="调休补班" />
          <LegendItem color="var(--pine)" label="周末/公历节日" />
          <LegendItem color="var(--text-muted)" label="正常工作日" />
        </div>
        <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
          <div className="grid grid-cols-2 gap-2">
            <LegendItem color="var(--amber)" label="二十四节气" />
            <LegendItem color="var(--moonwhite)" label="传统节日" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 border-t pt-2" style={{ borderColor: 'var(--border-color)' }}>
            <LegendItem color="#6C5CE7" label="报税截止日" />
            <LegendItem color="#E17055" label="会计考试" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {updateStatus === 'success' ? (
              <Check className="h-3.5 w-3.5" style={{ color: 'var(--pine)' }} />
            ) : updateStatus === 'error' ? (
              <AlertCircle className="h-3.5 w-3.5" style={{ color: 'var(--vermilion)' }} />
            ) : (
              <Globe className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
            )}
            <span className="font-lxgw text-xs" style={{ color: 'var(--text-muted)' }}>
              {updateStatus === 'loading' ? '正在更新...' : updateStatus === 'success' ? '已更新' : updateStatus === 'error' ? '更新失败' : '节假日数据'}
            </span>
          </div>
          <button
            onClick={checkForUpdates}
            disabled={updateStatus === 'loading'}
            className="flex items-center gap-1 rounded-lg px-2 py-1 font-lxgw text-xs transition-colors hover:opacity-80 disabled:opacity-50"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-cell)' }}
          >
            <RefreshCw className={`h-3 w-3 ${updateStatus === 'loading' ? 'animate-spin' : ''}`} />
            检查更新
          </button>
        </div>
        {lastUpdate && (
          <div className="mt-1.5 font-lxgw text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
            上次更新：{lastUpdate}
          </div>
        )}
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-[3px]" style={{ backgroundColor: color }} />
      <span className="font-lxgw text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}
