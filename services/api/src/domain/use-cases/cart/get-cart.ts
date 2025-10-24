import { Cart, CartSummary } from '../../models/cart';
import { CartSummaryBuilder } from '../../ports/cart-summary-builder';
import { CartRepository } from '../../ports/cart-repository';
import { TenantContextProvider } from '../../ports/tenant-context-provider';
import { CartClosedError, CartNotFoundError } from '../../errors';

export interface GetCartDependencies {
  tenantContext: TenantContextProvider;
}

export interface GetCartResult {
  cart: Cart;
  summary: CartSummary;
}

const resolveDependencies = async (
  provider: TenantContextProvider,
): Promise<{ cartRepository: CartRepository; summaryBuilder: CartSummaryBuilder }> => {
  const [cartRepository, summaryBuilder] = await Promise.all([
    provider.getCartRepository(),
    provider.getCartSummaryBuilder(),
  ]);
  return { cartRepository, summaryBuilder };
};

export const getActiveCart = async (
  deps: GetCartDependencies,
  cartId: string,
): Promise<GetCartResult> => {
  const { tenantContext } = deps;
  const { cartRepository, summaryBuilder } = await resolveDependencies(tenantContext);

  const cart = await cartRepository.findById(cartId);
  if (!cart) {
    throw new CartNotFoundError();
  }

  if (cart.status !== 'open') {
    throw new CartClosedError();
  }

  const summary = await summaryBuilder(cart);
  return { cart, summary };
};
