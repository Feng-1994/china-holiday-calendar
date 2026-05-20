import { useState } from 'react';
import { addAnniversary, getAnniversaryEmojis } from '@/utils/anniversaryData';
import { X } from 'lucide-react';

interface AnniversaryEditorProps {
  onClose: () => void;
  onChanged: () => void;
}

export default function AnniversaryEditor({ onClose, onChanged }: AnniversaryEditorProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [isLunar, setIsLunar] = useState(false);
  const [lunarMonth, setLunarMonth] = useState(1);
  const [lunarDay, setLunarDay] = useState(1);
  const [emojiIdx, setEmojiIdx] = useState(0);
  const [remind7, setRemind7] = useState(true);
  const [remind3, setRemind3] = useState(true);
  const [remind0, setRemind0] = useState(true);

  const emojis = getAnniversaryEmojis();

  const handleSave = () => {
    if (!title.trim()) return;
    if (!isLunar && !date) return;

    const remindDays: number[] = [];
    if (remind7) remindDays.push(7);
    if (remind3) remindDays.push(3);
    if (remind0) remindDays.push(0);

    addAnniversary({
      title: title.trim(),
      date: isLunar ? `2000-${String(lunarMonth).padStart(2, '0')}-${String(lunarDay).padStart(2, '0')}` : date,
      isLunar,
      lunarMonth: isLunar ? lunarMonth : undefined,
      lunarDay: isLunar ? lunarDay : undefined,
      emoji: emojis[emojiIdx],
      remindDays,
    });

    onChanged();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <>
      <div
        className="absolute inset-0 z-40 backdrop-blur-sm"
        style={{ backgroundColor: 'var(--overlay)' }}
        onClick={onClose}
      />
      <div
        className="absolute left-1/2 top-1/2 z-50 w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-4 shadow-2xl"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--detail-card-bg)' }}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="font-lxgw text-sm font-bold" style={{ color: 'var(--text-primary)' }}>添加纪念日</span>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              {emojis.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => setEmojiIdx(i)}
                  className="text-lg transition-transform"
                  style={{
                    transform: emojiIdx === i ? 'scale(1.3)' : 'scale(1)',
                    opacity: emojiIdx === i ? 1 : 0.5,
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="纪念日名称"
              className="w-full rounded-lg px-3 py-1.5 font-lxgw text-sm outline-none"
              style={{ background: 'var(--bg-cell)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLunar(false)}
              className="rounded-lg px-3 py-1 font-lxgw text-xs transition-colors"
              style={{
                background: !isLunar ? 'var(--vermilion)' : 'var(--bg-cell)',
                color: !isLunar ? '#fff' : 'var(--text-muted)',
              }}
            >
              公历
            </button>
            <button
              onClick={() => setIsLunar(true)}
              className="rounded-lg px-3 py-1 font-lxgw text-xs transition-colors"
              style={{
                background: isLunar ? 'var(--vermilion)' : 'var(--bg-cell)',
                color: isLunar ? '#fff' : 'var(--text-muted)',
              }}
            >
              农历
            </button>
          </div>

          {!isLunar ? (
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full rounded-lg px-3 py-1.5 font-lxgw text-sm outline-none"
              style={{ background: 'var(--bg-cell)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <div className="flex gap-2">
              <select
                value={lunarMonth}
                onChange={e => setLunarMonth(Number(e.target.value))}
                className="flex-1 rounded-lg px-2 py-1.5 font-lxgw text-sm outline-none"
                style={{ background: 'var(--bg-cell)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              >
                {['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'].map((name, i) => (
                  <option key={i} value={i + 1}>{name}月</option>
                ))}
              </select>
              <select
                value={lunarDay}
                onChange={e => setLunarDay(Number(e.target.value))}
                className="flex-1 rounded-lg px-2 py-1.5 font-lxgw text-sm outline-none"
                style={{ background: 'var(--bg-cell)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}日</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <div className="mb-1 font-lxgw text-[10px]" style={{ color: 'var(--text-muted)' }}>提前提醒</div>
            <div className="flex gap-2">
              {[
                { label: '7天', value: remind7, setter: setRemind7 },
                { label: '3天', value: remind3, setter: setRemind3 },
                { label: '当天', value: remind0, setter: setRemind0 },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => item.setter(!item.value)}
                  className="rounded-lg px-2 py-1 font-lxgw text-xs transition-colors"
                  style={{
                    background: item.value ? 'var(--pine-bg)' : 'var(--bg-cell)',
                    color: item.value ? 'var(--pine)' : 'var(--text-muted)',
                    border: `1px solid ${item.value ? 'var(--pine-border)' : 'var(--border-color)'}`,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!title.trim() || (!isLunar && !date)}
            className="w-full rounded-lg py-1.5 font-lxgw text-sm font-medium transition-opacity"
            style={{
              background: 'var(--vermilion)',
              color: '#fff',
              opacity: !title.trim() || (!isLunar && !date) ? 0.5 : 1,
            }}
          >
            保存
          </button>
        </div>
      </div>
    </>
  );
}
