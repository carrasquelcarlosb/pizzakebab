import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';

import { buildServer } from '../../services/api/src/index';
import * as mongoDb from '../../services/api/src/db/mongo';
import * as seed from '../../services/api/src/seed';
import * as printService from '../../services/api/src/services/print-service';

type TenantCollectionsStub = {
  tenants: {
    findOne: () => Promise<unknown>;
  };
};

const noopAsync = async () => {};
const noop = () => {};

const activeMocks: Array<{ mock: { restore: () => void } }> = [];

const trackMock = (object: Record<string, unknown>, method: string, implementation: unknown) => {
  const stub = mock.method(object, method as never, implementation as never);
  activeMocks.push(stub as unknown as { mock: { restore: () => void } });
  return stub;
};

afterEach(() => {
  while (activeMocks.length > 0) {
    activeMocks.pop()?.mock.restore();
  }
});

const setupCommonMocks = (collections: TenantCollectionsStub) => {
  trackMock(mongoDb as unknown as Record<string, unknown>, 'ensureIndexes', noopAsync);
  trackMock(mongoDb as unknown as Record<string, unknown>, 'closeMongo', noopAsync);
  trackMock(seed as unknown as Record<string, unknown>, 'seedTenantData', noopAsync);
  trackMock(printService as unknown as Record<string, unknown>, 'startPrintServiceWorker', noop);
  trackMock(mongoDb as unknown as Record<string, unknown>, 'getTenantCollections', async () => collections as any);
};

describe('API service health endpoints', () => {
  it('responds with ok from /healthz without tenant headers', async () => {
    setupCommonMocks({
      tenants: {
        findOne: async () => ({ resourceId: 'system' }),
      },
    });

    const app = buildServer();
    const response = await app.inject({
      method: 'GET',
      url: '/healthz',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: 'ok' });

    await app.close();
  });

  it('reports ready when tenant lookup succeeds', async () => {
    const findOneCalls: string[] = [];

    setupCommonMocks({
      tenants: {
        findOne: async () => {
          findOneCalls.push('called');
          return { resourceId: 'demo' };
        },
      },
    });

    const app = buildServer();

    const response = await app.inject({
      method: 'GET',
      url: '/readyz',
      headers: {
        'x-tenant-id': 'demo',
      },
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: 'ready' });
    assert.equal(findOneCalls.length, 1);

    await app.close();
  });

  it('reports error when tenant lookup throws', async () => {
    setupCommonMocks({
      tenants: {
        findOne: async () => {
          throw new Error('database offline');
        },
      },
    });

    const app = buildServer();

    const response = await app.inject({
      method: 'GET',
      url: '/readyz',
      headers: {
        'x-tenant-id': 'demo',
      },
    });

    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.json(), { status: 'error' });

    await app.close();
  });
});
