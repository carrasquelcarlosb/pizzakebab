export interface BaseDocument {
  tenantId: string;
  resourceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuDocument extends BaseDocument {
  name: string;
  description?: string;
  translationKey?: string;
  isActive: boolean;
}

export interface MenuItemDocument extends BaseDocument {
  menuId: string;
  name: string;
  description?: string;
  nameKey?: string;
  descriptionKey?: string;
  categoryKey?: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  imageUrl?: string;
  rating?: number;
  discountPercentage?: number;
  isPopular?: boolean;
  isNew?: boolean;
}

export interface CartItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface CartDocument extends BaseDocument {
  deviceId: string;
  sessionId?: string;
  userId?: string;
  status: 'open' | 'checked_out';
  items: CartItem[];
  promoCode?: string | null;
}

export interface OrderDocument extends BaseDocument {
  cartId: string;
  status: 'pending' | 'confirmed' | 'prepared' | 'delivered' | 'cancelled';
  total: number;
  currency: string;
  submittedAt: Date;
  promoCode?: string | null;
  items: CartItem[];
  deliveryFee?: number;
  discountTotal?: number;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  notes?: string;
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

export interface AdminUserDocument extends BaseDocument {
  email: string;
  passwordHash: string;
  name?: string;
  roles: string[];
  lastLoginAt?: Date;
}

export interface PricingOverrideDocument extends BaseDocument {
  menuItemId: string;
  price: number;
  currency: string;
  startsAt?: Date;
  endsAt?: Date;
  reason?: string;
}

export interface OperatingHourDocument extends BaseDocument {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed?: boolean;
}

export interface ReportDocument extends BaseDocument {
  reportType: 'daily-sales' | 'popular-items';
  rangeStart: Date;
  rangeEnd: Date;
  generatedAt: Date;
  payload: unknown;
}

export type TenantCollectionsShape = {
  menus: MenuDocument;
  menuItems: MenuItemDocument;
  carts: CartDocument;
  orders: OrderDocument;
  devices: DeviceDocument;
  tenants: TenantDocument;
  adminUsers: AdminUserDocument;
  pricingOverrides: PricingOverrideDocument;
  operatingHours: OperatingHourDocument;
  reports: ReportDocument;
};

export const COLLECTION_NAMES: { [K in keyof TenantCollectionsShape]: string } = {
  menus: 'menus',
  menuItems: 'menuItems',
  carts: 'carts',
  orders: 'orders',
  devices: 'devices',
  tenants: 'tenants',
  adminUsers: 'adminUsers',
  pricingOverrides: 'pricingOverrides',
  operatingHours: 'operatingHours',
  reports: 'reports',
};
