import { CartSummaryBuilder } from './cart-summary-builder';
import { CartRepository } from './cart-repository';
import { KitchenNotifier } from './kitchen-notifier';
import { OrderRepository } from './order-repository';

export interface TenantContextProvider {
  getCartRepository(): Promise<CartRepository>;
  getCartSummaryBuilder(): Promise<CartSummaryBuilder>;
  getOrderRepository(): Promise<OrderRepository>;
  getKitchenNotifier(): Promise<KitchenNotifier>;
}
