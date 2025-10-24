import { Cart, CartSummary } from '../../models/cart';
import { CartSummaryBuilder } from '../../ports/cart-summary-builder';
import { CartRepository } from '../../ports/cart-repository';
import { CartClosedError, CartNotFoundError, CartUpdateError } from '../../errors';
import { normalizeCartItems } from '../../services/cart-summary';

export interface UpdateCartInput {
  cartId: string;
  items?: Array<{ menuItemId: string; quantity: number; notes?: string }>;
  promoCode?: string | null;
  shouldUpdatePromoCode?: boolean;
}

export interface UpdateCartDependencies {
  cartRepository: CartRepository;
  summaryBuilder: CartSummaryBuilder;
}

export interface UpdateCartResult {
  cart: Cart;
  summary: CartSummary;
}

export const updateCart = async (
  deps: UpdateCartDependencies,
  input: UpdateCartInput,
): Promise<UpdateCartResult> => {
  const { cartRepository, summaryBuilder } = deps;
  const { cartId } = input;

  let cart = await cartRepository.findById(cartId);
  if (!cart) {
    throw new CartNotFoundError();
  }

  if (cart.status !== 'open') {
    throw new CartClosedError();
  }

  const updatePayload: { items?: Cart['items']; promoCode?: string | null } = {};

  if (input.items) {
    updatePayload.items = normalizeCartItems(input.items);
  }

  if (input.shouldUpdatePromoCode) {
    updatePayload.promoCode = input.promoCode ?? null;
  }

  if (Object.keys(updatePayload).length > 0) {
    cart = await cartRepository.update(cartId, updatePayload);
    if (!cart) {
      throw new CartUpdateError();
    }
  }

  const summary = await summaryBuilder(cart);
  return { cart, summary };
};
