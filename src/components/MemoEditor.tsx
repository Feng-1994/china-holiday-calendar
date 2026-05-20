import { useState } from 'react';
import { Plus, Trash2, X, Calendar, Moon } from 'lucide-react';
import { addMemo, deleteMemo, getMemoColors, getMemosForDate, type MemoItem } from '@/utils/memoData';

interface MemoEditorProps {
  date: string;
  onClose: () => void;
  onChanged: () => void;
}

export default function MemoEditor({ date, onClose, onChanged }: MemoEditorProps) {
  const [memos, setMemos] = useState<MemoItem[]>(() => getMemosForDate(date));
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(getMemoColors()[0]);
  const [isLunar, setIsLunar] = useState(false);
  const colors = getMemoColors();

  const dateParts = date.split('-');
  const displayDate = `${dateParts[0]}年${parseInt(dateParts[1])}月${parseInt(dateParts[2])}日`;

  const handleAdd = () => {
    if (!title.trim()) return;
    addMemo({
      date,
      title: title.trim(),
      color,
      isLunar,
    });
    setTitle('');
    setMemos(getMemosForDate(date));
    onChanged();
  };

  const handleDelete = (id: string) => {
    deleteMemo(id);
    setMemos(getMemosForDate(date));
    onChanged();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-80 rounded-2xl border p-5 shadow-2xl"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" style={{ color: 'var(--vermilion)' }} />
            <span className="font-lxgw text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {displayDate}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {memos.length > 0 && (
          <div className="mb-4 space-y-2">
            {memos.map((memo) => (
              <div
                key={memo.id}
                className="flex items-center gap-2 rounded-xl border p-2.5"
                style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}
              >
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: memo.color }}
                />
                <span className="font-lxgw flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                  {memo.title}
                </span>
                {memo.isLunar && (
                  <Moon className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--amber)' }} />
                )}
                <button
                  onClick={() => handleDelete(memo.id)}
                  className="flex-shrink-0 rounded p-0.5 transition-colors hover:opacity-70"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入备忘内容..."
            className="w-full rounded-xl border px-3 py-2 font-lxgw text-sm outline-none transition-colors"
            style={{
              borderColor: 'var(--border-color)',
              background: 'var(--bg-cell)',
              color: 'var(--text-primary)',
            }}
            autoFocus
          />

          <div className="flex items-center gap-2">
            <span className="font-lxgw text-xs" style={{ color: 'var(--text-muted)' }}>颜色</span>
            <div className="flex gap-1.5">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="h-5 w-5 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    border: color === c ? '2px solid white' : '2px solid transparent',
                    boxShadow: color === c ? `0 0 0 1px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className="relative h-5 w-9 rounded-full transition-colors"
              style={{ background: isLunar ? 'var(--vermilion)' : 'var(--bg-cell)' }}
              onClick={() => setIsLunar(!isLunar)}
            >
              <div
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm"
                style={{ left: isLunar ? '18px' : '2px' }}
              />
            </div>
            <div className="flex items-center gap-1">
              <Moon className="h-3.5 w-3.5" style={{ color: isLunar ? 'var(--vermilion)' : 'var(--text-muted)' }} />
              <span className="font-lxgw text-xs" style={{ color: isLunar ? 'var(--vermilion)' : 'var(--text-muted)' }}>
                按农历每年重复
              </span>
            </div>
          </label>

          <button
            onClick={handleAdd}
            disabled={!title.trim()}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 font-lxgw text-sm transition-colors hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--vermilion)', color: 'white' }}
          >
            <Plus className="h-4 w-4" />
            添加备忘
          </button>
        </div>
      </div>
    </div>
  );
}
