import type { CategoryName } from './types';

export interface Creature {
  id: string;
  emoji: string;
  name: string;
  nameEn: string;
  category: CategoryName;
}

export type Rarity = 'normal' | 'rare' | 'legendary';

export interface HatchedCreature {
  id: string;
  creature: Creature;
  rarity: Rarity;
  categoryBreakdown: Partial<Record<CategoryName, number>>;
  hatchedAt: string; // ISO date
}

export interface EggStage {
  phase: 0 | 1 | 2 | 3 | 4;
  label: string;
}

export const CREATURES: Creature[] = [
  { id: 'japanese', emoji: '🐡', name: '河豚寶寶', nameEn: 'Blowfish Baby', category: '日式' },
  { id: 'chinese', emoji: '🐉', name: '小龍龍', nameEn: 'Little Dragon', category: '中式' },
  { id: 'steak', emoji: '🐂', name: '牛排牛', nameEn: 'Steak Ox', category: '牛排' },
  { id: 'buffet', emoji: '🐷', name: '吃飽豬', nameEn: 'Buffet Piggy', category: '吃到飽' },
  { id: 'french', emoji: '🐓', name: '法式雞', nameEn: 'French Rooster', category: '法式' },
  { id: 'bento', emoji: '🐱', name: '便當貓', nameEn: 'Bento Cat', category: '便當' },
  { id: 'donburi', emoji: '🐻', name: '丼飯熊', nameEn: 'Donburi Bear', category: '丼飯' },
  { id: 'ramen', emoji: '🦊', name: '拉麵狐狸', nameEn: 'Ramen Fox', category: '拉麵' },
  { id: 'beefnoodle', emoji: '🐮', name: '牛肉牛', nameEn: 'Beef Noodle Cow', category: '牛肉麵' },
  { id: 'snack', emoji: '🐹', name: '小吃鼠', nameEn: 'Snack Hamster', category: '小吃' },
];

export const HATCH_THRESHOLD = 15;

export function getEggStage(energy: number): EggStage {
  const pct = Math.min(energy / HATCH_THRESHOLD, 1);
  if (pct >= 1) return { phase: 4, label: '準備孵化！' };
  if (pct >= 0.75) return { phase: 3, label: '快了快了！' };
  if (pct >= 0.5) return { phase: 2, label: '有動靜了...' };
  if (pct >= 0.25) return { phase: 1, label: '好像有裂痕' };
  return { phase: 0, label: '靜靜等待中' };
}

export function getRarity(categoryBreakdown: Partial<Record<CategoryName, number>>): Rarity {
  const count = Object.keys(categoryBreakdown).length;
  if (count >= 6) return 'legendary';
  if (count >= 3) return 'rare';
  return 'normal';
}

export const RARITY_LABELS: Record<Rarity, { label: string; color: string }> = {
  normal: { label: '普通', color: 'text-slate-500' },
  rare: { label: '稀有', color: 'text-blue-500' },
  legendary: { label: '傳說', color: 'text-amber-500' },
};

export function determineCreature(
  categoryBreakdown: Partial<Record<CategoryName, number>>
): Creature {
  let topCategory: CategoryName = '小吃';
  let topCount = 0;
  for (const [cat, count] of Object.entries(categoryBreakdown)) {
    if (count! > topCount) {
      topCount = count!;
      topCategory = cat as CategoryName;
    }
  }
  return CREATURES.find((c) => c.category === topCategory) ?? CREATURES[9];
}
