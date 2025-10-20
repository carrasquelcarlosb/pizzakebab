export type OrderMode = "delivery" | "pickup"

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

export const DEFAULT_DELIVERY_FEE = 2.99

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

export function calculateItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0)
}

export function calculateDeliveryFee(items: CartItem[], mode: OrderMode): number {
  if (items.length === 0) {
    return 0
  }

  return mode === "pickup" ? 0 : DEFAULT_DELIVERY_FEE
}

export function calculateTotals(items: CartItem[], mode: OrderMode) {
  const subtotal = calculateSubtotal(items)
  const deliveryFee = calculateDeliveryFee(items, mode)

  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  }
}

export function formatCurrency(value: number, locale = "en-US", currency = "USD") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}
