
export enum ViewType {
  STAFF_FRONT_STORE = 'STAFF_FRONT_STORE',
  STAFF_BACKSTAGE = 'STAFF_BACKSTAGE',
  GUEST_CHAT = 'GUEST_CHAT',
  GUEST_MINI_PROGRAM = 'GUEST_MINI_PROGRAM',
  OFFLINE_STORE = 'OFFLINE_STORE'
}

export interface NavItem {
  id: ViewType;
  label: string;
  icon: string;
}

export interface MerchItem {
  id: string;
  name: string;
  image: string;
  points: number;
  price: number;
  stock?: number; // Added stock property
}

export interface UserMerchTicket {
  id: string;
  productId: string;
  productName: string;
  status: 'PENDING' | 'REDEEMED' | 'SOLD_OFFLINE';
  redeemMethod: 'PURCHASE' | 'POINTS' | 'OFFLINE';
  timestamp: string;
}