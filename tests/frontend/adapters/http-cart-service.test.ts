import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'

import { HttpCartService } from '../../../src/adapters/http/cart-service'
import * as apiClient from '../../../src/lib/api-client'

describe('HttpCartService', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  it('creates or fetches carts through the API client', async () => {
    const response = { cart: { id: 'cart-1' } }
    const fetchMock = mock.method(apiClient, 'apiFetch', async () => response)
    const service = new HttpCartService()

    const cart = await service.createOrGetCart({ deviceId: 'device-1' })

    assert.equal(fetchMock.mock.calls.length, 1)
    const [path, init] = fetchMock.mock.calls[0].arguments
    assert.equal(path, '/carts')
    assert.equal(init?.method, 'POST')
    assert.equal(cart.id, 'cart-1')
  })

  it('delegates read, update, and submit operations to the API client', async () => {
    const fetchMock = mock.method(apiClient, 'apiFetch', async (path: string) => {
      if (path.startsWith('/carts/')) {
        return { cart: { id: 'cart-1' } }
      }
      return { order: { id: 'order-1' } }
    })

    const service = new HttpCartService()

    await service.getCart('cart-1')
    await service.updateCart('cart-1', { items: [], promoCode: null })
    await service.submitOrder({ cartId: 'cart-1' })

    const paths = fetchMock.mock.calls.map((call) => call.arguments[0])
    assert.deepEqual(paths, ['/carts/cart-1', '/carts/cart-1', '/orders'])
    assert.equal(fetchMock.mock.calls[1].arguments[1]?.method, 'PUT')
    assert.equal(fetchMock.mock.calls[2].arguments[1]?.method, 'POST')
  })
})
