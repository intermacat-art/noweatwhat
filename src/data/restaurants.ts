import type { Restaurant } from './types';

export const mockRestaurants: Restaurant[] = [
  // === 吃到飽 ===
  {
    id: 1,
    name: "詹記麻辣火鍋 (敦南店)",
    category: "吃到飽",
    rating: 4.8,
    priceLevel: 3,
    priceStr: "$$$",
    dist: "850m",
    address: "台北市大安區和平東路三段60號",
    coordinates: { lat: 25.0268, lng: 121.5435 },
    tags: ['date'],
    image: "https://images.unsplash.com/photo-1582718849840-a6e0033bfa26?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "和平東路地下停車場", status: "餘 5 車位", statusColor: "text-orange-500", walkTime: "3 min", price: "40/hr" },
      { name: "遠企購物中心停車場", status: "充裕", statusColor: "text-green-500", walkTime: "5 min", price: "100/hr" }
    ],
    videos: [
      { title: "詹記必點指南｜吃到飽攻略", creator: "欸你這週要幹嘛", thumb: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80" },
      { title: "台北最強麻辣鍋？老饕帶路", creator: "Joeman", thumb: "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: [
      { title: "2026 詹記訂位攻略：沒預約吃得到嗎？", source: "PopDaily", date: "2025.12.20" },
      { title: "台北麻辣鍋評比：詹記 vs 這一鍋", source: "WalkerLand", date: "2026.01.15" }
    ]
  },
  {
    id: 2,
    name: "馬辣頂級鴛鴦火鍋 (西門店)",
    category: "吃到飽",
    rating: 4.5,
    priceLevel: 3,
    priceStr: "$$$",
    dist: "2.1km",
    address: "台北市萬華區中華路一段186號",
    coordinates: { lat: 25.0422, lng: 121.5078 },
    tags: ['date'],
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "西門町地下停車場", status: "充裕", statusColor: "text-green-500", walkTime: "4 min", price: "50/hr" }
    ],
    videos: [
      { title: "馬辣火鍋CP值到底高不高？", creator: "千千進食中", thumb: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: [
      { title: "馬辣vs詹記 大PK，哪家更值得？", source: "DailyView", date: "2026.01.08" }
    ]
  },
  // === 小吃 ===
  {
    id: 3,
    name: "五燈獎豬腳飯",
    category: "小吃",
    rating: 4.5,
    priceLevel: 1,
    priceStr: "$",
    dist: "1.2km",
    address: "新北市三重區自強路一段119號",
    coordinates: { lat: 25.0635, lng: 121.4889 },
    tags: ['pet'],
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "正義國小地下停車場", status: "充裕", statusColor: "text-green-500", walkTime: "5 min", price: "30/hr" },
      { name: "私人巷弄車位", status: "未知", statusColor: "text-slate-400", walkTime: "1 min", price: "50/hr" }
    ],
    videos: [
      { title: "三重五大必吃滷肉飯", creator: "千千進食中", thumb: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: [
      { title: "三重在地人推薦的銷魂豬腳", source: "食尚玩家", date: "2025.11.10" }
    ]
  },
  {
    id: 4,
    name: "阜杭豆漿",
    category: "小吃",
    rating: 4.7,
    priceLevel: 1,
    priceStr: "$",
    dist: "3.5km",
    address: "台北市中正區忠孝東路一段108號2樓",
    coordinates: { lat: 25.0445, lng: 121.5266 },
    tags: [],
    image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "善導寺站地下停車場", status: "充裕", statusColor: "text-green-500", walkTime: "2 min", price: "40/hr" }
    ],
    videos: [
      { title: "排隊兩小時值不值？阜杭豆漿", creator: "蛋塔 EGGTA", thumb: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: [
      { title: "米其林必比登推薦：阜杭豆漿完全攻略", source: "女子學", date: "2026.02.10" }
    ]
  },
  // === 牛排 ===
  {
    id: 5,
    name: "教父牛排 Danny's Steakhouse",
    category: "牛排",
    rating: 4.9,
    priceLevel: 4,
    priceStr: "$$$$",
    dist: "3.2km",
    address: "台北市中山區樂群三路58號",
    coordinates: { lat: 25.0802, lng: 121.5574 },
    tags: ['date'],
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "美麗華停車場", status: "充裕", statusColor: "text-green-500", walkTime: "8 min", price: "60/hr" },
      { name: "萬豪酒店停車場", status: "餘 12 車位", statusColor: "text-orange-500", walkTime: "5 min", price: "120/hr" }
    ],
    videos: [
      { title: "米其林一星牛排值得嗎？", creator: "蛋塔 EGGTA", thumb: "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: []
  },
  {
    id: 6,
    name: "茹絲葵牛排 Ruth's Chris",
    category: "牛排",
    rating: 4.7,
    priceLevel: 4,
    priceStr: "$$$$",
    dist: "2.8km",
    address: "台北市中山區民生東路三段135號",
    coordinates: { lat: 25.0578, lng: 121.5449 },
    tags: ['date'],
    image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "民生東路地下停車場", status: "餘 8 車位", statusColor: "text-orange-500", walkTime: "3 min", price: "50/hr" }
    ],
    videos: [
      { title: "茹絲葵vs教父牛排 誰才是台北牛排王？", creator: "Joeman", thumb: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: [
      { title: "頂級約會餐廳首選：茹絲葵完整體驗", source: "GQ Taiwan", date: "2026.02.14" }
    ]
  },
  // === 法式 ===
  {
    id: 7,
    name: "Second Floor 貳樓",
    category: "法式",
    rating: 4.6,
    priceLevel: 2,
    priceStr: "$$",
    dist: "1.5km",
    address: "台北市中正區仁愛路二段108號",
    coordinates: { lat: 25.0375, lng: 121.5277 },
    tags: ['pet', 'date'],
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "仁愛路路邊停車", status: "未知", statusColor: "text-slate-400", walkTime: "1 min", price: "50/hr" }
    ],
    videos: [],
    articles: [
      { title: "寵物友善餐廳首選：貳樓", source: "妞新聞", date: "2026.02.01" }
    ]
  },
  {
    id: 8,
    name: "侯布雄法式餐廳 L'ATELIER",
    category: "法式",
    rating: 4.8,
    priceLevel: 4,
    priceStr: "$$$$",
    dist: "2.5km",
    address: "台北市松山區菸廠路88號5樓",
    coordinates: { lat: 25.0437, lng: 121.5585 },
    tags: ['date'],
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "松菸文創園區停車場", status: "充裕", statusColor: "text-green-500", walkTime: "3 min", price: "60/hr" },
      { name: "市府轉運站停車場", status: "充裕", statusColor: "text-green-500", walkTime: "6 min", price: "50/hr" }
    ],
    videos: [
      { title: "米其林二星的法式料理值得嗎？", creator: "Jasmine 美食日記", thumb: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: [
      { title: "侯布雄2026新菜單完整評測", source: "Vogue Taiwan", date: "2026.01.20" }
    ]
  },
  // === 日式 ===
  {
    id: 9,
    name: "藏壽司 くら寿司 (台北館前店)",
    category: "日式",
    rating: 4.3,
    priceLevel: 2,
    priceStr: "$$",
    dist: "3.0km",
    address: "台北市中正區館前路8號",
    coordinates: { lat: 25.0455, lng: 121.5149 },
    tags: [],
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "台北車站地下停車場", status: "充裕", statusColor: "text-green-500", walkTime: "5 min", price: "40/hr" }
    ],
    videos: [
      { title: "藏壽司隱藏菜單大公開！", creator: "這群人", thumb: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: [
      { title: "藏壽司必點TOP10排行榜", source: "PopDaily", date: "2026.01.25" }
    ]
  },
  {
    id: 10,
    name: "一蘭拉麵 (台北本店)",
    category: "日式",
    rating: 4.4,
    priceLevel: 2,
    priceStr: "$$",
    dist: "2.2km",
    address: "台北市信義區松仁路28號",
    coordinates: { lat: 25.0360, lng: 121.5680 },
    tags: [],
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "信義威秀停車場", status: "餘 15 車位", statusColor: "text-orange-500", walkTime: "4 min", price: "80/hr" }
    ],
    videos: [
      { title: "一蘭拉麵台灣vs日本 差在哪？", creator: "Joeman", thumb: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: [
      { title: "一蘭拉麵排隊攻略：避開人潮的秘訣", source: "KKday", date: "2025.12.15" }
    ]
  },
  // === 中式 ===
  {
    id: 11,
    name: "鼎泰豐 (信義本店)",
    category: "中式",
    rating: 4.8,
    priceLevel: 3,
    priceStr: "$$$",
    dist: "2.0km",
    address: "台北市大安區信義路二段194號",
    coordinates: { lat: 25.0339, lng: 121.5296 },
    tags: ['date'],
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "永康街附近停車場", status: "餘 3 車位", statusColor: "text-orange-500", walkTime: "4 min", price: "60/hr" },
      { name: "大安森林公園地下停車場", status: "充裕", statusColor: "text-green-500", walkTime: "8 min", price: "40/hr" }
    ],
    videos: [
      { title: "鼎泰豐隱藏吃法！店員不會告訴你的秘密", creator: "千千進食中", thumb: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: [
      { title: "為什麼鼎泰豐是台灣之光？", source: "天下雜誌", date: "2026.01.10" }
    ]
  },
  {
    id: 12,
    name: "點水樓 (南京店)",
    category: "中式",
    rating: 4.6,
    priceLevel: 3,
    priceStr: "$$$",
    dist: "2.5km",
    address: "台北市中山區南京東路二段77號",
    coordinates: { lat: 25.0523, lng: 121.5329 },
    tags: ['date'],
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "南京東路地下停車場", status: "充裕", statusColor: "text-green-500", walkTime: "3 min", price: "50/hr" }
    ],
    videos: [
      { title: "點水樓小籠包 vs 鼎泰豐 盲測大PK", creator: "蛋塔 EGGTA", thumb: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: [
      { title: "點水樓必吃排行：不只有小籠包", source: "WalkerLand", date: "2025.12.25" }
    ]
  },
  // === 麵食 ===
  {
    id: 13,
    name: "林東芳牛肉麵",
    category: "麵食",
    rating: 4.6,
    priceLevel: 2,
    priceStr: "$$",
    dist: "1.8km",
    address: "台北市中山區安東街4-3號",
    coordinates: { lat: 25.0510, lng: 121.5434 },
    tags: [],
    image: "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "安東街路邊停車", status: "未知", statusColor: "text-slate-400", walkTime: "1 min", price: "40/hr" },
      { name: "復興北路地下停車場", status: "充裕", statusColor: "text-green-500", walkTime: "6 min", price: "40/hr" }
    ],
    videos: [
      { title: "台北牛肉麵冠軍！林東芳必吃", creator: "Mark Wiens", thumb: "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: [
      { title: "林東芳搬家後更好吃了？實測", source: "食尚玩家", date: "2026.02.05" }
    ]
  },
  {
    id: 14,
    name: "永康牛肉麵",
    category: "麵食",
    rating: 4.5,
    priceLevel: 2,
    priceStr: "$$",
    dist: "2.0km",
    address: "台北市大安區金山南路二段31巷17號",
    coordinates: { lat: 25.0330, lng: 121.5285 },
    tags: [],
    image: "https://images.unsplash.com/photo-1552611052-33e04de67d8c?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "永康街停車場", status: "餘 2 車位", statusColor: "text-orange-500", walkTime: "3 min", price: "60/hr" }
    ],
    videos: [
      { title: "永康街美食地圖：牛肉麵篇", creator: "阿滴英文", thumb: "https://images.unsplash.com/photo-1552611052-33e04de67d8c?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: [
      { title: "觀光客vs在地人：永康牛肉麵的真實評價", source: "TVBS", date: "2026.01.30" }
    ]
  },
  // === 飯類 ===
  {
    id: 15,
    name: "梁社漢排骨飯",
    category: "飯類",
    rating: 4.3,
    priceLevel: 1,
    priceStr: "$",
    dist: "1.0km",
    address: "台北市中正區汀州路三段104號",
    coordinates: { lat: 25.0140, lng: 121.5278 },
    tags: [],
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "公館地下停車場", status: "充裕", statusColor: "text-green-500", walkTime: "5 min", price: "30/hr" }
    ],
    videos: [
      { title: "大學生的銅板美食！梁社漢排骨飯", creator: "美食水水", thumb: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: []
  },
  {
    id: 16,
    name: "金峰滷肉飯",
    category: "飯類",
    rating: 4.6,
    priceLevel: 1,
    priceStr: "$",
    dist: "2.8km",
    address: "台北市中正區羅斯福路一段10號",
    coordinates: { lat: 25.0325, lng: 121.5165 },
    tags: [],
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    parkingLots: [
      { name: "中正紀念堂地下停車場", status: "充裕", statusColor: "text-green-500", walkTime: "6 min", price: "30/hr" }
    ],
    videos: [
      { title: "CNN推薦！金峰滷肉飯到底好吃在哪？", creator: "Joeman", thumb: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80" }
    ],
    articles: [
      { title: "金峰滷肉飯：米其林必比登的銅板天王", source: "TVBS", date: "2026.02.20" }
    ]
  }
];
