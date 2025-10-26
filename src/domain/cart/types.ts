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

export type CartStatus = "open" | "checked_out"

export interface Cart {
  id: string
  deviceId: string
  sessionId?: string | null
  userId?: string | null
  status: CartStatus
  promoCode?: string | null
  createdAt: string
  updatedAt: string
  items: CartLineItem[]
  totals: CartTotals
  promotion?: AppliedPromotion | null
}

export interface Order {
  id: string
  cartId: string
  status: string
  total: number
  currency: string
  submittedAt: string
  promotion?: AppliedPromotion | null
  totals: CartTotals
}

export interface CreateCartCommand {
  deviceId?: string
  sessionId?: string
  userId?: string
  promoCode?: string
}

export interface UpdateCartCommand {
  items?: Array<{ menuItemId: string; quantity: number; notes?: string }>
  promoCode?: string | null
}

export interface SubmitOrderCommand {
  cartId: string
  promoCode?: string | null
  notes?: string
  customer?: {
    name?: string
    phone?: string
    email?: string
  }
}
