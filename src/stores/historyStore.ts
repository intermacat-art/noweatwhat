import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Restaurant, VisitHistory } from '../data/types';

interface CheckInData {
  restaurantId?: number;
  name: string;
  category: VisitHistory['category'];
  image?: string;
  rating?: number;
  photoId?: string;
  actualCost?: number;
  moodTags?: string[];
  quote?: string;
}

interface HistoryState {
  visits: VisitHistory[];
  addVisit: (restaurant: Restaurant) => void;
  addCheckIn: (data: CheckInData) => string;
  updateVisit: (id: string, updates: Partial<VisitHistory>) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      visits: [
        {
          id: 'init-1',
          restaurantId: 3,
          name: '五燈獎豬腳飯',
          category: '小吃',
          date: '2026-02-01',
          count: 3,
          cost: 450,
          image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
        },
        {
          id: 'init-2',
          restaurantId: 7,
          name: 'Second Floor 貳樓',
          category: '法式',
          date: '2026-02-05',
          count: 1,
          cost: 600,
          image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
        },
      ],
      addVisit: (restaurant) =>
        set((s) => ({
          visits: [
            {
              id: `visit-${Date.now()}`,
              restaurantId: restaurant.id,
              name: restaurant.name,
              category: restaurant.category,
              date: new Date().toISOString().split('T')[0],
              count: 1,
              cost: restaurant.priceLevel * 250,
              image: restaurant.image,
            },
            ...s.visits,
          ],
        })),
      addCheckIn: (data) => {
        const id = `checkin-${Date.now()}`;
        set((s) => ({
          visits: [
            {
              id,
              restaurantId: data.restaurantId ?? 0,
              name: data.name,
              category: data.category,
              date: new Date().toISOString().split('T')[0],
              count: 1,
              cost: data.actualCost ?? 0,
              image: data.image,
              rating: data.rating,
              photo: data.photoId,
              actualCost: data.actualCost,
              moodTags: data.moodTags,
              quote: data.quote,
            },
            ...s.visits,
          ],
        }));
        return id;
      },
      updateVisit: (id, updates) =>
        set((s) => ({
          visits: s.visits.map((v) =>
            v.id === id ? { ...v, ...updates } : v
          ),
        })),
    }),
    { name: 'history-storage' }
  )
);
