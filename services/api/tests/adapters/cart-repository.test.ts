import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { createMongoCartRepository } from '../../src/adapters/cart-repository'
import type { TenantCollection, TenantCollections } from '../../src/db/mongo'
import type { CartDocument } from '../../src/db/schemas'

class InMemoryCartCollection implements TenantCollection<CartDocument> {
  private store = new Map<string, CartDocument>()

  constructor(initial: CartDocument[] = []) {
    initial.forEach((doc) => this.store.set(doc.resourceId, { ...doc }))
  }

  find() {
    throw new Error('Not implemented for tests')
  }

  async findOne(filter?: Partial<CartDocument>): Promise<CartDocument | null> {
    if (!filter || Object.keys(filter).length === 0) {
      return this.store.values().next().value ?? null
    }

    const docs = Array.from(this.store.values())
    const match = docs.find((doc) => {
      return Object.entries(filter).every(([key, value]) => {
        if (key === 'resourceId') {
          return doc.resourceId === value
        }
        if (key === 'status') {
          return doc.status === value
        }
        if (key === 'deviceId') {
          return value ? doc.deviceId === value : true
        }
        if (key === 'sessionId') {
          return value ? doc.sessionId === value : !doc.sessionId
        }
        if (key === 'userId') {
          return value ? doc.userId === value : !doc.userId
        }
        return true
      })
    })

    return match ? { ...match } : null
  }

  async insertOne(document: Omit<CartDocument, 'tenantId'>): Promise<void> {
    this.store.set(document.resourceId, {
      ...document,
      tenantId: 'demo',
      createdAt: document.createdAt ?? new Date(),
      updatedAt: document.updatedAt ?? new Date(),
    })
  }

  async updateOne(filter: Partial<CartDocument>, update: { $set?: Partial<CartDocument> }): Promise<void> {
    const existing = await this.findOne(filter)
    if (!existing) {
      throw new Error('Cart not found')
    }
    const updated = {
      ...existing,
      ...(update.$set ?? {}),
      updatedAt: new Date(),
    }
    this.store.set(existing.resourceId, updated)
  }

  async deleteOne(): Promise<void> {
    throw new Error('not used')
  }
}

describe('createMongoCartRepository', () => {
  const baseCart: CartDocument = {
    tenantId: 'demo',
    resourceId: 'cart-1',
    deviceId: 'device-1',
    status: 'open',
    items: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  }

  const buildCollections = (docs: CartDocument[] = []): TenantCollections => ({
    carts: new InMemoryCartCollection(docs) as TenantCollection<CartDocument>,
  }) as TenantCollections

  it('finds an open cart by device, session, or user identifiers', async () => {
    const repository = createMongoCartRepository(
      buildCollections([
        baseCart,
        { ...baseCart, resourceId: 'cart-2', deviceId: 'device-2', sessionId: 'sess-1' },
      ]),
    )

    const byDevice = await repository.findOpenCartByIdentifiers({ deviceId: 'device-1' })
    assert.equal(byDevice?.id, 'cart-1')

    const bySession = await repository.findOpenCartByIdentifiers({ sessionId: 'sess-1' })
    assert.equal(bySession?.id, 'cart-2')

    const missing = await repository.findOpenCartByIdentifiers({ userId: 'unknown' })
    assert.equal(missing, null)
  })

  it('creates a new cart and reloads it from storage', async () => {
    const repository = createMongoCartRepository(buildCollections())

    const cart = await repository.create({
      id: 'cart-3',
      deviceId: 'device-3',
    })

    assert.equal(cart.id, 'cart-3')
    assert.equal(cart.status, 'open')
    assert.deepEqual(cart.items, [])
  })

  it('updates cart payloads and preserves missing fields', async () => {
    const repository = createMongoCartRepository(buildCollections([baseCart]))

    await repository.update('cart-1', {
      items: [{ menuItemId: 'pizza', quantity: 2 }],
      promoCode: null,
    })

    const updated = await repository.findById('cart-1')
    assert.equal(updated?.items.length, 1)
    assert.equal(updated?.promoCode, null)
  })

  it('updates cart status directly', async () => {
    const repository = createMongoCartRepository(buildCollections([baseCart]))

    await repository.setStatus('cart-1', 'checked_out')
    const cart = await repository.findById('cart-1')

    assert.equal(cart?.status, 'checked_out')
  })
})
