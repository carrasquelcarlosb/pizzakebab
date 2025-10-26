import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { createPromotionEvaluator, evaluatePromoCode } from '../../src/domain'

describe('promotion evaluator', () => {
  it('handles unknown or malformed promo codes gracefully', () => {
    const evaluator = createPromotionEvaluator({})

    assert.deepEqual(evaluator(null, 25, 0), {})
    assert.deepEqual(evaluator('   ', 25, 0), {})
    assert.deepEqual(evaluator('missing', 25, 0), { reason: 'unknown_promo_code' })
  })

  it('applies percentage and flat promotions with ceilings', () => {
    const evaluator = createPromotionEvaluator({
      SAVE10: { type: 'percentage', value: 0.1, description: '10% off' },
      TAKE5: { type: 'flat', value: 5, description: '5 off orders', minimumSubtotal: 10 },
    })

    assert.deepEqual(evaluator('save10', 200, 5), {
      appliedPromotion: {
        code: 'SAVE10',
        amount: 20,
        type: 'percentage',
        description: '10% off',
      },
    })

    assert.deepEqual(evaluator('take5', 50, 5), {
      appliedPromotion: {
        code: 'TAKE5',
        amount: 5,
        type: 'flat',
        description: '5 off orders',
      },
    })

    assert.deepEqual(evaluator('take5', 5, 5), { reason: 'minimum_not_met' })
  })

  it('applies delivery promotions only when delivery fee is charged', () => {
    const evaluator = createPromotionEvaluator({
      FREESHIP: { type: 'delivery', value: 1, description: 'Free delivery', minimumSubtotal: 1 },
    })

    assert.deepEqual(evaluator('freeship', 20, 2.5), {
      appliedPromotion: {
        code: 'FREESHIP',
        amount: 2.5,
        type: 'delivery',
        description: 'Free delivery',
      },
    })

    assert.deepEqual(evaluator('freeship', 20, 0), { reason: 'no_delivery_fee' })
  })

  it('exposes the default promotion evaluator', () => {
    const result = evaluatePromoCode('WELCOME20', 100, 2.99)

    assert.equal(result.appliedPromotion?.code, 'WELCOME20')
    assert(result.appliedPromotion?.amount && result.appliedPromotion.amount > 0)
  })
})
