import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { mapOrderReceiptToResponse, mapSubmitOrderRequest } from '../../src/adapters/http/orders'
import type { OrderReceipt } from '../../src/domain'

describe('http order adapters', () => {
  it('maps submit order requests to domain input', () => {
    const input = mapSubmitOrderRequest({
      cartId: 'cart-1',
      promoCode: undefined,
      notes: 'Leave at door',
      customer: { name: 'Grace Hopper' },
    })

    assert.deepEqual(input, {
      cartId: 'cart-1',
      promoCode: null,
      notes: 'Leave at door',
      customer: { name: 'Grace Hopper' },
    })
  })

  it('maps order receipts into response DTOs', () => {
    const submittedAt = new Date('2024-01-01T12:00:00Z')
    const receipt: OrderReceipt = {
      order: {
        id: 'order-1',
        cartId: 'cart-1',
        status: 'pending',
        total: 42,
        currency: 'USD',
        submittedAt,
        promotion: null,
        totals: {
          subtotal: 40,
          discount: 0,
          deliveryFee: 2,
          total: 42,
          currency: 'USD',
        },
        customer: { name: 'Grace Hopper' },
        notes: 'Leave at door',
      },
      items: [],
    }

    const response = mapOrderReceiptToResponse(receipt)

    assert.equal(response.order.id, 'order-1')
    assert.equal(response.order.submittedAt, submittedAt.toISOString())
    assert.equal(response.order.notes, 'Leave at door')
  })
})
