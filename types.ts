
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

export interface GlobalBooking {
    id: string;
    time: string;
    dateStr: string;
    guests: number;
    checkInCount: number;
    status: 'BOOKED' | 'CHECKED_IN' | 'TRANSFERRED';
    store: string;
    userName: string;
}

export interface MyTicket {
  id: string;
  code: string;
  name: string;
  date: string;
  store: string;
  status: 'PENDING' | 'USED' | 'EXPIRED';
  tags?: string[];
  expiryText?: string;
  peopleCount?: number;
}

export interface UserSession {
  id: string;
  dateStr: string;
  fullDate: string; // YYYY-MM-DD
  time: string;
  guests: number;
  store: string;
  qrCode: string;
  totalPrice: number;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'CHECKED_IN' | 'RUNNING';
  ticketCount: number;
  pointsClaimed?: boolean;
}
