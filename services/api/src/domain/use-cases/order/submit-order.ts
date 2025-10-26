import { CartClosedError, CartNotFoundError, OrderSubmissionError } from '../../errors';
import { CartSummaryBuilder } from '../../ports/cart-summary-builder';
import { CartRepository } from '../../ports/cart-repository';
import { KitchenNotifier } from '../../ports/kitchen-notifier';
import { OrderRepository } from '../../ports/order-repository';
import { TenantContextProvider } from '../../ports/tenant-context-provider';
import { OrderReceipt } from '@pizzakebab/domain-types';

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
  tenantContext: TenantContextProvider;
  idGenerator: () => string;
  now: () => Date;
}

interface OrderDependencies {
  cartRepository: CartRepository;
  orderRepository: OrderRepository;
  summaryBuilder: CartSummaryBuilder;
  kitchenNotifier: KitchenNotifier;
}

const resolveDependencies = async (provider: TenantContextProvider): Promise<OrderDependencies> => {
  const [cartRepository, orderRepository, summaryBuilder, kitchenNotifier] = await Promise.all([
    provider.getCartRepository(),
    provider.getOrderRepository(),
    provider.getCartSummaryBuilder(),
    provider.getKitchenNotifier(),
  ]);

  return { cartRepository, orderRepository, summaryBuilder, kitchenNotifier };
};

export const submitOrder = async (
  deps: SubmitOrderDependencies,
  input: SubmitOrderInput,
): Promise<OrderReceipt> => {
  const { tenantContext, idGenerator, now } = deps;
  const { cartId, promoCode, customer, notes } = input;

  const { cartRepository, orderRepository, summaryBuilder, kitchenNotifier } =
    await resolveDependencies(tenantContext);

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

  await kitchenNotifier.notify({
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
