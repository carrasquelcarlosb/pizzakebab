import { Cart, CartSummary } from '../models/cart';

export type CartSummaryBuilder = (cart: Cart) => Promise<CartSummary>;
