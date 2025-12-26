import { FastifyInstance, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

import { orderResponseSchema, submitOrderBodySchema } from '@pizzakebab/domain-types';

import { CartClosedError, CartNotFoundError, OrderSubmissionError, submitOrder } from '../domain';
import {
  SubmitOrderDto,
  mapOrderReceiptToResponse,
  mapSubmitOrderRequest,
} from '../adapters/http/orders';

type SubmitOrderBody = SubmitOrderDto;

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
