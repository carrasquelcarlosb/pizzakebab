import type { CartResponseDto, CreateCartDto, UpdateCartDto } from '@pizzakebab/domain-types';

import {
  EnsureCartInput,
  EnsureCartResult,
  GetCartResult,
  UpdateCartInput,
  UpdateCartResult,
  serializeCart,
} from '../../domain';

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

export const mapCartResultToResponse = (result: CartUseCaseResult): CartResponseDto => ({
  cart: serializeCart(result.cart, result.summary),
});
