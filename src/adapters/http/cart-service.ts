import { apiFetch } from "@/lib/api-client"
import type {
  Cart,
  CartService,
  CreateCartCommand,
  Order,
  SubmitOrderCommand,
  UpdateCartCommand,
} from "@/domain/cart"

interface CartResponse {
  cart: Cart
}

interface OrderResponse {
  order: Order
}

export class HttpCartService implements CartService {
  async createOrGetCart(payload: CreateCartCommand): Promise<Cart> {
    const response = await apiFetch<CartResponse>("/carts", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return response.cart
  }

  async getCart(cartId: string): Promise<Cart> {
    const response = await apiFetch<CartResponse>(`/carts/${cartId}`)
    return response.cart
  }

  async updateCart(cartId: string, payload: UpdateCartCommand): Promise<Cart> {
    const response = await apiFetch<CartResponse>(`/carts/${cartId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
    return response.cart
  }

  async submitOrder(payload: SubmitOrderCommand): Promise<Order> {
    const response = await apiFetch<OrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return response.order
  }
}

export const httpCartService = new HttpCartService()
