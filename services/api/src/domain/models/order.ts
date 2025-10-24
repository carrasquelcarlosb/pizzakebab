import { AppliedPromotion } from './promotion';
import { CartTotals, HydratedCartItem } from './cart';

export type OrderStatus = 'pending' | 'confirmed' | 'prepared' | 'delivered' | 'cancelled';

export interface OrderCustomerDetails {
  name?: string;
  phone?: string;
  email?: string;
}

export interface Order {
  id: string;
  cartId: string;
  status: OrderStatus;
  total: number;
  currency: string;
  submittedAt: Date;
  promotion?: AppliedPromotion | null;
  totals: CartTotals;
  customer?: OrderCustomerDetails;
  notes?: string;
}

export interface OrderLineItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface OrderCreation {
  id: string;
  cartId: string;
  status: OrderStatus;
  total: number;
  currency: string;
  submittedAt: Date;
  promotionCode?: string | null;
  items: OrderLineItem[];
  deliveryFee?: number;
  discountTotal?: number;
  customer?: OrderCustomerDetails;
  notes?: string;
}

export interface OrderReceipt {
  order: Order;
  items: HydratedCartItem[];
}
