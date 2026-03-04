import { create } from 'zustand';
import type { RestaurantTag } from '../data/types';

interface FilterState {
  price: number[];
  tags: RestaurantTag[];
  showModal: boolean;
  togglePrice: (level: number) => void;
  toggleTag: (tag: RestaurantTag) => void;
  setShowModal: (show: boolean) => void;
  hasActiveFilters: () => boolean;
}

export const useFilterStore = create<FilterState>()((set, get) => ({
  price: [],
  tags: [],
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
  setShowModal: (show) => set({ showModal: show }),
  hasActiveFilters: () => {
    const s = get();
    return s.price.length > 0 || s.tags.length > 0;
  },
}));
