import type { AppliedPromotion } from "../promotion"
import type { CartTotals } from "../cart"
import type { OrderStatus, OrderCustomerDetails } from "../order"

export interface OrderDto {
  id: string
  cartId: string
  status: OrderStatus
  total: number
  currency: string
  submittedAt: string
  promotion?: AppliedPromotion | null
  totals: CartTotals
  customer?: OrderCustomerDetails
  notes?: string
}

export interface OrderResponseDto {
  order: OrderDto
}

export interface SubmitOrderDto {
  cartId: string
  promoCode?: string | null
  notes?: string
  customer?: OrderCustomerDetails
}
