import { Cart, CartSummary } from '@pizzakebab/domain-types';

export type CartSummaryBuilder = (cart: Cart) => Promise<CartSummary>;
