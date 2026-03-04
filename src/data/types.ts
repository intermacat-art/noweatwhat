export type CategoryName = '日式' | '中式' | '牛排' | '吃到飽' | '法式' | '麵食' | '飯類' | '小吃';

export const CATEGORY_KEYWORD_MAP: Record<CategoryName, string> = {
  '日式': 'japanese restaurant',
  '中式': 'chinese restaurant',
  '牛排': 'steakhouse',
  '吃到飽': 'buffet',
  '法式': 'french restaurant',
  '麵食': 'noodle restaurant',
  '飯類': 'rice restaurant',
  '小吃': 'street food',
};

export type RestaurantTag = 'date' | 'pet';

export type ParkingStatus = '充裕' | '餘位少' | '已滿' | '未知';

export interface Category {
  name: CategoryName;
  icon: string;
}

export interface ParkingLot {
  name: string;
  status: string;
  statusColor: string;
  walkTime: string;
  price: string;
  coordinates?: { lat: number; lng: number };
}

export interface Video {
  title: string;
  creator: string;
  thumb: string;
  url?: string;
}

export interface Article {
  title: string;
  source: string;
  date: string;
  url?: string;
}

export interface Restaurant {
  id: number;
  name: string;
  category: CategoryName;
  rating: number;
  priceLevel: 1 | 2 | 3 | 4;
  priceStr: string;
  dist: string;
  address: string;
  coordinates: { lat: number; lng: number };
  tags: RestaurantTag[];
  image: string;
  parkingLots: ParkingLot[];
  videos: Video[];
  articles: Article[];
  // Google Places fields
  placeId?: string;
  openNow?: boolean;
  openingHours?: string[];
  googlePhotos?: string[];
  userRatingsTotal?: number;
}

export interface VisitHistory {
  id: string;
  restaurantId: number;
  name: string;
  category: CategoryName;
  date: string;
  count: number;
  cost: number;
  image?: string;
  rating?: number;
  photo?: string;
  actualCost?: number;
  moodTags?: string[];
  quote?: string;
}

export const MOOD_TAG_OPTIONS = [
  '好吃', 'CP值高', '環境好', '服務好', '會再來', '份量大', '排隊久', '停車方便',
] as const;

export const QUICK_AMOUNTS = [100, 300, 500, 800, 1000] as const;

export interface ShareCardData {
  name: string;
  category: CategoryName;
  image: string;
  date: string;
  quote: string;
}
