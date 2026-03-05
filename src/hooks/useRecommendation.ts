import { useMemo } from 'react';
import { useHistoryStore } from '../stores/historyStore';
import type { CategoryName } from '../data/types';

interface Recommendation {
  favoriteCategory: CategoryName | null;
  avgPrice: number;
  visitCount: number;
  suggestion: string;
}

/**
 * Analyze user's visit history to generate recommendations
 */
export function useRecommendation(): Recommendation {
  const history = useHistoryStore((s) => s.history);

  return useMemo(() => {
    if (history.length === 0) {
      return {
        favoriteCategory: null,
        avgPrice: 0,
        visitCount: 0,
        suggestion: '開始探索附近美食吧！',
      };
    }

    // Count category frequency
    const catCount: Record<string, number> = {};
    let totalCost = 0;
    let costEntries = 0;

    for (const v of history) {
      catCount[v.category] = (catCount[v.category] || 0) + 1;
      if (v.actualCost && v.actualCost > 0) {
        totalCost += v.actualCost;
        costEntries++;
      } else if (v.cost > 0) {
        totalCost += v.cost;
        costEntries++;
      }
    }

    // Find favorite category
    const sorted = Object.entries(catCount).sort((a, b) => b[1] - a[1]);
    const favoriteCategory = (sorted[0]?.[0] as CategoryName) ?? null;
    const avgPrice = costEntries > 0 ? Math.round(totalCost / costEntries) : 0;

    // Generate suggestion
    let suggestion = '';
    if (history.length >= 5 && favoriteCategory) {
      const lessVisited = sorted.filter(([, count]) => count <= 1).map(([cat]) => cat);
      if (lessVisited.length > 0) {
        suggestion = `你最常吃${favoriteCategory}，要不要試試${lessVisited[0]}？`;
      } else {
        suggestion = `你是${favoriteCategory}愛好者！平均消費 $${avgPrice}`;
      }
    } else if (favoriteCategory) {
      suggestion = `你似乎喜歡${favoriteCategory}，繼續探索吧！`;
    } else {
      suggestion = '多造訪幾家餐廳，我就能給你推薦了！';
    }

    return {
      favoriteCategory,
      avgPrice,
      visitCount: history.length,
      suggestion,
    };
  }, [history]);
}
