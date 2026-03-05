import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChallengeDay {
  day: number;
  date: string; // YYYY-MM-DD
  restaurantName: string;
  restaurantImage: string;
  rating: number;
  priceStr: string;
  dist: string;
  placeId?: string;
  category?: string;
}

interface ChallengeState {
  active: boolean;
  startDate: string | null;
  days: ChallengeDay[];
  // Actions
  startChallenge: () => void;
  addDay: (entry: Omit<ChallengeDay, 'day' | 'date'>) => void;
  endChallenge: () => void;
  getCurrentStreak: () => number;
  getTodayEntry: () => ChallengeDay | null;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      active: false,
      startDate: null,
      days: [],

      startChallenge: () => {
        set({ active: true, startDate: todayStr(), days: [] });
      },

      addDay: (entry) => {
        const state = get();
        if (!state.active) return;
        const today = todayStr();
        // Don't add duplicate for same day
        if (state.days.some((d) => d.date === today)) return;
        const newDay: ChallengeDay = {
          ...entry,
          day: state.days.length + 1,
          date: today,
        };
        set({ days: [...state.days, newDay] });
      },

      endChallenge: () => {
        set({ active: false });
      },

      getCurrentStreak: () => {
        const { days } = get();
        if (days.length === 0) return 0;
        // Check consecutive days from the end
        let streak = 1;
        for (let i = days.length - 1; i > 0; i--) {
          const curr = new Date(days[i].date);
          const prev = new Date(days[i - 1].date);
          const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
          if (diff <= 1) streak++;
          else break;
        }
        return streak;
      },

      getTodayEntry: () => {
        const today = todayStr();
        return get().days.find((d) => d.date === today) ?? null;
      },
    }),
    { name: 'challenge-storage' }
  )
);
