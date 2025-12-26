import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  Cart,
  CartItem,
  CartSummary,
  MenuItem,
  PromotionResult,
  buildCartSummary,
  normalizeCartItems,
  sanitizeCartItems,
} from '../../src/domain'

const buildCart = (items: CartItem[]): Cart => ({
  id: 'cart-1',
  deviceId: 'device-1',
  sessionId: null,
  userId: null,
  status: 'open',
  promoCode: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  items,
})

describe('cart domain services', () => {
  it('sanitizes cart items by removing invalid quantities', () => {
    const result = sanitizeCartItems([
      { menuItemId: 'pizza', quantity: 2 },
      { menuItemId: 'kebab', quantity: 0 },
      { menuItemId: 'wrap', quantity: NaN },
      { menuItemId: 'side', quantity: -4 },
    ])

    assert.deepEqual(result, [{ menuItemId: 'pizza', quantity: 2 }])
  })

  it('normalizes raw cart items by aggregating per menu item', () => {
    const result = normalizeCartItems([
      { menuItemId: 'pizza', quantity: 1.6 },
      { menuItemId: 'pizza', quantity: 2.2, notes: 'extra cheese' },
      { menuItemId: 'kebab', quantity: 1 },
      { menuItemId: '', quantity: 5 },
      { menuItemId: 'drink', quantity: -1 },
    ])

    assert.deepEqual(result, [
      { menuItemId: 'pizza', quantity: 3, notes: 'extra cheese' },
      { menuItemId: 'kebab', quantity: 1 },
    ])
  })

  it('builds a cart summary using menu item data and promotions', () => {
    const cart = buildCart([
      { menuItemId: 'pizza', quantity: 2 },
      { menuItemId: 'drink', quantity: 1 },
    ])

    const menuItems: MenuItem[] = [
      {
        id: 'pizza',
        menuId: 'main',
        name: 'Pizza Margherita',
        price: 12,
        currency: 'USD',
        isAvailable: true,
      },
      {
        id: 'drink',
        menuId: 'drinks',
        name: 'Sparkling Water',
        price: 3,
        currency: 'USD',
        isAvailable: false,
      },
    ]

    const promoCalls: Array<[string | null, number, number]> = []
    const evaluatePromotion = (
      code: string | null,
      subtotal: number,
      deliveryFee: number,
    ): PromotionResult => {
      promoCalls.push([code, subtotal, deliveryFee])
      return {
        appliedPromotion: {
          code: 'WELCOME',
          amount: 5,
          type: 'flat',
          description: 'Welcome bonus',
        },
      }
    }

    const summary = buildCartSummary(cart, menuItems, evaluatePromotion)

    const expectedItems: CartSummary['items'] = [
      {
        menuItemId: 'pizza',
        quantity: 2,
        notes: undefined,
        menuItem: menuItems[0],
      },
      {
        menuItemId: 'drink',
        quantity: 1,
        notes: undefined,
        menuItem: menuItems[1],
      },
    ]

    assert.deepEqual(summary.items, expectedItems)
    assert.deepEqual(summary.totals, {
      subtotal: 24,
      deliveryFee: 2.99,
      discount: 5,
      total: 21.99,
      currency: 'USD',
    })
    assert.deepEqual(summary.promotion, {
      code: 'WELCOME',
      amount: 5,
      type: 'flat',
      description: 'Welcome bonus',
    })

    assert.deepEqual(promoCalls, [[null, 24, 2.99]])
  })
})
