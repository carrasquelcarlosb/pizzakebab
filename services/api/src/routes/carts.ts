import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';

import { CartItem } from '../db/schemas';
import { buildCartSummary, serializeCart } from '../services/cart';

type CreateCartBody = {
  deviceId?: string;
  sessionId?: string;
  userId?: string;
  promoCode?: string;
};

type UpdateCartBody = {
  items?: Array<{
    menuItemId: string;
    quantity: number;
    notes?: string;
  }>;
  promoCode?: string | null;
};

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

const normalizeItems = (items: UpdateCartBody['items']): CartItem[] => {
  if (!items || items.length === 0) {
    return [];
  }

  const aggregated = new Map<string, { quantity: number; notes?: string }>();
  for (const item of items) {
    const menuItemId = String(item.menuItemId);
    if (!menuItemId) {
      continue;
    }

    const normalizedQuantity = Math.max(0, Math.min(Number.isFinite(item.quantity) ? Math.floor(item.quantity) : 0, 99));
    if (normalizedQuantity <= 0) {
      continue;
    }

    const existing = aggregated.get(menuItemId);
    aggregated.set(menuItemId, {
      quantity: (existing?.quantity ?? 0) + normalizedQuantity,
      notes: item.notes ?? existing?.notes,
    });
  }

  return Array.from(aggregated.entries()).map(([menuItemId, payload]) => ({
    menuItemId,
    quantity: payload.quantity,
    notes: payload.notes,
  }));
};

const ensureCart = async (
  app: FastifyInstance,
  tenantId: string,
  body: CreateCartBody,
) => {
  const collections = await app.getTenantCollections(tenantId);

  const filter: Record<string, unknown> = { status: 'open' };
  if (body.deviceId) {
    filter.deviceId = body.deviceId;
  }
  if (body.sessionId) {
    filter.sessionId = body.sessionId;
  }
  if (body.userId) {
    filter.userId = body.userId;
  }

  let cart = await collections.carts.findOne(filter);

  if (!cart) {
    const resourceId = randomUUID();
    await collections.carts.insertOne({
      resourceId,
      deviceId: body.deviceId ?? body.sessionId ?? resourceId,
      sessionId: body.sessionId,
      userId: body.userId,
      status: 'open',
      items: [],
      promoCode: body.promoCode ?? null,
    });
    cart = await collections.carts.findOne({ resourceId });
  } else if (body.promoCode && cart.promoCode !== body.promoCode) {
    await collections.carts.updateOne(
      { resourceId: cart.resourceId },
      { $set: { promoCode: body.promoCode } },
    );
    cart = await collections.carts.findOne({ resourceId: cart.resourceId });
  }

  if (!cart) {
    throw new Error('Failed to resolve cart');
  }

  const summary = await buildCartSummary(collections, cart);
  return serializeCart(cart, summary);
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
      const cart = await ensureCart(app, request.tenantId, request.body);
      return { cart };
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
      const collections = await request.getTenantCollections();
      const cart = await collections.carts.findOne({ resourceId: cartId });

      if (!cart) {
        reply.code(404);
        return { message: 'Cart not found' };
      }

      if (cart.status !== 'open') {
        reply.code(409);
        return { message: 'Cart is no longer active' };
      }

      const summary = await buildCartSummary(collections, cart);
      return { cart: serializeCart(cart, summary) };
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
      const collections = await request.getTenantCollections();
      const cart = await collections.carts.findOne({ resourceId: cartId });

      if (!cart) {
        reply.code(404);
        return { message: 'Cart not found' };
      }

      if (cart.status !== 'open') {
        reply.code(409);
        return { message: 'Cart is no longer active' };
      }

      const updatePayload: Record<string, unknown> = {};

      if (request.body.items) {
        updatePayload.items = normalizeItems(request.body.items);
      }

      if (Object.prototype.hasOwnProperty.call(request.body, 'promoCode')) {
        updatePayload.promoCode = request.body.promoCode ? request.body.promoCode : null;
      }

      if (Object.keys(updatePayload).length > 0) {
        await collections.carts.updateOne(
          { resourceId: cartId },
          { $set: updatePayload },
        );
      }

      const updatedCart = await collections.carts.findOne({ resourceId: cartId });
      if (!updatedCart) {
        reply.code(500);
        return { message: 'Failed to update cart' };
      }

      const summary = await buildCartSummary(collections, updatedCart);
      return { cart: serializeCart(updatedCart, summary) };
    },
  );
}

