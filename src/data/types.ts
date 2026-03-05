export type CategoryName = '日式' | '中式' | '牛排' | '吃到飽' | '法式' | '便當' | '丼飯' | '拉麵' | '牛肉麵' | '小吃';

export const CATEGORY_KEYWORD_MAP: Record<CategoryName, string> = {
  '日式': '日式料理 日本料理',
  '中式': '中式餐廳 中華料理',
  '牛排': '牛排館 牛排餐廳',
  '吃到飽': '吃到飽 buffet',
  '法式': '法式餐廳 法國料理',
  '便當': '便當 自助餐 快餐',
  '丼飯': '丼飯 蓋飯 燴飯',
  '拉麵': '拉麵 日式拉麵',
  '牛肉麵': '牛肉麵 麵店',
  '小吃': '小吃 滷味 鹹酥雞 夜市',
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
  distanceMeters?: number;
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
