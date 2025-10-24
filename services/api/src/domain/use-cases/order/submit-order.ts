import { CartClosedError, CartNotFoundError, OrderSubmissionError } from '../../errors';
import { CartSummaryBuilder } from '../../ports/cart-summary-builder';
import { CartRepository } from '../../ports/cart-repository';
import { KitchenGateway } from '../../ports/kitchen-gateway';
import { OrderRepository } from '../../ports/order-repository';
import { OrderReceipt } from '../../models/order';

export interface SubmitOrderInput {
  cartId: string;
  promoCode?: string | null;
  notes?: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

export interface SubmitOrderDependencies {
  cartRepository: CartRepository;
  orderRepository: OrderRepository;
  summaryBuilder: CartSummaryBuilder;
  kitchenGateway: KitchenGateway;
  idGenerator: () => string;
  now: () => Date;
}

export const submitOrder = async (
  deps: SubmitOrderDependencies,
  input: SubmitOrderInput,
): Promise<OrderReceipt> => {
  const { cartRepository, orderRepository, summaryBuilder, kitchenGateway, idGenerator, now } = deps;
  const { cartId, promoCode, customer, notes } = input;

  let cart = await cartRepository.findById(cartId);
  if (!cart) {
    throw new CartNotFoundError();
  }

  if (cart.status !== 'open') {
    throw new CartClosedError();
  }

  if (promoCode && cart.promoCode !== promoCode) {
    cart = await cartRepository.update(cart.id, { promoCode });
    if (!cart) {
      throw new OrderSubmissionError('Unable to apply promo code');
    }
  }

  const summary = await summaryBuilder(cart);
  const orderId = idGenerator();
  const submittedAt = now();

  await orderRepository.create({
    id: orderId,
    cartId: cart.id,
    status: 'pending',
    total: summary.totals.total,
    currency: summary.totals.currency,
    submittedAt,
    promotionCode: summary.promotion?.code ?? cart.promoCode ?? null,
    items: summary.items.map(({ menuItemId, quantity, notes: itemNotes }) => ({
      menuItemId,
      quantity,
      notes: itemNotes,
    })),
    deliveryFee: summary.totals.deliveryFee,
    discountTotal: summary.totals.discount,
    customer,
    notes,
  });

  await cartRepository.setStatus(cart.id, 'checked_out');

  await kitchenGateway.enqueue({
    orderId,
    cartId: cart.id,
    items: summary.items,
    totals: summary.totals,
    customer,
    notes,
  });

  return {
    order: {
      id: orderId,
      cartId: cart.id,
      status: 'pending',
      total: summary.totals.total,
      currency: summary.totals.currency,
      submittedAt,
      promotion: summary.promotion ?? null,
      totals: summary.totals,
      customer,
      notes,
    },
    items: summary.items,
  };
};
