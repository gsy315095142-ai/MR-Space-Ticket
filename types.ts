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
