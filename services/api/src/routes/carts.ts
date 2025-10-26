import { FastifyInstance, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

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

const hydratedMenuItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    menuId: { type: 'string' },
    name: { type: 'string' },
    nameKey: { type: 'string' },
    description: { type: 'string' },
    descriptionKey: { type: 'string' },
    categoryKey: { type: 'string' },
    price: { type: 'number' },
    currency: { type: 'string' },
    imageUrl: { type: 'string' },
    rating: { type: 'number' },
    discountPercentage: { type: 'number' },
    isPopular: { type: 'boolean' },
    isNew: { type: 'boolean' },
    isAvailable: { type: 'boolean' },
  },
  required: ['id', 'menuId', 'name', 'price', 'currency', 'isAvailable'],
  additionalProperties: false,
} as const;

const cartItemSchema = {
  type: 'object',
  properties: {
    menuItemId: { type: 'string' },
    quantity: { type: 'integer' },
    notes: { type: 'string' },
    menuItem: { type: ['object', 'null'], anyOf: [hydratedMenuItemSchema, { type: 'null' }] },
  },
  required: ['menuItemId', 'quantity'],
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

const cartResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    deviceId: { type: 'string' },
    sessionId: { type: ['string', 'null'] },
    userId: { type: ['string', 'null'] },
    status: { type: 'string', enum: ['open', 'checked_out'] },
    promoCode: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    items: { type: 'array', items: cartItemSchema },
    totals: cartTotalsSchema,
    promotion: promotionSchema,
  },
  required: ['id', 'deviceId', 'status', 'createdAt', 'updatedAt', 'items', 'totals'],
  additionalProperties: false,
} as const;

const responseSchema = {
  200: {
    type: 'object',
    properties: {
      cart: cartResponseSchema,
    },
    required: ['cart'],
  },
} as const;

const createCartBodySchema = {
  type: 'object',
  properties: {
    deviceId: { type: 'string', minLength: 1 },
    sessionId: { type: 'string', minLength: 1 },
    userId: { type: 'string', minLength: 1 },
    promoCode: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
  anyOf: [{ required: ['deviceId'] }, { required: ['sessionId'] }, { required: ['userId'] }],
} as const;

const cartItemInputSchema = {
  type: 'object',
  properties: {
    menuItemId: { type: 'string', minLength: 1 },
    quantity: { type: 'integer', minimum: 0 },
    notes: { type: 'string' },
  },
  required: ['menuItemId', 'quantity'],
  additionalProperties: false,
} as const;

const updateCartBodySchema = {
  type: 'object',
  properties: {
    items: { type: 'array', items: cartItemInputSchema, maxItems: 100 },
    promoCode: { type: ['string', 'null'] },
  },
  additionalProperties: false,
} as const;

const cartParamsSchema = {
  type: 'object',
  properties: {
    cartId: { type: 'string', minLength: 1 },
  },
  required: ['cartId'],
  additionalProperties: false,
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
