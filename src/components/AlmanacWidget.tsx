import { useState, useEffect } from 'react';
import { getCurrentShichen, getAlmanac } from '@/utils/almanac';
import { Clock, Sun, Moon } from 'lucide-react';

export default function AlmanacWidget() {
  const [shichen, setShichen] = useState(getCurrentShichen());
  const now = new Date();
  const almanac = getAlmanac(now.getFullYear(), now.getMonth() + 1, now.getDate());

  useEffect(() => {
    const timer = setInterval(() => {
      setShichen(getCurrentShichen());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
      <div className="mb-2 flex items-center gap-2">
        <Clock className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
        <span className="font-lxgw text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>时辰 · 宜忌</span>
      </div>

      <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2" style={{ background: 'var(--bg-cell)' }}>
        <div className="flex flex-col items-center">
          <span className="font-lxgw text-lg font-bold" style={{ color: 'var(--vermilion)' }}>{shichen.name}</span>
          <span className="font-lxgw text-[10px]" style={{ color: 'var(--text-muted)' }}>{shichen.alias}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-lxgw text-[10px]" style={{ color: 'var(--text-muted)' }}>{shichen.period}</span>
          <span className="font-lxgw text-[10px]" style={{ color: 'var(--text-muted)' }}>{almanac.dayGanZhi}</span>
        </div>
      </div>

      <div className="mb-1.5 flex items-center gap-1.5">
        <Sun className="h-3 w-3" style={{ color: 'var(--pine)' }} />
        <span className="font-lxgw text-[10px] font-medium" style={{ color: 'var(--pine)' }}>宜</span>
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        {almanac.yi.map((item, idx) => (
          <span
            key={idx}
            className="rounded px-1.5 py-0.5 font-lxgw text-[10px]"
            style={{ background: 'rgba(45, 106, 79, 0.1)', color: 'var(--pine)' }}
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mb-1.5 flex items-center gap-1.5">
        <Moon className="h-3 w-3" style={{ color: 'var(--vermilion)' }} />
        <span className="font-lxgw text-[10px] font-medium" style={{ color: 'var(--vermilion)' }}>忌</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {almanac.ji.map((item, idx) => (
          <span
            key={idx}
            className="rounded px-1.5 py-0.5 font-lxgw text-[10px]"
            style={{ background: 'rgba(197, 61, 67, 0.1)', color: 'var(--vermilion)' }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
