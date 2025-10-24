import type { FastifyBaseLogger } from 'fastify';

import { TenantCollections } from '../db/mongo';
import { KitchenNotifier, KitchenTicketPayload } from '../domain';
import { enqueueKitchenTicket } from '../services/kitchen-queue';

export const createKitchenNotifier = (
  tenantId: string,
  collections: TenantCollections,
  logger: FastifyBaseLogger,
): KitchenNotifier => ({
  async notify(payload: KitchenTicketPayload): Promise<void> {
    await enqueueKitchenTicket(tenantId, collections, logger, payload);
  },
});
