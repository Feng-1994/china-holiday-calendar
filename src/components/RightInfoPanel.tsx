import { getTaxDeadlines, getExamEventsInMonth, getNextTaxDeadline, getNextExamEvent } from '@/utils/financialData';
import { getSolarHolidaysInMonth } from '@/utils/solarHolidays';
import { useCalendarStore } from '@/hooks/useCalendarStore';
import YearOverview from '@/components/YearOverview';
import YearStats from '@/components/YearStats';
import DateCalculator from '@/components/DateCalculator';
import AlmanacWidget from '@/components/AlmanacWidget';
import AnniversaryWidget from '@/components/AnniversaryWidget';
import { Moon, Sun, Clock, PartyPopper, Sparkles, Globe, FileText, GraduationCap } from 'lucide-react';

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

export default function RightInfoPanel() {
  const { currentYear, currentMonth } = useCalendarStore();

  const taxDeadlines = getTaxDeadlines(currentYear, currentMonth);
  const examEvents = getExamEventsInMonth(currentYear, currentMonth);
  const nextTax = getNextTaxDeadline();
  const nextExam = getNextExamEvent();
  const solarHolidays = getSolarHolidaysInMonth(currentYear, currentMonth);
  const traditionalHolidays = getTraditionalHolidaysInMonth(currentMonth);

  return (
    <div className="flex h-full flex-col gap-3 p-3 overflow-y-auto">
      <YearOverview />
      <YearStats />
      <AlmanacWidget />
      <AnniversaryWidget />

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

      <DateCalculator />
    </div>
  );
}
