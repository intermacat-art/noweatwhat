import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CategoryName } from '../data/types';
import {
  type HatchedCreature,
  HATCH_THRESHOLD,
  determineCreature,
  getRarity,
} from '../data/creatureData';
import { useDiceStore } from './diceStore';
import { useHistoryStore } from './historyStore';

interface CurrentEgg {
  energy: number;
  categoryBreakdown: Partial<Record<CategoryName, number>>;
  startedAt: string;
}

interface EggState {
  currentEgg: CurrentEgg | null;
  creatures: HatchedCreature[];
  addEnergy: (amount: number, category?: CategoryName) => void;
  startNewEgg: () => void;
  hatch: () => HatchedCreature | null;
}

export const useEggStore = create<EggState>()(
  persist(
    (set, get) => ({
      currentEgg: null,
      creatures: [],

      startNewEgg: () =>
        set({
          currentEgg: {
            energy: 0,
            categoryBreakdown: {},
            startedAt: new Date().toISOString().split('T')[0],
          },
        }),

      addEnergy: (amount, category) =>
        set((s) => {
          if (!s.currentEgg) return s;
          const newEnergy = Math.min(s.currentEgg.energy + amount, HATCH_THRESHOLD);
          const breakdown = { ...s.currentEgg.categoryBreakdown };
          if (category) {
            breakdown[category] = (breakdown[category] ?? 0) + 1;
          }
          return {
            currentEgg: {
              ...s.currentEgg,
              energy: newEnergy,
              categoryBreakdown: breakdown,
            },
          };
        }),

      hatch: () => {
        const { currentEgg } = get();
        if (!currentEgg || currentEgg.energy < HATCH_THRESHOLD) return null;

        const creature = determineCreature(currentEgg.categoryBreakdown);
        const rarity = getRarity(currentEgg.categoryBreakdown);

        const hatched: HatchedCreature = {
          id: `creature-${Date.now()}`,
          creature,
          rarity,
          categoryBreakdown: currentEgg.categoryBreakdown,
          hatchedAt: new Date().toISOString().split('T')[0],
        };

        set((s) => ({
          currentEgg: null,
          creatures: [hatched, ...s.creatures],
        }));

        return hatched;
      },
    }),
    { name: 'egg-storage' }
  )
);

/** Call once at app startup to wire up cross-store energy tracking */
export function initEggSubscriptions() {
  // Track dice rolls
  let prevRollsLen = useDiceStore.getState().rolls.length;
  useDiceStore.subscribe((state) => {
    const newLen = state.rolls.length;
    if (newLen > prevRollsLen) {
      const latest = state.rolls[0];
      useEggStore
        .getState()
        .addEnergy(1, latest?.category as CategoryName | undefined);
    }
    prevRollsLen = newLen;
  });

  // Track check-ins
  let prevVisitsLen = useHistoryStore.getState().visits.length;
  useHistoryStore.subscribe((state) => {
    const newLen = state.visits.length;
    if (newLen > prevVisitsLen) {
      const latest = state.visits[0]; // newest is first
      // Base check-in energy
      useEggStore.getState().addEnergy(3, latest?.category);
      // Bonus if has rating or moodTags
      if (latest?.rating || (latest?.moodTags && latest.moodTags.length > 0)) {
        useEggStore.getState().addEnergy(2);
      }
    }
    prevVisitsLen = newLen;
  });
}
