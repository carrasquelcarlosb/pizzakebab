import assert from 'node:assert/strict';
import { beforeEach, afterEach, describe, it, mock } from 'node:test';
import Fastify, { FastifyInstance } from 'fastify';

import cartsRoutes from '../../src/routes/carts';
import type {
  Cart,
  CartSummary,
  CartTotals,
  EnsureCartResult,
  GetCartResult,
  TenantContextProvider,
  UpdateCartResult,
} from '../../src/domain';
import * as domain from '../../src/domain';

describe('carts routes', () => {
  let app: FastifyInstance;
  const tenantContextStub: TenantContextProvider = {
    async getCartRepository() {
      throw new Error('not implemented');
    },
    async getCartSummaryBuilder() {
      throw new Error('not implemented');
    },
    async getOrderRepository() {
      throw new Error('not implemented');
    },
    async getKitchenNotifier() {
      throw new Error('not implemented');
    },
  };

  const baseCart: Cart = {
    id: 'cart-1',
    deviceId: 'device-1',
    sessionId: null,
    userId: null,
    status: 'open',
    promoCode: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    items: [],
  };

  const totals: CartTotals = {
    subtotal: 0,
    discount: 0,
    deliveryFee: 0,
    total: 0,
    currency: 'USD',
  };

  const summary: CartSummary = {
    items: [],
    totals,
    promotion: null,
  };

  beforeEach(async () => {
    app = Fastify();
    app.decorateRequest('tenantId', 'tenant-test');
    app.decorateRequest('tenantContextProvider', null);
    app.decorateRequest('getTenantContext', function () {
      return tenantContextStub;
    });
    await app.register(cartsRoutes);
    await app.ready();
  });

  afterEach(async () => {
    mock.restoreAll();
    await app.close();
  });

  it('delegates cart creation to the ensureCart use case', async () => {
    const ensureCartMock = mock.method(domain, 'ensureCart', async () => ({
      cart: baseCart,
      summary,
    }) satisfies EnsureCartResult);

    const response = await app.inject({
      method: 'POST',
      url: '/carts',
      payload: {
        deviceId: 'device-99',
        promoCode: 'WELCOME',
      },
    });

    assert.equal(ensureCartMock.mock.calls.length, 1);
    const [deps, input] = ensureCartMock.mock.calls[0].arguments;
    assert.equal(deps.tenantContext, tenantContextStub);
    assert.equal(typeof deps.idGenerator, 'function');
    assert.deepEqual(input, {
      identifiers: {
        deviceId: 'device-99',
        sessionId: undefined,
        userId: undefined,
      },
      promoCode: 'WELCOME',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(await response.json(), {
      cart: {
        id: 'cart-1',
        deviceId: 'device-1',
        sessionId: null,
        userId: null,
        status: 'open',
        promoCode: null,
        createdAt: baseCart.createdAt.toISOString(),
        updatedAt: baseCart.updatedAt.toISOString(),
        items: [],
        totals,
        promotion: null,
      },
    });
  });

  it('delegates cart retrieval to the getActiveCart use case', async () => {
    const getCartMock = mock.method(domain, 'getActiveCart', async () => ({
      cart: baseCart,
      summary,
    }) satisfies GetCartResult);

    const response = await app.inject({
      method: 'GET',
      url: '/carts/cart-1',
    });

    assert.equal(getCartMock.mock.calls.length, 1);
    const [deps, cartId] = getCartMock.mock.calls[0].arguments;
    assert.equal(deps.tenantContext, tenantContextStub);
    assert.equal(cartId, 'cart-1');

    assert.equal(response.statusCode, 200);
    assert.deepEqual(await response.json(), {
      cart: {
        id: 'cart-1',
        deviceId: 'device-1',
        sessionId: null,
        userId: null,
        status: 'open',
        promoCode: null,
        createdAt: baseCart.createdAt.toISOString(),
        updatedAt: baseCart.updatedAt.toISOString(),
        items: [],
        totals,
        promotion: null,
      },
    });
  });

  it('delegates cart updates to the updateCart use case', async () => {
    const updateCartMock = mock.method(domain, 'updateCart', async () => ({
      cart: baseCart,
      summary,
    }) satisfies UpdateCartResult);

    const response = await app.inject({
      method: 'PUT',
      url: '/carts/cart-1',
      payload: {
        items: [
          {
            menuItemId: 'item-1',
            quantity: 2,
          },
        ],
        promoCode: null,
      },
    });

    assert.equal(updateCartMock.mock.calls.length, 1);
    const [deps, input] = updateCartMock.mock.calls[0].arguments;
    assert.equal(deps.tenantContext, tenantContextStub);
    assert.deepEqual(input, {
      cartId: 'cart-1',
      items: [
        {
          menuItemId: 'item-1',
          quantity: 2,
        },
      ],
      promoCode: null,
      shouldUpdatePromoCode: true,
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(await response.json(), {
      cart: {
        id: 'cart-1',
        deviceId: 'device-1',
        sessionId: null,
        userId: null,
        status: 'open',
        promoCode: null,
        createdAt: baseCart.createdAt.toISOString(),
        updatedAt: baseCart.updatedAt.toISOString(),
        items: [],
        totals,
        promotion: null,
      },
    });
  });
});
