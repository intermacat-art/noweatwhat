import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DiceRoll {
  timestamp: number;
  category?: string;
  restaurantName?: string;
}

interface DiceState {
  rolls: DiceRoll[];
  addRoll: (roll: Omit<DiceRoll, 'timestamp'>) => void;
  getWeekRolls: (weekStart: Date) => DiceRoll[];
  getWeekCount: (weekStart: Date) => number;
}

/** Get Monday 00:00 of the week containing the given date */
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + diff);
  return date;
}

const MAX_ROLLS = 200;

export const useDiceStore = create<DiceState>()(
  persist(
    (set, get) => ({
      rolls: [],
      addRoll: (roll) =>
        set((s) => ({
          rolls: [
            { ...roll, timestamp: Date.now() },
            ...s.rolls,
          ].slice(0, MAX_ROLLS),
        })),
      getWeekRolls: (weekStart: Date) => {
        const monday = getMonday(weekStart);
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 7);
        return get().rolls.filter(
          (r) => r.timestamp >= monday.getTime() && r.timestamp < sunday.getTime()
        );
      },
      getWeekCount: (weekStart: Date) => {
        return get().getWeekRolls(weekStart).length;
      },
    }),
    { name: 'dice-storage' }
  )
);

export { getMonday };
