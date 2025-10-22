import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Document, UpdateFilter } from 'mongodb';

import {
  appendUpdatedTimestamp,
  buildTenantScopedFilter,
  sanitizeTenantScopedUpdate,
} from '../services/api/src/db/tenant-helpers';

type ExampleDoc = Document & {
  tenantId: string;
  resourceId: string;
  status?: string;
};

describe('tenant scoped helpers', () => {
  it('enforces tenant scope and ignores caller tenant filters', () => {
    const filter = { tenantId: 'other-tenant', resourceId: 'abc', status: 'active' } as Record<string, unknown>;
    const scoped = buildTenantScopedFilter<ExampleDoc>('tenant-1', filter as any);

    assert.deepEqual(scoped, { resourceId: 'abc', status: 'active', tenantId: 'tenant-1' });
    assert.deepEqual(filter, { tenantId: 'other-tenant', resourceId: 'abc', status: 'active' });
  });

  it('removes protected fields from replacement updates', () => {
    const update = {
      tenantId: 'bad-tenant',
      resourceId: 'abc',
      status: 'closed',
    } as UpdateFilter<ExampleDoc>;

    const sanitized = sanitizeTenantScopedUpdate(update);

    assert.deepEqual(sanitized, { status: 'closed' });
    assert.deepEqual(update, {
      tenantId: 'bad-tenant',
      resourceId: 'abc',
      status: 'closed',
    });
  });

  it('removes protected fields from modifier updates', () => {
    const update = {
      $set: { tenantId: 'bad-tenant', status: 'open' },
      $inc: { retries: 1 },
    } as UpdateFilter<ExampleDoc>;

    const sanitized = sanitizeTenantScopedUpdate(update);

    assert.deepEqual(sanitized, {
      $set: { status: 'open' },
      $inc: { retries: 1 },
    });
    assert.deepEqual(update, {
      $set: { tenantId: 'bad-tenant', status: 'open' },
      $inc: { retries: 1 },
    });
  });

  it('appends timestamps without mutating the original update', () => {
    const update = { $set: { status: 'open' } } as UpdateFilter<ExampleDoc>;
    const timestamp = new Date('2024-01-01T00:00:00.000Z');

    const enriched = appendUpdatedTimestamp(update, timestamp);

    assert.deepEqual(enriched, { $set: { status: 'open', updatedAt: timestamp } });
    assert.deepEqual(update, { $set: { status: 'open' } });
  });
});
