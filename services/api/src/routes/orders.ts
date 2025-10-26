import { FastifyInstance, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

import { CartClosedError, CartNotFoundError, OrderSubmissionError, submitOrder } from '../domain';
import {
  SubmitOrderDto,
  mapOrderReceiptToResponse,
  mapSubmitOrderRequest,
} from '../adapters/http/orders';

type SubmitOrderBody = SubmitOrderDto;

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
          mapSubmitOrderRequest(request.body),
        );

        reply.code(201);
        return mapOrderReceiptToResponse(receipt);
      } catch (error) {
        return handleOrderError(reply, error);
      }
    },
  );
}
