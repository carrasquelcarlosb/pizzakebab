import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { createMongoCartSummaryBuilder } from '../../src/adapters/cart-summary-builder'
import type { TenantCollections } from '../../src/db/mongo'
import type { Cart } from '../../src/domain'

const buildCart = (items: Cart['items']): Cart => ({
  id: 'cart-1',
  deviceId: 'device-1',
  sessionId: null,
  userId: null,
  status: 'open',
  promoCode: 'WELCOME',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  items,
})

describe('createMongoCartSummaryBuilder', () => {
  it('loads menu items once and builds a hydrated summary', async () => {
    const menuDocs = [
      {
        tenantId: 'demo',
        resourceId: 'pizza',
        menuId: 'main',
        name: 'Pizza Margherita',
        price: 12,
        currency: 'USD',
        isAvailable: true,
      },
    ]

    const collectedFilters: unknown[] = []

    const collections = {
      menuItems: {
        find(filter: unknown) {
          collectedFilters.push(filter)
          return {
            async toArray() {
              return menuDocs
            },
          }
        },
      },
    } as unknown as TenantCollections

    const builder = createMongoCartSummaryBuilder(collections)

    const summary = await builder(
      buildCart([
        { menuItemId: 'pizza', quantity: 2 },
        { menuItemId: 'pizza', quantity: 1 },
        { menuItemId: 'unknown', quantity: 3 },
      ]),
    )

    assert.equal(collectedFilters.length, 1)
    assert.deepEqual(collectedFilters[0], { resourceId: { $in: ['pizza', 'unknown'] } })

    assert.equal(summary.items.length, 3)
    assert.equal(summary.items[0].menuItem?.name, 'Pizza Margherita')
    assert.equal(summary.totals.subtotal, 36)
    assert.equal(summary.totals.currency, 'USD')
  })

  it('skips fetching menu data when cart is empty', async () => {
    let findCalled = false

    const collections = {
      menuItems: {
        find() {
          findCalled = true
          return {
            async toArray() {
              return []
            },
          }
        },
      },
    } as unknown as TenantCollections

    const builder = createMongoCartSummaryBuilder(collections)
    const summary = await builder(buildCart([]))

    assert.equal(findCalled, false)
    assert.deepEqual(summary.items, [])
    assert.equal(summary.totals.total, 0)
  })
})
