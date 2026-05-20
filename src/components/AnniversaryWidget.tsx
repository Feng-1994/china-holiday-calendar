import { useState } from 'react';
import { getAnniversariesWithDays, deleteAnniversary } from '@/utils/anniversaryData';
import AnniversaryEditor from '@/components/AnniversaryEditor';
import { Heart, Plus, X, Moon } from 'lucide-react';

export default function AnniversaryWidget() {
  const [version, setVersion] = useState(0);
  const [showEditor, setShowEditor] = useState(false);

  const anniversaries = getAnniversariesWithDays();

  const handleDelete = (id: string) => {
    deleteAnniversary(id);
    setVersion(v => v + 1);
  };

  const handleChanged = () => {
    setVersion(v => v + 1);
  };

  const getDaysLabel = (days: number, yearsCount: number) => {
    if (days === 0) return '🎉 今天！';
    if (days <= 3) return `${days}天后`;
    if (days <= 7) return `${days}天后`;
    if (yearsCount > 0) return `${days}天后（第${yearsCount}年）`;
    return `${days}天后`;
  };

  const getDaysColor = (days: number) => {
    if (days === 0) return 'var(--vermilion)';
    if (days <= 3) return 'var(--amber)';
    if (days <= 7) return 'var(--pine)';
    return 'var(--text-muted)';
  };

  return (
    <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4" style={{ color: 'var(--vermilion)' }} />
          <span className="font-lxgw text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>纪念日</span>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          className="flex h-5 w-5 items-center justify-center rounded-full transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {anniversaries.length === 0 && !showEditor ? (
        <div className="font-lxgw text-[10px] text-center py-2" style={{ color: 'var(--text-muted)' }}>
          点击 + 添加纪念日
        </div>
      ) : (
        <div className="space-y-1.5">
          {anniversaries.slice(0, 5).map(item => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5"
              style={{ background: 'var(--bg-cell)' }}
            >
              <span className="text-sm flex-shrink-0">{item.emoji}</span>
              <span className="font-lxgw flex-1 truncate text-xs" style={{ color: 'var(--text-primary)' }}>
                {item.title}
              </span>
              {item.isLunar && (
                <Moon className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--amber)', opacity: 0.7 }} />
              )}
              <span
                className="font-lxgw text-[10px] flex-shrink-0 font-medium"
                style={{ color: getDaysColor(item.daysUntil) }}
              >
                {getDaysLabel(item.daysUntil, item.yearsCount)}
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="flex-shrink-0 opacity-30 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {anniversaries.length > 5 && (
            <div className="font-lxgw text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
              还有 {anniversaries.length - 5} 个...
            </div>
          )}
        </div>
      )}

      {showEditor && (
        <AnniversaryEditor
          onClose={() => setShowEditor(false)}
          onChanged={() => {
            handleChanged();
            setShowEditor(false);
          }}
        />
      )}
    </div>
  );
}
