import { FastifyInstance, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

import {
  CartClosedError,
  CartNotFoundError,
  OrderReceipt,
  OrderSubmissionError,
  submitOrder,
} from '../domain';

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
    customer: customerSchema,
    notes: { type: 'string' },
  },
  required: ['id', 'cartId', 'status', 'total', 'currency', 'submittedAt', 'totals'],
  additionalProperties: false,
} as const;

const serializeOrder = (receipt: OrderReceipt) => ({
  id: receipt.order.id,
  cartId: receipt.order.cartId,
  status: receipt.order.status,
  total: receipt.order.total,
  currency: receipt.order.currency,
  submittedAt: receipt.order.submittedAt.toISOString(),
  promotion: receipt.order.promotion,
  totals: receipt.order.totals,
  customer: receipt.order.customer,
  notes: receipt.order.notes,
});

const handleOrderError = (reply: FastifyReply, error: unknown) => {
  if (error instanceof CartNotFoundError) {
    reply.code(404);
    return { message: error.message };
  }

  if (error instanceof CartClosedError) {
    reply.code(409);
    return { message: error.message };
  }

  if (error instanceof OrderSubmissionError) {
    reply.code(400);
    return { message: error.message };
  }

  throw error;
};

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
      try {
        const receipt = await submitOrder(
          {
            tenantContext: request.getTenantContext(),
            idGenerator: randomUUID,
            now: () => new Date(),
          },
          {
            cartId: request.body.cartId,
            promoCode: request.body.promoCode ?? null,
            customer: request.body.customer,
            notes: request.body.notes,
          },
        );

        reply.code(201);
        return {
          order: serializeOrder(receipt),
        };
      } catch (error) {
        return handleOrderError(reply, error);
      }
    },
  );
}
