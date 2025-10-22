import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';

import { buildCartSummary } from '../services/cart';
import { enqueueKitchenTicket } from '../services/kitchen-queue';

type SubmitOrderBody = {
  cartId: string;
  promoCode?: string | null;
  notes?: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
};

const customerSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string' },
  },
  additionalProperties: false,
} as const;

const promotionSchema = {
  type: ['object', 'null'],
  properties: {
    code: { type: 'string' },
    amount: { type: 'number' },
    type: { type: 'string' },
    description: { type: 'string' },
  },
  required: ['code', 'amount', 'type'],
  additionalProperties: false,
} as const;

const cartTotalsSchema = {
  type: 'object',
  properties: {
    subtotal: { type: 'number' },
    deliveryFee: { type: 'number' },
    discount: { type: 'number' },
    total: { type: 'number' },
    currency: { type: 'string' },
  },
  required: ['subtotal', 'deliveryFee', 'discount', 'total', 'currency'],
  additionalProperties: false,
} as const;

const submitOrderBodySchema = {
  type: 'object',
  properties: {
    cartId: { type: 'string', minLength: 1 },
    promoCode: { type: ['string', 'null'] },
    notes: { type: 'string' },
    customer: customerSchema,
  },
  required: ['cartId'],
  additionalProperties: false,
} as const;

const orderResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    cartId: { type: 'string' },
    status: { type: 'string' },
    total: { type: 'number' },
    currency: { type: 'string' },
    submittedAt: { type: 'string', format: 'date-time' },
    promotion: promotionSchema,
    totals: cartTotalsSchema,
  },
  required: ['id', 'cartId', 'status', 'total', 'currency', 'submittedAt', 'totals'],
  additionalProperties: false,
} as const;

export default async function ordersRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: SubmitOrderBody }>(
    '/orders',
    {
      schema: {
        body: submitOrderBodySchema,
        response: {
          201: {
            type: 'object',
            properties: {
              order: orderResponseSchema,
            },
            required: ['order'],
          },
        },
      },
    },
    async (request, reply) => {
      const { cartId, promoCode, notes, customer } = request.body;
      const collections = await request.getTenantCollections();
      let cart = await collections.carts.findOne({ resourceId: cartId });

      if (!cart) {
        reply.code(404);
        return { message: 'Cart not found' };
      }

      if (cart.status !== 'open') {
        reply.code(409);
        return { message: 'Cart is no longer active' };
      }

      if (promoCode && cart.promoCode !== promoCode) {
        await collections.carts.updateOne(
          { resourceId: cart.resourceId },
          { $set: { promoCode } },
        );
        cart = await collections.carts.findOne({ resourceId: cart.resourceId });
      }

      if (!cart) {
        reply.code(404);
        return { message: 'Cart not found' };
      }

      const summary = await buildCartSummary(collections, cart);
      const resourceId = randomUUID();
      const submittedAt = new Date();

      await collections.orders.insertOne({
        resourceId,
        cartId,
        status: 'pending',
        total: summary.totals.total,
        currency: summary.totals.currency,
        submittedAt,
        promoCode: summary.promotion?.code ?? cart.promoCode ?? null,
        items: summary.items.map(({ menuItemId, quantity, notes: lineNotes }) => ({
          menuItemId,
          quantity,
          notes: lineNotes,
        })),
        deliveryFee: summary.totals.deliveryFee,
        discountTotal: summary.totals.discount,
        customer,
        notes,
      });

      await collections.carts.updateOne(
        { resourceId: cartId },
        { $set: { status: 'checked_out' } },
      );

      await enqueueKitchenTicket(request.tenantId, collections, request.log, {
        orderId: resourceId,
        cartId,
        items: summary.items,
        totals: summary.totals,
        customer,
        notes,
      });

      reply.code(201);
      return {
        order: {
          id: resourceId,
          cartId,
          status: 'pending',
          total: summary.totals.total,
          currency: summary.totals.currency,
          submittedAt: submittedAt.toISOString(),
          promotion: summary.promotion ?? null,
          totals: summary.totals,
        },
      };
    },
  );
}

