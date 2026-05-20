export interface MemoItem {
  id: string;
  date: string;
  title: string;
  color: string;
  isLunar: boolean;
  lunarMonth?: number;
  lunarDay?: number;
  createdAt: string;
}

const STORAGE_KEY = 'calendar_memos';

const MEMO_COLORS = [
  '#C53D43',
  '#E9A319',
  '#2D6A4F',
  '#6C5CE7',
  '#0984E3',
  '#E17055',
  '#00B894',
  '#D63031',
];

export function getMemoColors(): string[] {
  return MEMO_COLORS;
}

function loadMemos(): MemoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveMemos(memos: MemoItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
}

export function getAllMemos(): MemoItem[] {
  return loadMemos();
}

export function getMemosForDate(dateStr: string): MemoItem[] {
  const memos = loadMemos();
  const solarMemos = memos.filter(m => !m.isLunar && m.date === dateStr);

  const lunarMemos = memos.filter(item => {
    if (!item.isLunar || !item.lunarMonth || !item.lunarDay) return false;
    const { getLunarInfo } = require('@/utils/lunarCalendar');
    const [y, monthNum, dayNum] = dateStr.split('-').map(Number);
    const lunar = getLunarInfo(y, monthNum, dayNum);
    return lunar.lunarMonth === item.lunarMonth && lunar.lunarDay === item.lunarDay;
  });

  return [...solarMemos, ...lunarMemos];
}

export function getMemosForMonth(year: number, month: number): Map<string, MemoItem[]> {
  const memos = loadMemos();
  const result = new Map<string, MemoItem[]>();
  const monthStr = `-${String(month).padStart(2, '0')}-`;

  for (const memo of memos) {
    if (memo.isLunar) continue;
    if (!memo.date.includes(monthStr)) continue;
    const existing = result.get(memo.date) || [];
    existing.push(memo);
    result.set(memo.date, existing);
  }

  for (const memo of memos) {
    if (!memo.isLunar || !memo.lunarMonth || !memo.lunarDay) continue;
    if (memo.lunarMonth !== month) continue;
    const { getLunarInfo } = require('@/utils/lunarCalendar');
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const lunar = getLunarInfo(year, month, d);
      if (lunar.lunarMonth === memo.lunarMonth && lunar.lunarDay === memo.lunarDay) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const existing = result.get(dateStr) || [];
        if (!existing.some(existingItem => existingItem.id === memo.id)) {
          existing.push(memo);
          result.set(dateStr, existing);
        }
      }
    }
  }

  return result;
}

export function addMemo(memo: Omit<MemoItem, 'id' | 'createdAt'>): MemoItem {
  const memos = loadMemos();
  const newMemo: MemoItem = {
    ...memo,
    id: `memo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  memos.push(newMemo);
  saveMemos(memos);
  return newMemo;
}

export function deleteMemo(id: string): void {
  const memos = loadMemos().filter(m => m.id !== id);
  saveMemos(memos);
}

export function updateMemo(id: string, updates: Partial<Omit<MemoItem, 'id' | 'createdAt'>>): void {
  const memos = loadMemos();
  const idx = memos.findIndex(m => m.id === id);
  if (idx !== -1) {
    memos[idx] = { ...memos[idx], ...updates };
    saveMemos(memos);
  }
}
