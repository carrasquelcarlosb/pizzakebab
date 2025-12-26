import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  mapCartResultToResponse,
  mapCreateCartRequest,
  mapUpdateCartRequest,
} from '../../src/adapters/http/carts'
import type { Cart, CartSummary } from '../../src/domain'

const cart: Cart = {
  id: 'cart-1',
  deviceId: 'device-1',
  sessionId: null,
  userId: null,
  status: 'open',
  promoCode: 'WELCOME',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  items: [{ menuItemId: 'pizza', quantity: 2 }],
}

const summary: CartSummary = {
  items: [
    {
      menuItemId: 'pizza',
      quantity: 2,
      menuItem: {
        id: 'pizza',
        menuId: 'main',
        name: 'Pizza',
        price: 12,
        currency: 'USD',
        isAvailable: true,
      },
    },
  ],
  totals: {
    subtotal: 24,
    discount: 0,
    deliveryFee: 2.99,
    total: 26.99,
    currency: 'USD',
  },
  promotion: null,
}

describe('http cart adapters', () => {
  it('maps create cart requests to the ensure cart input', () => {
    const input = mapCreateCartRequest({
      deviceId: 'device-2',
      sessionId: 'session-1',
      userId: 'user-1',
      promoCode: 'WELCOME',
    })

    assert.deepEqual(input, {
      identifiers: {
        deviceId: 'device-2',
        sessionId: 'session-1',
        userId: 'user-1',
      },
      promoCode: 'WELCOME',
    })
  })

  it('maps update cart requests including promo intent', () => {
    const input = mapUpdateCartRequest('cart-1', {
      items: [{ menuItemId: 'pizza', quantity: 1 }],
    })

    assert.deepEqual(input, {
      cartId: 'cart-1',
      items: [{ menuItemId: 'pizza', quantity: 1 }],
      promoCode: null,
      shouldUpdatePromoCode: false,
    })

    const withPromo = mapUpdateCartRequest('cart-1', {
      items: [{ menuItemId: 'pizza', quantity: 1 }],
      promoCode: 'SAVE10',
    })

    assert.equal(withPromo.shouldUpdatePromoCode, true)
    assert.equal(withPromo.promoCode, 'SAVE10')
  })

  it('maps a cart result into a response DTO', () => {
    const response = mapCartResultToResponse({ cart, summary })

    assert.equal(response.cart.id, 'cart-1')
    assert.equal(response.cart.items[0].menuItem?.name, 'Pizza')
    assert.equal(response.cart.createdAt, cart.createdAt.toISOString())
  })
})
