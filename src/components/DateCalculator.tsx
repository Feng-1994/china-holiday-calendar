import { useState, useMemo } from 'react';
import { Calculator, ArrowRightLeft, Plus } from 'lucide-react';

type CalcMode = 'diff' | 'add';

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDateStr(s: string): Date | null {
  const parts = s.split('-');
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(y, m - 1, d);
}

function calcDiff(start: Date, end: Date) {
  const diffMs = end.getTime() - start.getTime();
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const absDays = Math.abs(totalDays);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (totalDays < 0) {
    years = -years;
    months = -months;
    days = -days;
  }

  const weeks = Math.floor(absDays / 7);
  const remainDays = absDays % 7;
  const totalHours = absDays * 24;
  const totalMinutes = totalHours * 60;

  return { totalDays: absDays, years, months, days, weeks, remainDays, totalHours, totalMinutes, isPast: totalDays < 0 };
}

function calcAddDate(base: Date, offset: number, unit: 'day' | 'week' | 'month' | 'year'): Date {
  const result = new Date(base);
  switch (unit) {
    case 'day':
      result.setDate(result.getDate() + offset);
      break;
    case 'week':
      result.setDate(result.getDate() + offset * 7);
      break;
    case 'month':
      result.setMonth(result.getMonth() + offset);
      break;
    case 'year':
      result.setFullYear(result.getFullYear() + offset);
      break;
  }
  return result;
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function DateCalculator() {
  const [mode, setMode] = useState<CalcMode>('diff');
  const [startDate, setStartDate] = useState(formatDateStr(new Date()));
  const [endDate, setEndDate] = useState(formatDateStr(new Date()));
  const [offset, setOffset] = useState(30);
  const [unit, setUnit] = useState<'day' | 'week' | 'month' | 'year'>('day');

  const diffResult = useMemo(() => {
    const s = parseDateStr(startDate);
    const e = parseDateStr(endDate);
    if (!s || !e) return null;
    return calcDiff(s, e);
  }, [startDate, endDate]);

  const addResult = useMemo(() => {
    const s = parseDateStr(startDate);
    if (!s) return null;
    return calcAddDate(s, offset, unit);
  }, [startDate, offset, unit]);

  const unitLabels: Record<string, string> = { day: '天', week: '周', month: '月', year: '年' };

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="h-4 w-4" style={{ color: 'var(--vermilion)' }} />
        <span className="font-lxgw text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>日期计算器</span>
      </div>

      <div className="flex gap-1 mb-3 rounded-lg p-0.5" style={{ background: 'var(--bg-cell)' }}>
        <button
          onClick={() => setMode('diff')}
          className="flex-1 flex items-center justify-center gap-1 rounded-md py-1.5 font-lxgw text-xs transition-all"
          style={{
            background: mode === 'diff' ? 'var(--vermilion-bg)' : 'transparent',
            color: mode === 'diff' ? 'var(--vermilion)' : 'var(--text-muted)',
            border: mode === 'diff' ? '1px solid var(--vermilion-border)' : '1px solid transparent',
          }}
        >
          <ArrowRightLeft className="h-3 w-3" />
          日期差
        </button>
        <button
          onClick={() => setMode('add')}
          className="flex-1 flex items-center justify-center gap-1 rounded-md py-1.5 font-lxgw text-xs transition-all"
          style={{
            background: mode === 'add' ? 'var(--vermilion-bg)' : 'transparent',
            color: mode === 'add' ? 'var(--vermilion)' : 'var(--text-muted)',
            border: mode === 'add' ? '1px solid var(--vermilion-border)' : '1px solid transparent',
          }}
        >
          <Plus className="h-3 w-3" />
          推算日期
        </button>
      </div>

      {mode === 'diff' && (
        <div className="space-y-2">
          <div>
            <label className="font-lxgw text-[10px] block mb-0.5" style={{ color: 'var(--text-muted)' }}>开始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border px-2 py-1.5 font-lxgw text-xs outline-none transition-colors"
              style={{
                borderColor: 'var(--border-color)',
                background: 'var(--bg-cell)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div>
            <label className="font-lxgw text-[10px] block mb-0.5" style={{ color: 'var(--text-muted)' }}>结束日期</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border px-2 py-1.5 font-lxgw text-xs outline-none transition-colors"
              style={{
                borderColor: 'var(--border-color)',
                background: 'var(--bg-cell)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {diffResult && (
            <div className="mt-2 rounded-lg p-3" style={{ background: 'var(--bg-cell)' }}>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-lxgw text-2xl font-black" style={{ color: 'var(--vermilion)' }}>
                  {diffResult.totalDays}
                </span>
                <span className="font-lxgw text-xs" style={{ color: 'var(--text-muted)' }}>天</span>
              </div>
              <div className="space-y-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                {diffResult.years !== 0 && (
                  <div>约 {Math.abs(diffResult.years)}年{Math.abs(diffResult.months)}月{Math.abs(diffResult.days)}日</div>
                )}
                <div>{diffResult.weeks}周{diffResult.remainDays > 0 ? ` ${diffResult.remainDays}天` : ''}</div>
                <div>{diffResult.totalHours.toLocaleString()} 小时</div>
                <div>{diffResult.totalMinutes.toLocaleString()} 分钟</div>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'add' && (
        <div className="space-y-2">
          <div>
            <label className="font-lxgw text-[10px] block mb-0.5" style={{ color: 'var(--text-muted)' }}>基准日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border px-2 py-1.5 font-lxgw text-xs outline-none transition-colors"
              style={{
                borderColor: 'var(--border-color)',
                background: 'var(--bg-cell)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div>
            <label className="font-lxgw text-[10px] block mb-0.5" style={{ color: 'var(--text-muted)' }}>增减量</label>
            <div className="flex gap-1.5">
              <input
                type="number"
                value={offset}
                onChange={(e) => setOffset(parseInt(e.target.value) || 0)}
                className="w-20 rounded-lg border px-2 py-1.5 font-lxgw text-xs outline-none transition-colors"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-cell)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="flex gap-0.5 flex-1">
                {(['day', 'week', 'month', 'year'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className="flex-1 rounded-lg py-1.5 font-lxgw text-[10px] transition-all"
                    style={{
                      background: unit === u ? 'var(--vermilion-bg)' : 'var(--bg-cell)',
                      color: unit === u ? 'var(--vermilion)' : 'var(--text-muted)',
                      border: unit === u ? '1px solid var(--vermilion-border)' : '1px solid var(--border-color)',
                    }}
                  >
                    {unitLabels[u]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {addResult && (
            <div className="mt-2 rounded-lg p-3" style={{ background: 'var(--bg-cell)' }}>
              <div className="font-lxgw text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
                {offset >= 0 ? '之后' : '之前'} {Math.abs(offset)} {unitLabels[unit]}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-lxgw text-lg font-bold" style={{ color: 'var(--vermilion)' }}>
                  {addResult.getFullYear()}年{addResult.getMonth() + 1}月{addResult.getDate()}日
                </span>
              </div>
              <div className="font-lxgw text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                {WEEKDAYS[addResult.getDay()]}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
