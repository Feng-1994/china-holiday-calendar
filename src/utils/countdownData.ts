export interface CountdownItem {
  id: string;
  title: string;
  targetDate: string;
  color: string;
  createdAt: string;
}

const STORAGE_KEY = 'calendar_countdowns';

const COUNTDOWN_COLORS = [
  '#C53D43', '#E9A319', '#2D6A4F', '#6C5CE7', '#0984E3',
  '#E17055', '#00B894', '#D63031',
];

export function getCountdownColors(): string[] {
  return COUNTDOWN_COLORS;
}

function loadCountdowns(): CountdownItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCountdowns(items: CountdownItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getAllCountdowns(): CountdownItem[] {
  return loadCountdowns().sort((a, b) => a.targetDate.localeCompare(b.targetDate));
}

export function getActiveCountdowns(): (CountdownItem & { daysLeft: number })[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  return loadCountdowns()
    .map(item => {
      const target = new Date(item.targetDate + 'T00:00:00');
      const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...item, daysLeft: diff };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function addCountdown(item: Omit<CountdownItem, 'id' | 'createdAt'>): CountdownItem {
  const items = loadCountdowns();
  const newItem: CountdownItem = {
    ...item,
    id: `cd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveCountdowns(items);
  return newItem;
}

export function deleteCountdown(id: string): void {
  const items = loadCountdowns().filter(item => item.id !== id);
  saveCountdowns(items);
}
