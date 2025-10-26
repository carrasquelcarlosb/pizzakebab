import { FastifyInstance, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

import { cartParamsSchema, cartResponseSchema, createCartBodySchema, updateCartBodySchema } from '@pizzakebab/domain-types';

import {
  CartClosedError,
  CartNotFoundError,
  CartUpdateError,
  ensureCart as ensureCartUseCase,
  getActiveCart,
  updateCart as updateCartUseCase,
} from '../domain';
import {
  CreateCartDto,
  UpdateCartDto,
  mapCartResultToResponse,
  mapCreateCartRequest,
  mapUpdateCartRequest,
} from '../adapters/http/carts';

type CreateCartBody = CreateCartDto;

type UpdateCartBody = UpdateCartDto;

const responseSchema = {
  200: {
    type: 'object',
    properties: {
      cart: cartResponseSchema,
    },
    required: ['cart'],
  },
} as const;

const handleCartError = (reply: FastifyReply, error: unknown) => {
  if (error instanceof CartNotFoundError) {
    reply.code(404);
    return { message: error.message };
  }

  if (error instanceof CartClosedError) {
    reply.code(409);
    return { message: error.message };
  }

  if (error instanceof CartUpdateError) {
    reply.code(500);
    return { message: error.message };
  }

  throw error;
};

export default async function cartsRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: CreateCartBody }>(
    '/carts',
    {
      schema: {
        body: createCartBodySchema,
        response: responseSchema,
      },
    },
    async (request) => {
      const result = await ensureCartUseCase(
        {
          tenantContext: request.getTenantContext(),
          idGenerator: randomUUID,
        },
        mapCreateCartRequest(request.body),
      );
      return mapCartResultToResponse(result);
    },
  );

  app.get(
    '/carts/:cartId',
    {
      schema: {
        params: cartParamsSchema,
        response: responseSchema,
      },
    },
    async (request, reply) => {
      const { cartId } = request.params as { cartId: string };

      try {
        const result = await getActiveCart(
          { tenantContext: request.getTenantContext() },
          cartId,
        );
        return mapCartResultToResponse(result);
      } catch (error) {
        return handleCartError(reply, error);
      }
    },
  );

  app.put<{ Params: { cartId: string }; Body: UpdateCartBody }>(
    '/carts/:cartId',
    {
      schema: {
        params: cartParamsSchema,
        body: updateCartBodySchema,
        response: responseSchema,
      },
    },
    async (request, reply) => {
      const { cartId } = request.params;

      try {
        const result = await updateCartUseCase(
          { tenantContext: request.getTenantContext() },
          mapUpdateCartRequest(cartId, request.body),
        );
        return mapCartResultToResponse(result);
      } catch (error) {
        return handleCartError(reply, error);
      }
    },
  );
}
