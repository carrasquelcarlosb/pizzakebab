import type {
  AppliedPromotion as SharedAppliedPromotion,
  CartDto,
  CartLineItemDto,
  CartStatus as SharedCartStatus,
  CartTotals as SharedCartTotals,
  CreateCartDto,
  MenuItem,
  OrderDto,
  SubmitOrderDto,
  UpdateCartDto,
} from "@pizzakebab/domain-types"

export type CartMenuItem = MenuItem

export type CartLineItem = CartLineItemDto

export type CartTotals = SharedCartTotals

export type AppliedPromotion = SharedAppliedPromotion

export type CartStatus = SharedCartStatus

export type Cart = CartDto

export type Order = OrderDto

export type CreateCartCommand = CreateCartDto

export type UpdateCartCommand = UpdateCartDto

export type SubmitOrderCommand = SubmitOrderDto
