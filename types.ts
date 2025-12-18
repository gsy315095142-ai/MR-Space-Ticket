
export enum ViewType {
  STAFF_FRONT_STORE = 'STAFF_FRONT_STORE',
  STAFF_BACKSTAGE = 'STAFF_BACKSTAGE',
  GUEST_CHAT = 'GUEST_CHAT',
  GUEST_MINI_PROGRAM = 'GUEST_MINI_PROGRAM'
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
}

export interface UserMerchTicket {
  id: string;
  productId: string;
  productName: string;
  status: 'PENDING' | 'REDEEMED';
  redeemMethod: 'PURCHASE' | 'POINTS';
  timestamp: string;
}
