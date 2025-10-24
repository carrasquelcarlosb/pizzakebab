import type { FastifyBaseLogger } from 'fastify';

import { TenantCollections } from '../../db/mongo';
import { KitchenGateway, KitchenTicketPayload } from '../../domain';
import { enqueueKitchenTicket } from '../kitchen-queue';

export const createKitchenGateway = (
  tenantId: string,
  collections: TenantCollections,
  logger: FastifyBaseLogger,
): KitchenGateway => ({
  async enqueue(payload: KitchenTicketPayload): Promise<void> {
    await enqueueKitchenTicket(tenantId, collections, logger, payload);
  },
});
