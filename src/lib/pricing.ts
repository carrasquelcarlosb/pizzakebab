export interface PricedItem {
  price: number
  quantity: number
}

export interface PricingOptions {
  deliveryFee?: number
  taxRate?: number
}

export interface PricingBreakdown {
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
}

export const DEFAULT_DELIVERY_FEE = 2.99
export const DEFAULT_TAX_RATE = 0.0864

export function roundToCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

export function calculateSubtotal(items: PricedItem[]): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return roundToCurrency(subtotal)
}

export function calculateTax(subtotal: number, taxRate: number = DEFAULT_TAX_RATE): number {
  return roundToCurrency(subtotal * taxRate)
}

export function calculatePricingBreakdown(
  items: PricedItem[],
  options: PricingOptions = {},
): PricingBreakdown {
  const subtotal = calculateSubtotal(items)
  const deliveryFee = roundToCurrency(options.deliveryFee ?? DEFAULT_DELIVERY_FEE)
  const taxRate = options.taxRate ?? DEFAULT_TAX_RATE
  const tax = calculateTax(subtotal, taxRate)
  const total = roundToCurrency(subtotal + deliveryFee + tax)

  return {
    subtotal,
    deliveryFee,
    tax,
    total,
  }
}
