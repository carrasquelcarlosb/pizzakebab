import { randomUUID } from 'crypto';
import type { FastifyBaseLogger } from 'fastify';
import type { Filter } from 'mongodb';

import type { TenantCollections } from '../db/mongo';
import type {
  DeviceDocument,
  KitchenTicketDocument,
  KitchenTicketItem,
  KitchenTicketTotals,
  TicketAcknowledgementDocument,
} from '../db/schemas';
import type { HydratedCartItem, CartTotals, KitchenTicketPayload as DomainKitchenTicketPayload } from '../domain';
import { ticketStream } from './ticket-stream';

export type KitchenTicketStatus = KitchenTicketDocument['status'];
export type KitchenTicketPrintStatus = KitchenTicketDocument['printStatus'];
export type TicketAcknowledgementStatus = TicketAcknowledgementDocument['status'];

export interface KitchenTicketPayload extends DomainKitchenTicketPayload {}

export interface KitchenTicketView {
  id: string;
  orderId: string;
  cartId: string;
  status: KitchenTicketStatus;
  printStatus: KitchenTicketPrintStatus;
  channels: string[];
  items: KitchenTicketItem[];
  totals: KitchenTicketTotals;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  notes?: string;
  enqueuedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  retryCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAcknowledgementView {
  id: string;
  ticketId: string;
  deviceId: string;
  status: TicketAcknowledgementStatus;
  notes?: string;
  acknowledgedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAcknowledgementInput {
  ticketId: string;
  deviceId: string;
  status: TicketAcknowledgementStatus;
  notes?: string;
}

const toKitchenTicketItem = (item: HydratedCartItem): KitchenTicketItem => {
  const base: KitchenTicketItem = {
    menuItemId: item.menuItemId,
    quantity: item.quantity,
    notes: item.notes,
  };

  if (item.menuItem) {
    base.menuItem = {
      id: item.menuItem.id,
      menuId: item.menuItem.menuId,
      name: item.menuItem.name,
      nameKey: item.menuItem.nameKey,
      description: item.menuItem.description,
      descriptionKey: item.menuItem.descriptionKey,
      categoryKey: item.menuItem.categoryKey,
      price: item.menuItem.price,
      currency: item.menuItem.currency,
      imageUrl: item.menuItem.imageUrl,
    };
  }

  return base;
};

const toKitchenTicketTotals = (totals: CartTotals): KitchenTicketTotals => ({
  subtotal: totals.subtotal,
  deliveryFee: totals.deliveryFee,
  discount: totals.discount,
  total: totals.total,
  currency: totals.currency,
});

const toKitchenTicketView = (doc: KitchenTicketDocument): KitchenTicketView => ({
  id: doc.resourceId,
  orderId: doc.orderId,
  cartId: doc.cartId,
  status: doc.status,
  printStatus: doc.printStatus,
  channels: doc.channels,
  items: doc.items,
  totals: doc.totals,
  customer: doc.customer,
  notes: doc.notes,
  enqueuedAt: doc.enqueuedAt.toISOString(),
  acknowledgedAt: doc.acknowledgedAt?.toISOString(),
  acknowledgedBy: doc.acknowledgedBy,
  retryCount: doc.retryCount,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

const toTicketAcknowledgementView = (
  doc: TicketAcknowledgementDocument,
): TicketAcknowledgementView => ({
  id: doc.resourceId,
  ticketId: doc.ticketId,
  deviceId: doc.deviceId,
  status: doc.status,
  notes: doc.notes,
  acknowledgedAt: doc.acknowledgedAt.toISOString(),
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

const determineChannels = async (
  collections: TenantCollections,
  explicitChannels: string[] | undefined,
): Promise<string[]> => {
  if (explicitChannels && explicitChannels.length > 0) {
    return Array.from(new Set(explicitChannels));
  }

  const channels = new Set<string>(['display']);
  const printer = await collections.devices.findOne({
    capabilities: { $in: ['print'] },
  } as Filter<DeviceDocument>);

  if (printer) {
    channels.add('print');
  }

  return Array.from(channels);
};

const inferPrintStatus = (channels: string[]): KitchenTicketPrintStatus => {
  if (channels.includes('print')) {
    return 'pending';
  }
  return 'not_required';
};

export const enqueueKitchenTicket = async (
  tenantId: string,
  collections: TenantCollections,
  logger: FastifyBaseLogger,
  payload: KitchenTicketPayload,
): Promise<KitchenTicketView> => {
  const channels = await determineChannels(collections, payload.channels);
  const resourceId = randomUUID();
  const enqueuedAt = new Date();

  await collections.kitchenTickets.insertOne({
    resourceId,
    orderId: payload.orderId,
    cartId: payload.cartId,
    status: 'pending',
    printStatus: inferPrintStatus(channels),
    channels,
    items: payload.items.map(toKitchenTicketItem),
    totals: toKitchenTicketTotals(payload.totals),
    customer: payload.customer,
    notes: payload.notes,
    enqueuedAt,
    retryCount: 0,
  });

  const persisted = await collections.kitchenTickets.findOne({ resourceId });
  if (!persisted) {
    throw new Error('Failed to persist kitchen ticket');
  }

  const view = toKitchenTicketView(persisted);
  logger.info({ kitchenTicket: view }, 'kitchen ticket enqueued');
  ticketStream.publish(tenantId, { type: 'ticket.created', ticket: view });
  return view;
};

export const acknowledgeKitchenTicket = async (
  collections: TenantCollections,
  ticketId: string,
  input: TicketAcknowledgementInput,
): Promise<TicketAcknowledgementView | null> => {
  const ticket = await collections.kitchenTickets.findOne({ resourceId: ticketId });
  if (!ticket) {
    return null;
  }

  const resourceId = randomUUID();
  const acknowledgedAt = new Date();

  await collections.ticketAcknowledgements.insertOne({
    resourceId,
    ticketId,
    deviceId: input.deviceId,
    status: input.status,
    notes: input.notes,
    acknowledgedAt,
  });

  const update: Partial<KitchenTicketDocument> = {
    acknowledgedBy: input.deviceId,
  };

  if (input.status === 'received' && ticket.status === 'pending') {
    update.status = 'acknowledged';
    update.acknowledgedAt = acknowledgedAt;
  }

  if (input.status === 'completed') {
    update.status = 'completed';
    update.acknowledgedAt = acknowledgedAt;
  }

  if (input.status === 'printing') {
    update.printStatus = 'printing';
  }

  if (input.status === 'printed') {
    update.printStatus = 'printed';
    if (ticket.status === 'pending') {
      update.status = 'acknowledged';
    }
    update.acknowledgedAt = acknowledgedAt;
  }

  if (input.status === 'failed') {
    update.printStatus = 'failed';
    update.retryCount = (ticket.retryCount ?? 0) + 1;
  }

  if (Object.keys(update).length > 0) {
    await collections.kitchenTickets.updateOne(
      { resourceId: ticketId },
      { $set: update },
    );
  }

  const updatedTicket = await collections.kitchenTickets.findOne({ resourceId: ticketId });
  const persistedAcknowledgement = await collections.ticketAcknowledgements.findOne({ resourceId });

  if (!updatedTicket || !persistedAcknowledgement) {
    throw new Error('Failed to load acknowledgement result');
  }

  const acknowledgementView = toTicketAcknowledgementView(persistedAcknowledgement);
  const ticketView = toKitchenTicketView(updatedTicket);

  ticketStream.publish(ticket.tenantId, {
    type: 'ticket.acknowledged',
    ticket: ticketView,
    acknowledgement: acknowledgementView,
  });

  return acknowledgementView;
};
