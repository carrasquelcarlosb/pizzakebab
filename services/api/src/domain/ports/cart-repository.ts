import { Cart, CartStatus } from '../models/cart';

export interface CartIdentifiers {
  deviceId?: string;
  sessionId?: string;
  userId?: string;
}

export interface CreateCartInput {
  id: string;
  deviceId: string;
  sessionId?: string | null;
  userId?: string | null;
  promoCode?: string | null;
}

export interface UpdateCartPayload {
  items?: Cart['items'];
  promoCode?: string | null;
}

export interface CartRepository {
  findOpenCartByIdentifiers(identifiers: CartIdentifiers): Promise<Cart | null>;
  findById(cartId: string): Promise<Cart | null>;
  create(input: CreateCartInput): Promise<Cart>;
  update(cartId: string, update: UpdateCartPayload): Promise<Cart>;
  setStatus(cartId: string, status: CartStatus): Promise<void>;
}
