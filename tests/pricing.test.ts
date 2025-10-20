import assert from "node:assert/strict"
import { test } from "node:test"

import {
  DEFAULT_DELIVERY_FEE,
  DEFAULT_TAX_RATE,
  calculatePricingBreakdown,
  calculateSubtotal,
  calculateTax,
  roundToCurrency,
} from "../src/lib/pricing"

const items = [
  { price: 14.99, quantity: 1 },
  { price: 16.99, quantity: 1 },
  { price: 5.99, quantity: 1 },
]

test("rounds currency values to two decimals", () => {
  assert.equal(roundToCurrency(10.555), 10.56)
  assert.equal(roundToCurrency(10.554), 10.55)
})

test("calculates the subtotal for a list of items", () => {
  assert.equal(calculateSubtotal(items), 37.97)
})

test("calculates tax using the default rate", () => {
  assert.equal(calculateTax(37.97), roundToCurrency(37.97 * DEFAULT_TAX_RATE))
})

test("creates a full pricing breakdown", () => {
  const breakdown = calculatePricingBreakdown(items)

  assert.equal(breakdown.subtotal, 37.97)
  assert.equal(breakdown.deliveryFee, DEFAULT_DELIVERY_FEE)
  assert.equal(breakdown.tax, roundToCurrency(37.97 * DEFAULT_TAX_RATE))
  assert.equal(breakdown.total, roundToCurrency(37.97 + DEFAULT_DELIVERY_FEE + breakdown.tax))
})

test("supports custom delivery fees and tax rates", () => {
  const breakdown = calculatePricingBreakdown(items, { deliveryFee: 1.5, taxRate: 0.05 })

  assert.equal(breakdown.deliveryFee, 1.5)
  assert.equal(breakdown.tax, roundToCurrency(37.97 * 0.05))
  assert.equal(breakdown.total, roundToCurrency(37.97 + 1.5 + breakdown.tax))
})
