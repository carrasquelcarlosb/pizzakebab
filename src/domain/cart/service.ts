import type {
  Cart,
  CreateCartCommand,
  SubmitOrderCommand,
  UpdateCartCommand,
  Order,
} from "./types"

export interface CartService {
  createOrGetCart(payload: CreateCartCommand): Promise<Cart>
  getCart(cartId: string): Promise<Cart>
  updateCart(cartId: string, payload: UpdateCartCommand): Promise<Cart>
  submitOrder(payload: SubmitOrderCommand): Promise<Order>
}
