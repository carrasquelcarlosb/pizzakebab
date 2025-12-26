import type { MenuItem } from "./menu"
import type { AppliedPromotion } from "./promotion"

export type CartStatus = "open" | "checked_out"

export interface CartItem {
  menuItemId: string
  quantity: number
  notes?: string
}

export interface Cart {
  id: string
  deviceId: string
  sessionId?: string | null
  userId?: string | null
  status: CartStatus
  promoCode?: string | null
  createdAt: Date
  updatedAt: Date
  items: CartItem[]
}

export interface HydratedCartItem extends CartItem {
  menuItem?: MenuItem | null
}

export interface CartTotals {
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  currency: string
}

export interface CartSummary {
  items: HydratedCartItem[]
  totals: CartTotals
  promotion?: AppliedPromotion | null
}
