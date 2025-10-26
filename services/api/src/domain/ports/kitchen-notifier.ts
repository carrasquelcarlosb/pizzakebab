import { CartSummary, OrderCustomerDetails } from '@pizzakebab/domain-types';

export interface KitchenTicketPayload {
  orderId: string;
  cartId: string;
  items: CartSummary['items'];
  totals: CartSummary['totals'];
  customer?: OrderCustomerDetails;
  notes?: string;
  channels?: string[];
}

export interface KitchenNotifier {
  notify(payload: KitchenTicketPayload): Promise<void>;
}
