export interface Location {
  lat: number;
  lng: number;
}

export interface Shop {
  id: string;
  name: string;
  location: Location;
  address: string;
  createdAt: number;
}

export interface BowlLog {
  id: string;
  shopId: string;
  itemName: string; // 品項名稱
  rating: number; // 1-5
  noodleHardness: string; // 麵條硬度
  soupConcentration: string; // 湯頭濃度
  backFat: string; // 背脂量
  price: number;
  queueTime: number; // 分鐘
  notes: string;
  date: number;
  hasKaedama: boolean; // 是否加麵/替玉
}

export const NOODLE_HARDNESS_OPTIONS = ['超硬', '硬', '普通', '軟', '超軟'];
export const SOUP_OPTIONS = ['特濃', '濃', '普通', '淡', '清湯'];
export const FAT_OPTIONS = ['多', '普通', '少', '無'];

export interface CompassResult {
  shop: Shop;
  bowl: BowlLog;
}