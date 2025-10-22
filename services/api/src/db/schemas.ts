export interface BaseDocument {
  tenantId: string;
  resourceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuDocument extends BaseDocument {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface MenuItemDocument extends BaseDocument {
  menuId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  isAvailable: boolean;
}

export interface CartItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface CartDocument extends BaseDocument {
  deviceId: string;
  status: 'open' | 'checked_out';
  items: CartItem[];
}

export interface OrderDocument extends BaseDocument {
  cartId: string;
  status: 'pending' | 'confirmed' | 'prepared' | 'delivered' | 'cancelled';
  total: number;
  currency: string;
  submittedAt: Date;
}

export interface DeviceDocument extends BaseDocument {
  label: string;
  type: 'kiosk' | 'tablet' | 'mobile';
  lastSeenAt?: Date;
}

export interface TenantDocument extends BaseDocument {
  name: string;
  domain: string;
  isActive: boolean;
}

export type TenantCollectionsShape = {
  menus: MenuDocument;
  menuItems: MenuItemDocument;
  carts: CartDocument;
  orders: OrderDocument;
  devices: DeviceDocument;
  tenants: TenantDocument;
};

export const COLLECTION_NAMES: { [K in keyof TenantCollectionsShape]: string } = {
  menus: 'menus',
  menuItems: 'menuItems',
  carts: 'carts',
  orders: 'orders',
  devices: 'devices',
  tenants: 'tenants',
};
