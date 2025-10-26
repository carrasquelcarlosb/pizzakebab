import {
  EnsureCartInput,
  EnsureCartResult,
  GetCartResult,
  UpdateCartInput,
  UpdateCartResult,
  serializeCart,
} from '../../domain';

export interface CreateCartDto {
  deviceId?: string;
  sessionId?: string;
  userId?: string;
  promoCode?: string | null;
}

export interface UpdateCartDto {
  items?: Array<{
    menuItemId: string;
    quantity: number;
    notes?: string;
  }>;
  promoCode?: string | null;
}

type CartUseCaseResult = EnsureCartResult | GetCartResult | UpdateCartResult;

export const mapCreateCartRequest = (body: CreateCartDto): EnsureCartInput => ({
  identifiers: {
    deviceId: body.deviceId,
    sessionId: body.sessionId,
    userId: body.userId,
  },
  promoCode: body.promoCode ?? null,
});

export const mapUpdateCartRequest = (cartId: string, body: UpdateCartDto): UpdateCartInput => ({
  cartId,
  items: body.items,
  promoCode: body.promoCode ?? null,
  shouldUpdatePromoCode: Object.prototype.hasOwnProperty.call(body, 'promoCode'),
});

export const mapCartResultToResponse = (result: CartUseCaseResult) => ({
  cart: serializeCart(result.cart, result.summary),
});
