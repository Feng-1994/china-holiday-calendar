import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light' | 'eye-care';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',

  setTheme: (theme) => {
    set({ theme });
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('calendar-theme', theme);
  },

  cycleTheme: () => {
    const { theme } = get();
    const next: Record<ThemeMode, ThemeMode> = {
      dark: 'light',
      light: 'eye-care',
      'eye-care': 'dark',
    };
    const nextTheme = next[theme];
    set({ theme: nextTheme });
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('calendar-theme', nextTheme);
  },
}));

export function initTheme() {
  const saved = localStorage.getItem('calendar-theme') as ThemeMode | null;
  const theme = saved || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  useThemeStore.setState({ theme });
}

export const THEME_LABELS: Record<ThemeMode, string> = {
  dark: '夜间模式',
  light: '白天模式',
  'eye-care': '护眼模式',
};

export const THEME_ICONS: Record<ThemeMode, string> = {
  dark: '🌙',
  light: '☀️',
  'eye-care': '🌿',
};
