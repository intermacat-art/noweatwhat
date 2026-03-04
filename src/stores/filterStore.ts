import { create } from 'zustand';
import type { RestaurantTag } from '../data/types';

export type DistanceOption = 100 | 200 | 400 | 1000 | 0;

interface FilterState {
  price: number[];
  tags: RestaurantTag[];
  distance: DistanceOption;
  showModal: boolean;
  togglePrice: (level: number) => void;
  toggleTag: (tag: RestaurantTag) => void;
  setDistance: (d: DistanceOption) => void;
  setShowModal: (show: boolean) => void;
  hasActiveFilters: () => boolean;
}

export const useFilterStore = create<FilterState>()((set, get) => ({
  price: [],
  tags: [],
  distance: 0,
  showModal: false,
  togglePrice: (level) =>
    set((s) => ({
      price: s.price.includes(level)
        ? s.price.filter((p) => p !== level)
        : [...s.price, level],
    })),
  toggleTag: (tag) =>
    set((s) => ({
      tags: s.tags.includes(tag)
        ? s.tags.filter((t) => t !== tag)
        : [...s.tags, tag],
    })),
  setDistance: (d) => set({ distance: d }),
  setShowModal: (show) => set({ showModal: show }),
  hasActiveFilters: () => {
    const s = get();
    return s.price.length > 0 || s.tags.length > 0 || s.distance > 0;
  },
}));
