import type { AppliedPromotion } from "../promotion"
import type { CartStatus, CartTotals } from "../cart"
import type { MenuItem } from "../menu"

export interface CartLineItemDto {
  menuItemId: string
  quantity: number
  notes?: string
  menuItem?: MenuItem | null
}

export interface CartDto {
  id: string
  deviceId: string
  sessionId?: string | null
  userId?: string | null
  status: CartStatus
  promoCode?: string | null
  createdAt: string
  updatedAt: string
  items: CartLineItemDto[]
  totals: CartTotals
  promotion?: AppliedPromotion | null
}

export interface CreateCartDto {
  deviceId?: string
  sessionId?: string
  userId?: string
  promoCode?: string | null
}

export interface UpdateCartDto {
  items?: Array<{
    menuItemId: string
    quantity: number
    notes?: string
  }>
  promoCode?: string | null
}

export interface CartResponseDto {
  cart: CartDto
}
