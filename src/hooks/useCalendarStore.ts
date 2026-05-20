import { create } from 'zustand';

interface CalendarState {
  currentYear: number;
  currentMonth: number;
  selectedDate: string | null;
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  goToday: () => void;
  selectDate: (date: string | null) => void;
}

const now = new Date();

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentYear: now.getFullYear(),
  currentMonth: now.getMonth() + 1,
  selectedDate: null,

  setYear: (year) => set({ currentYear: year }),
  setMonth: (month) => set({ currentMonth: month }),

  prevMonth: () => {
    const { currentYear, currentMonth } = get();
    if (currentMonth === 1) {
      set({ currentYear: currentYear - 1, currentMonth: 12 });
    } else {
      set({ currentMonth: currentMonth - 1 });
    }
  },

  nextMonth: () => {
    const { currentYear, currentMonth } = get();
    if (currentMonth === 12) {
      set({ currentYear: currentYear + 1, currentMonth: 1 });
    } else {
      set({ currentMonth: currentMonth + 1 });
    }
  },

  goToday: () => {
    const now = new Date();
    set({ currentYear: now.getFullYear(), currentMonth: now.getMonth() + 1, selectedDate: null });
  },

  selectDate: (date) => set({ selectedDate: date }),
}));
