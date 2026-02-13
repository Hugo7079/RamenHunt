import { Shop, BowlLog } from '../types';

const SHOPS_KEY = 'ramen_reality_shops';
const LOGS_KEY = 'ramen_reality_logs';

// Initial Data for demo purposes if empty
const DEMO_SHOPS: Shop[] = [
  {
    id: 'demo-1',
    name: '隱家拉麵',
    location: { lat: 25.0931, lng: 121.5292 },
    address: '台北市士林區',
    createdAt: Date.now(),
  },
  {
    id: 'demo-2',
    name: '鬼金棒',
    location: { lat: 25.0515, lng: 121.5238 },
    address: '台北市中山區',
    createdAt: Date.now(),
  }
];

const DEMO_LOGS: BowlLog[] = [
  {
    id: 'log-1',
    shopId: 'demo-1',
    itemName: '黃金雞湯拉麵',
    rating: 5,
    noodleHardness: '硬',
    soupConcentration: '普通',
    backFat: '普通',
    price: 230,
    queueTime: 45,
    notes: '排隊排好久，但雞湯超好喝，必點！',
    date: Date.now(),
    hasKaedama: true,
  },
  {
    id: 'log-2',
    shopId: 'demo-2',
    itemName: '特製辣麻味噌',
    rating: 4.5,
    noodleHardness: '普通',
    soupConcentration: '特濃',
    backFat: '多',
    price: 300,
    queueTime: 60,
    notes: '麻得過癮，下次要增量。',
    date: Date.now(),
    hasKaedama: false,
  }
];

export const getShops = (): Shop[] => {
  const data = localStorage.getItem(SHOPS_KEY);
  if (!data) {
    localStorage.setItem(SHOPS_KEY, JSON.stringify(DEMO_SHOPS));
    return DEMO_SHOPS;
  }
  return JSON.parse(data);
};

export const saveShops = (shops: Shop[]) => {
  localStorage.setItem(SHOPS_KEY, JSON.stringify(shops));
};

export const getLogs = (): BowlLog[] => {
  const data = localStorage.getItem(LOGS_KEY);
  if (!data) {
    localStorage.setItem(LOGS_KEY, JSON.stringify(DEMO_LOGS));
    return DEMO_LOGS;
  }
  return JSON.parse(data);
};

export const saveLogs = (logs: BowlLog[]) => {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};