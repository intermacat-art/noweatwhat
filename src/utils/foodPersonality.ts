import type { VisitHistory } from '../data/types';

interface DiceRoll {
  timestamp: number;
  category?: string;
  restaurantName?: string;
}

export interface PersonalityStats {
  totalVisits: number;
  diceCount: number;
  categoryCount: number;
  newRate: number;
  avgCost: number;
  topCategory: string;
  avgRating: number | null;
  topMoodTag: string | null;
}

export interface PersonalityResult {
  type: 'explorer' | 'regular' | 'luxe' | 'value' | 'fan' | 'dice' | 'beginner';
  emoji: string;
  name: string;
  nameEn: string;
  description: string;
  stats: PersonalityStats;
}

function computeStats(visits: VisitHistory[], rolls: DiceRoll[]): PersonalityStats {
  const totalVisits = visits.length;
  const diceCount = rolls.length;

  const categories = new Set(visits.map((v) => v.category));
  const categoryCount = categories.size;

  const uniqueNames = new Set(visits.map((v) => v.name));
  const newRate = totalVisits > 0 ? uniqueNames.size / totalVisits : 0;

  const totalCost = visits.reduce((a, v) => a + (v.actualCost ?? v.cost), 0);
  const avgCost = totalVisits > 0 ? totalCost / totalVisits : 0;

  // Top category
  const catMap = new Map<string, number>();
  visits.forEach((v) => catMap.set(v.category, (catMap.get(v.category) || 0) + 1));
  let topCategory = '';
  let topCatCount = 0;
  catMap.forEach((count, name) => {
    if (count > topCatCount) {
      topCategory = name;
      topCatCount = count;
    }
  });

  // Average rating
  const rated = visits.filter((v) => v.rating != null && v.rating > 0);
  const avgRating = rated.length > 0
    ? Math.round((rated.reduce((a, v) => a + v.rating!, 0) / rated.length) * 10) / 10
    : null;

  // Top mood tag
  const tagMap = new Map<string, number>();
  visits.forEach((v) => {
    v.moodTags?.forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1));
  });
  let topMoodTag: string | null = null;
  let topTagCount = 0;
  tagMap.forEach((count, tag) => {
    if (count > topTagCount) {
      topMoodTag = tag;
      topTagCount = count;
    }
  });

  return { totalVisits, diceCount, categoryCount, newRate, avgCost, topCategory, avgRating, topMoodTag };
}

export function calculatePersonality(visits: VisitHistory[], rolls: DiceRoll[]): PersonalityResult {
  const stats = computeStats(visits, rolls);
  const { totalVisits, diceCount, categoryCount, newRate, avgCost, topCategory, topMoodTag } = stats;

  // Not enough data
  if (totalVisits < 3) {
    return {
      type: 'beginner',
      emoji: '🍽️',
      name: '美食新手',
      nameEn: 'The Beginner',
      description: '旅程才剛開始，每一口都是新發現',
      stats,
    };
  }

  // Priority 6: Dice Master — diceCount > totalVisits * 1.5
  if (diceCount > totalVisits * 1.5) {
    return {
      type: 'dice',
      emoji: '🎲',
      name: '命運骰子手',
      nameEn: 'Dice Master',
      description: '把選擇交給命運，享受未知的刺激',
      stats,
    };
  }

  // Priority 5: Category Fan — single category > 50%
  const catMap = new Map<string, number>();
  visits.forEach((v) => catMap.set(v.category, (catMap.get(v.category) || 0) + 1));
  let fanCategory = '';
  let fanCount = 0;
  catMap.forEach((count, name) => {
    if (count > fanCount) {
      fanCategory = name;
      fanCount = count;
    }
  });
  if (fanCount / totalVisits > 0.5) {
    return {
      type: 'fan',
      emoji: '🍜',
      name: `${fanCategory}狂粉`,
      nameEn: 'Category Fan',
      description: `對${fanCategory}的愛無人能及，你是真正的專家`,
      stats,
    };
  }

  // Priority 1: Food Explorer — categories >= 6 AND newRate >= 60%
  if (categoryCount >= 6 && newRate >= 0.6) {
    return {
      type: 'explorer',
      emoji: '🗺️',
      name: '冒險美食家',
      nameEn: 'Food Explorer',
      description: '你的胃就是你的護照，永遠在探索新領地',
      stats,
    };
  }

  // Priority 3: The Luxe — avgCost >= 500 OR 環境好/服務好 tags high
  const luxeTags = ['環境好', '服務好'];
  let luxeTagCount = 0;
  visits.forEach((v) => {
    if (v.moodTags?.some((t) => luxeTags.includes(t))) luxeTagCount++;
  });
  if (avgCost >= 500 || luxeTagCount / totalVisits >= 0.4) {
    return {
      type: 'luxe',
      emoji: '💎',
      name: '享樂主義者',
      nameEn: 'The Luxe',
      description: '吃飯不只是填飽肚子，是一場感官饗宴',
      stats,
    };
  }

  // Priority 4: Value Hunter — avgCost < 300 OR CP值高 is top tag
  if (avgCost < 300 || topMoodTag === 'CP值高') {
    return {
      type: 'value',
      emoji: '💰',
      name: '精打細算王',
      nameEn: 'Value Hunter',
      description: '花最少的錢吃最好的料理，你是 CP 值之神',
      stats,
    };
  }

  // Priority 2: The Regular — revisit rate > 40%
  const uniqueNames = new Set(visits.map((v) => v.name));
  const revisitRate = (totalVisits - uniqueNames.size) / totalVisits;
  if (revisitRate > 0.4) {
    return {
      type: 'regular',
      emoji: '🏠',
      name: '忠實老饕',
      nameEn: 'The Regular',
      description: '找到好店就不放手，你是餐廳老闆最愛的客人',
      stats,
    };
  }

  // Fallback
  return {
    type: 'beginner',
    emoji: '🍽️',
    name: '美食新手',
    nameEn: 'The Beginner',
    description: '旅程才剛開始，每一口都是新發現',
    stats,
  };
}
