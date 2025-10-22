import type { FastifyBaseLogger } from 'fastify';

import type { HydratedCartItem, CartTotals } from './cart';

export interface KitchenTicket {
  orderId: string;
  cartId: string;
  tenantId: string;
  items: HydratedCartItem[];
  totals: CartTotals;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  notes?: string;
  enqueuedAt: string;
}

const inMemoryQueue: KitchenTicket[] = [];

export const enqueueKitchenTicket = async (
  logger: FastifyBaseLogger,
  ticket: Omit<KitchenTicket, 'enqueuedAt'>,
): Promise<void> => {
  const payload: KitchenTicket = {
    ...ticket,
    enqueuedAt: new Date().toISOString(),
  };
  inMemoryQueue.push(payload);
  logger.info({ kitchenTicket: payload }, 'kitchen ticket enqueued');
};

export const getQueuedKitchenTickets = (): KitchenTicket[] => [...inMemoryQueue];

