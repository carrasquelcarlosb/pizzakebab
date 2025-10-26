import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it, mock } from 'node:test'

import { buildServer } from '../../services/api/src/index'
import * as mongoDb from '../../services/api/src/db/mongo'
import * as seed from '../../services/api/src/seed'
import * as printService from '../../services/api/src/services/print-service'
import * as adapters from '../../services/api/src/adapters'
import * as domain from '../../services/api/src/domain'
import type { Cart, CartSummary, TenantContextProvider } from '../../services/api/src/domain'

const noopAsync = async () => {}
const noop = () => {}

const tenantContext: TenantContextProvider = {
  async getCartRepository() {
    throw new Error('not implemented in tests')
  },
  async getCartSummaryBuilder() {
    throw new Error('not implemented in tests')
  },
  async getOrderRepository() {
    throw new Error('not implemented in tests')
  },
  async getKitchenNotifier() {
    throw new Error('not implemented in tests')
  },
}

const cart: Cart = {
  id: 'cart-1',
  deviceId: 'device-1',
  sessionId: null,
  userId: null,
  status: 'open',
  promoCode: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  items: [],
}

const summary: CartSummary = {
  items: [],
  totals: {
    subtotal: 0,
    discount: 0,
    deliveryFee: 0,
    total: 0,
    currency: 'USD',
  },
  promotion: null,
}

describe('cart routes integration via buildServer', () => {
  let app: ReturnType<typeof buildServer> | null = null

  beforeEach(() => {
    mock.restoreAll()
    mock.method(mongoDb as unknown as Record<string, unknown>, 'ensureIndexes', noopAsync)
    mock.method(mongoDb as unknown as Record<string, unknown>, 'closeMongo', noopAsync)
    mock.method(seed as unknown as Record<string, unknown>, 'seedTenantData', noopAsync)
    mock.method(printService as unknown as Record<string, unknown>, 'startPrintServiceWorker', noop)
    mock.method(adapters as unknown as Record<string, unknown>, 'createRequestTenantContextProvider', () => tenantContext)
    app = buildServer()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
      app = null
    }
    mock.restoreAll()
  })

  it('wires POST /carts to the ensureCart use case through adapters', async () => {
    const ensureCartMock = mock.method(domain, 'ensureCart', async () => ({ cart, summary }))
    const localApp = app!

    const response = await localApp.inject({
      method: 'POST',
      url: '/carts',
      headers: { 'x-tenant-id': 'demo' },
      payload: { deviceId: 'device-99', promoCode: 'WELCOME' },
    })

    assert.equal(ensureCartMock.mock.calls.length, 1)
    const [deps, input] = ensureCartMock.mock.calls[0].arguments
    assert.equal(deps.tenantContext, tenantContext)
    assert.equal(typeof deps.idGenerator, 'function')
    assert.deepEqual(input, {
      identifiers: { deviceId: 'device-99', sessionId: undefined, userId: undefined },
      promoCode: 'WELCOME',
    })

    assert.equal(response.statusCode, 200)
    assert.equal(response.json().cart.id, 'cart-1')
  })

  it('wires GET /carts/:id to the getActiveCart use case', async () => {
    const getCartMock = mock.method(domain, 'getActiveCart', async () => ({ cart, summary }))
    const localApp = app!

    const response = await localApp.inject({
      method: 'GET',
      url: '/carts/cart-1',
      headers: { 'x-tenant-id': 'demo' },
    })

    assert.equal(getCartMock.mock.calls.length, 1)
    const [deps, cartId] = getCartMock.mock.calls[0].arguments
    assert.equal(deps.tenantContext, tenantContext)
    assert.equal(cartId, 'cart-1')
    assert.equal(response.statusCode, 200)
    assert.equal(response.json().cart.updatedAt, cart.updatedAt.toISOString())
  })

  it('wires PUT /carts/:id to the updateCart use case with promo intent', async () => {
    const updateCartMock = mock.method(domain, 'updateCart', async () => ({ cart, summary }))
    const localApp = app!

    const response = await localApp.inject({
      method: 'PUT',
      url: '/carts/cart-1',
      headers: { 'x-tenant-id': 'demo' },
      payload: { items: [], promoCode: null },
    })

    const [deps, input] = updateCartMock.mock.calls[0].arguments
    assert.equal(deps.tenantContext, tenantContext)
    assert.deepEqual(input, {
      cartId: 'cart-1',
      items: [],
      promoCode: null,
      shouldUpdatePromoCode: true,
    })

    assert.equal(response.statusCode, 200)
    assert.equal(response.json().cart.id, 'cart-1')
  })
})
