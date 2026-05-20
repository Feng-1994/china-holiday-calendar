import { useState } from 'react';
import { getActiveCountdowns, addCountdown, deleteCountdown, getCountdownColors } from '@/utils/countdownData';
import { Timer, Plus, X } from 'lucide-react';

export default function CountdownWidget() {
  const [version, setVersion] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [colorIdx, setColorIdx] = useState(0);

  const countdowns = getActiveCountdowns();
  const colors = getCountdownColors();

  const handleAdd = () => {
    if (!title.trim() || !targetDate) return;
    addCountdown({
      title: title.trim(),
      targetDate,
      color: colors[colorIdx],
    });
    setTitle('');
    setTargetDate('');
    setColorIdx(0);
    setShowAdd(false);
    setVersion(v => v + 1);
  };

  const handleDelete = (id: string) => {
    deleteCountdown(id);
    setVersion(v => v + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') setShowAdd(false);
  };

  return (
    <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
          <span className="font-lxgw text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>倒计时</span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex h-5 w-5 items-center justify-center rounded-full transition-colors"
          style={{ color: 'var(--text-muted)', background: showAdd ? 'var(--bg-cell)' : 'transparent' }}
        >
          {showAdd ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </button>
      </div>

      {showAdd && (
        <div className="mb-2 space-y-2 rounded-lg p-2" style={{ background: 'var(--bg-cell)' }}>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="事项名称"
            className="w-full rounded-md px-2 py-1 font-lxgw text-xs outline-none"
            style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <input
            type="date"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
            className="w-full rounded-md px-2 py-1 font-lxgw text-xs outline-none"
            style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-1.5">
            {colors.map((c, i) => (
              <button
                key={i}
                onClick={() => setColorIdx(i)}
                className="h-4 w-4 rounded-full transition-transform"
                style={{
                  backgroundColor: c,
                  transform: colorIdx === i ? 'scale(1.3)' : 'scale(1)',
                  outline: colorIdx === i ? '2px solid var(--text-primary)' : 'none',
                  outlineOffset: '1px',
                }}
              />
            ))}
          </div>
          <button
            onClick={handleAdd}
            disabled={!title.trim() || !targetDate}
            className="w-full rounded-md px-2 py-1 font-lxgw text-xs transition-opacity"
            style={{
              background: 'var(--vermilion)',
              color: '#fff',
              opacity: !title.trim() || !targetDate ? 0.5 : 1,
            }}
          >
            添加
          </button>
        </div>
      )}

      {countdowns.length === 0 && !showAdd ? (
        <div className="font-lxgw text-[10px] text-center py-2" style={{ color: 'var(--text-muted)' }}>
          点击 + 添加倒计时
        </div>
      ) : (
        <div className="space-y-1.5">
          {countdowns.slice(0, 5).map(item => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5"
              style={{ background: 'var(--bg-cell)' }}
            >
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-lxgw flex-1 truncate text-xs" style={{ color: 'var(--text-primary)' }}>
                {item.title}
              </span>
              <span className="font-lxgw text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                {item.targetDate.slice(5).replace(/-/g, '/')}
              </span>
              <span
                className="font-lxgw text-xs font-bold flex-shrink-0"
                style={{
                  color: item.daysLeft <= 0 ? 'var(--vermilion)' : item.daysLeft <= 7 ? 'var(--amber)' : 'var(--pine)',
                }}
              >
                {item.daysLeft === 0 ? '今天' : item.daysLeft < 0 ? `过${Math.abs(item.daysLeft)}天` : `${item.daysLeft}天`}
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="flex-shrink-0 opacity-40 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {countdowns.length > 5 && (
            <div className="font-lxgw text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
              还有 {countdowns.length - 5} 个...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
