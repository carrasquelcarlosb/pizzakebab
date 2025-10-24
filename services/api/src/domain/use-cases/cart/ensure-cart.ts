import { Cart, CartSummary } from '../../models/cart';
import { CartSummaryBuilder } from '../../ports/cart-summary-builder';
import { CartIdentifiers, CartRepository, CreateCartInput } from '../../ports/cart-repository';

export interface EnsureCartInput {
  identifiers: CartIdentifiers;
  promoCode?: string | null;
}

export interface EnsureCartDependencies {
  cartRepository: CartRepository;
  summaryBuilder: CartSummaryBuilder;
  idGenerator: () => string;
}

export interface EnsureCartResult {
  cart: Cart;
  summary: CartSummary;
}

export const ensureCart = async (
  deps: EnsureCartDependencies,
  input: EnsureCartInput,
): Promise<EnsureCartResult> => {
  const { cartRepository, summaryBuilder, idGenerator } = deps;
  const { identifiers, promoCode } = input;

  let cart = await cartRepository.findOpenCartByIdentifiers(identifiers);

  if (!cart) {
    const id = idGenerator();
    const payload: CreateCartInput = {
      id,
      deviceId: identifiers.deviceId ?? identifiers.sessionId ?? identifiers.userId ?? id,
      sessionId: identifiers.sessionId ?? null,
      userId: identifiers.userId ?? null,
      promoCode: promoCode ?? null,
    };
    cart = await cartRepository.create(payload);
  } else if (promoCode && cart.promoCode !== promoCode) {
    cart = await cartRepository.update(cart.id, { promoCode });
  }

  if (!cart) {
    throw new Error('Failed to resolve cart');
  }

  const summary = await summaryBuilder(cart);
  return { cart, summary };
};
