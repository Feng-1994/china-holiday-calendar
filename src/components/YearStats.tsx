import { getYearStats, type YearStats } from '@/utils/holidayData';
import { useCalendarStore } from '@/hooks/useCalendarStore';
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';

interface StatBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
  unit?: string;
}

function StatBar({ label, value, total, color, unit = '天' }: StatBarProps) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="font-lxgw w-14 flex-shrink-0 text-[10px] text-right" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--bg-cell)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.8 }}
        />
      </div>
      <span className="font-lxgw w-12 flex-shrink-0 text-[10px] text-right" style={{ color }}>
        {value}{unit}
      </span>
    </div>
  );
}

export default function YearStats() {
  const { currentYear } = useCalendarStore();
  const [expanded, setExpanded] = useState(false);

  const stats: YearStats = useMemo(() => getYearStats(currentYear), [currentYear]);

  const restPct = stats.totalDays > 0 ? ((stats.actualRestDays / stats.totalDays) * 100).toFixed(1) : '0';
  const workPct = stats.totalDays > 0 ? ((stats.actualWorkdays / stats.totalDays) * 100).toFixed(1) : '0';

  return (
    <div className="rounded-xl border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-3"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" style={{ color: 'var(--pine)' }} />
          <span className="font-lxgw text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {currentYear}年统计
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-lxgw text-xs" style={{ color: 'var(--pine)' }}>
            休{stats.actualRestDays}天
          </span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
          )}
        </div>
      </button>

      {expanded && (
        <div className="space-y-3 px-3 pb-3">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="font-lxgw text-lg font-bold" style={{ color: 'var(--pine)' }}>
                {stats.actualRestDays}
              </div>
              <div className="font-lxgw text-[9px]" style={{ color: 'var(--text-muted)' }}>休息天数</div>
            </div>
            <div className="font-lxgw text-xl font-light" style={{ color: 'var(--text-muted)', opacity: 0.3 }}>|</div>
            <div className="text-center">
              <div className="font-lxgw text-lg font-bold" style={{ color: 'var(--amber)' }}>
                {stats.actualWorkdays}
              </div>
              <div className="font-lxgw text-[9px]" style={{ color: 'var(--text-muted)' }}>工作天数</div>
            </div>
            <div className="font-lxgw text-xl font-light" style={{ color: 'var(--text-muted)', opacity: 0.3 }}>|</div>
            <div className="text-center">
              <div className="font-lxgw text-lg font-bold" style={{ color: 'var(--text-secondary)' }}>
                {stats.totalDays}
              </div>
              <div className="font-lxgw text-[9px]" style={{ color: 'var(--text-muted)' }}>全年总天数</div>
            </div>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: 'var(--bg-cell)' }}>
            <div className="flex h-full">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${parseFloat(restPct)}%`,
                  backgroundColor: 'var(--pine)',
                  opacity: 0.6,
                }}
              />
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${parseFloat(workPct)}%`,
                  backgroundColor: 'var(--amber)',
                  opacity: 0.6,
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-lxgw text-[9px]" style={{ color: 'var(--pine)', opacity: 0.7 }}>
              休息 {restPct}%
            </span>
            <span className="font-lxgw text-[9px]" style={{ color: 'var(--amber)', opacity: 0.7 }}>
              工作 {workPct}%
            </span>
          </div>

          <div className="space-y-1.5">
            <StatBar label="法定假日" value={stats.holidayRestDays} total={stats.totalDays} color="var(--vermilion)" />
            <StatBar label="周末休息" value={stats.weekendDays} total={stats.totalDays} color="var(--pine)" />
            <StatBar label="调休补班" value={stats.holidayWorkDays} total={stats.totalDays} color="var(--amber)" />
            <StatBar label="正常工作" value={stats.normalWorkdays} total={stats.totalDays} color="var(--text-muted)" />
          </div>
        </div>
      )}
    </div>
  );
}
