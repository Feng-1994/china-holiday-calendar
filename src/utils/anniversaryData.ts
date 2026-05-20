export interface AnniversaryItem {
  id: string;
  title: string;
  date: string;
  isLunar: boolean;
  lunarMonth?: number;
  lunarDay?: number;
  emoji: string;
  remindDays: number[];
  createdAt: string;
}

const STORAGE_KEY = 'calendar_anniversaries';

const ANNIVERSARY_EMOJIS = ['🎂', '💍', '💕', '🎓', '🏠', '👶', '🐾', '🌟', '🎁', '🎊'];

export function getAnniversaryEmojis(): string[] {
  return ANNIVERSARY_EMOJIS;
}

function loadAnniversaries(): AnniversaryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveAnniversaries(items: AnniversaryItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getAllAnniversaries(): AnniversaryItem[] {
  return loadAnniversaries();
}

function getNextLunarDate(lunarMonth: number, lunarDay: number): { date: Date; daysUntil: number } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const currentYear = now.getFullYear();

  const { getLunarInfo } = require('@/utils/lunarCalendar');

  for (let year = currentYear; year <= currentYear + 2; year++) {
    const daysInMonth = new Date(year, 12, 0).getDate();
    for (let m = 1; m <= 12; m++) {
      const days = new Date(year, m, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const lunar = getLunarInfo(year, m, d);
        if (lunar.lunarMonth === lunarMonth && lunar.lunarDay === lunarDay) {
          const target = new Date(year, m - 1, d);
          target.setHours(0, 0, 0, 0);
          const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diff >= 0) {
            return { date: target, daysUntil: diff };
          }
        }
      }
    }
  }

  return { date: new Date(), daysUntil: 999 };
}

export interface AnniversaryWithDays extends AnniversaryItem {
  nextDate: string;
  daysUntil: number;
  yearsCount: number;
}

export function getAnniversariesWithDays(): AnniversaryWithDays[] {
  const items = loadAnniversaries();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const result: AnniversaryWithDays[] = items.map(item => {
    if (item.isLunar && item.lunarMonth && item.lunarDay) {
      const { date, daysUntil } = getNextLunarDate(item.lunarMonth, item.lunarDay);
      const originDate = new Date(item.date + 'T00:00:00');
      let yearsCount = date.getFullYear() - originDate.getFullYear();
      if (yearsCount < 0) yearsCount = 0;
      return {
        ...item,
        nextDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        daysUntil,
        yearsCount,
      };
    }

    const originDate = new Date(item.date + 'T00:00:00');
    const currentYear = now.getFullYear();
    let targetYear = currentYear;

    let target = new Date(targetYear, originDate.getMonth(), originDate.getDate());
    target.setHours(0, 0, 0, 0);

    if (target.getTime() < now.getTime()) {
      targetYear++;
      target = new Date(targetYear, originDate.getMonth(), originDate.getDate());
      target.setHours(0, 0, 0, 0);
    }

    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let yearsCount = targetYear - originDate.getFullYear();
    if (yearsCount < 0) yearsCount = 0;

    return {
      ...item,
      nextDate: `${targetYear}-${String(originDate.getMonth() + 1).padStart(2, '0')}-${String(originDate.getDate()).padStart(2, '0')}`,
      daysUntil: diff,
      yearsCount,
    };
  });

  result.sort((a, b) => a.daysUntil - b.daysUntil);
  return result;
}

export function addAnniversary(item: Omit<AnniversaryItem, 'id' | 'createdAt'>): AnniversaryItem {
  const items = loadAnniversaries();
  const newItem: AnniversaryItem = {
    ...item,
    id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveAnniversaries(items);
  return newItem;
}

export function deleteAnniversary(id: string): void {
  const items = loadAnniversaries().filter(item => item.id !== id);
  saveAnniversaries(items);
}

export function updateAnniversary(id: string, updates: Partial<Omit<AnniversaryItem, 'id' | 'createdAt'>>): void {
  const items = loadAnniversaries();
  const idx = items.findIndex(item => item.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates };
    saveAnniversaries(items);
  }
}
