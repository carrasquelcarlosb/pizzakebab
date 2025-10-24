import { Cart, CartSummary } from '../../models/cart';
import { CartSummaryBuilder } from '../../ports/cart-summary-builder';
import { CartRepository } from '../../ports/cart-repository';
import { CartClosedError, CartNotFoundError } from '../../errors';

export interface GetCartDependencies {
  cartRepository: CartRepository;
  summaryBuilder: CartSummaryBuilder;
}

export interface GetCartResult {
  cart: Cart;
  summary: CartSummary;
}

export const getActiveCart = async (
  deps: GetCartDependencies,
  cartId: string,
): Promise<GetCartResult> => {
  const cart = await deps.cartRepository.findById(cartId);
  if (!cart) {
    throw new CartNotFoundError();
  }

  if (cart.status !== 'open') {
    throw new CartClosedError();
  }

  const summary = await deps.summaryBuilder(cart);
  return { cart, summary };
};
