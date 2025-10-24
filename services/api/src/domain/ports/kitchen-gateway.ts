import { CartSummary } from '../models/cart';
import { OrderCustomerDetails } from '../models/order';

export interface KitchenTicketPayload {
  orderId: string;
  cartId: string;
  items: CartSummary['items'];
  totals: CartSummary['totals'];
  customer?: OrderCustomerDetails;
  notes?: string;
  channels?: string[];
}

export interface KitchenGateway {
  enqueue(payload: KitchenTicketPayload): Promise<void>;
}
