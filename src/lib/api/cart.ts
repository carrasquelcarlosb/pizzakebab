import { apiFetch } from "@/lib/api-client"
import type { TranslationKey } from "@/lib/translations"

export interface CartMenuItem {
  id: string
  menuId: string
  name: string
  nameKey?: TranslationKey
  description?: string
  descriptionKey?: TranslationKey
  categoryKey?: TranslationKey
  price: number
  currency: string
  imageUrl?: string
  rating?: number
  discountPercentage?: number
  isPopular?: boolean
  isNew?: boolean
  isAvailable: boolean
}

export interface CartLineItem {
  menuItemId: string
  quantity: number
  notes?: string
  menuItem?: CartMenuItem | null
}

export interface CartTotals {
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  currency: string
}

export interface AppliedPromotion {
  code: string
  amount: number
  type: string
  description?: string
}

export interface CartApi {
  id: string
  deviceId: string
  sessionId?: string | null
  userId?: string | null
  status: "open" | "checked_out"
  promoCode?: string | null
  createdAt: string
  updatedAt: string
  items: CartLineItem[]
  totals: CartTotals
  promotion?: AppliedPromotion | null
}

export interface CartResponse {
  cart: CartApi
}

export interface CreateCartPayload {
  deviceId?: string
  sessionId?: string
  userId?: string
  promoCode?: string
}

export interface UpdateCartPayload {
  items?: Array<{ menuItemId: string; quantity: number; notes?: string }>
  promoCode?: string | null
}

export const createOrGetCart = (payload: CreateCartPayload): Promise<CartResponse> =>
  apiFetch<CartResponse>("/carts", {
    method: "POST",
    body: JSON.stringify(payload),
  })

export const getCart = (cartId: string): Promise<CartResponse> =>
  apiFetch<CartResponse>(`/carts/${cartId}`)

export const updateCart = (cartId: string, payload: UpdateCartPayload): Promise<CartResponse> =>
  apiFetch<CartResponse>(`/carts/${cartId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

export interface SubmitOrderPayload {
  cartId: string
  promoCode?: string | null
  notes?: string
  customer?: {
    name?: string
    phone?: string
    email?: string
  }
}

export interface OrderResponse {
  order: {
    id: string
    cartId: string
    status: string
    total: number
    currency: string
    submittedAt: string
    promotion?: AppliedPromotion | null
    totals: CartTotals
  }
}

export const submitOrder = (payload: SubmitOrderPayload): Promise<OrderResponse> =>
  apiFetch<OrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  })

