import assert from 'node:assert/strict';
import { beforeEach, afterEach, describe, it, mock } from 'node:test';
import Fastify, { FastifyInstance } from 'fastify';

import ordersRoutes from '../../src/routes/orders';
import type { OrderReceipt, TenantContextProvider } from '../../src/domain';
import * as domain from '../../src/domain';

describe('orders routes', () => {
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

  beforeEach(async () => {
    app = Fastify();
    app.decorateRequest('tenantId', 'tenant-test');
    app.decorateRequest('tenantContextProvider', null);
    app.decorateRequest('getTenantContext', function () {
      return tenantContextStub;
    });
    await app.register(ordersRoutes);
    await app.ready();
  });

  afterEach(async () => {
    mock.restoreAll();
    await app.close();
  });

  it('invokes submitOrder use case through the HTTP handler', async () => {
    const submittedAt = new Date('2024-01-01T00:00:00Z');
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
        customer: { name: 'Ada Lovelace' },
        notes: 'Leave at the door',
      },
      items: [],
    };

    const submitOrderMock = mock.method(domain, 'submitOrder', async () => receipt);

    const response = await app.inject({
      method: 'POST',
      url: '/orders',
      payload: {
        cartId: 'cart-1',
        promoCode: 'SAVE10',
        notes: 'Leave at the door',
        customer: { name: 'Ada Lovelace' },
      },
    });

    assert.equal(submitOrderMock.mock.calls.length, 1);
    const [deps, input] = submitOrderMock.mock.calls[0].arguments;
    assert.equal(deps.tenantContext, tenantContextStub);
    assert.equal(typeof deps.idGenerator, 'function');
    assert.equal(typeof deps.now, 'function');
    assert.deepEqual(input, {
      cartId: 'cart-1',
      promoCode: 'SAVE10',
      notes: 'Leave at the door',
      customer: { name: 'Ada Lovelace' },
    });

    assert.equal(response.statusCode, 201);
    assert.deepEqual(await response.json(), {
      order: {
        id: 'order-1',
        cartId: 'cart-1',
        status: 'pending',
        total: 42,
        currency: 'USD',
        submittedAt: submittedAt.toISOString(),
        promotion: null,
        totals: {
          subtotal: 40,
          discount: 0,
          deliveryFee: 2,
          total: 42,
          currency: 'USD',
        },
        customer: { name: 'Ada Lovelace' },
        notes: 'Leave at the door',
      },
    });
  });
});
