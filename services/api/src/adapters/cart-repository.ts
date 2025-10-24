import { Filter } from 'mongodb';

import { TenantCollection, TenantCollections } from '../db/mongo';
import { CartDocument } from '../db/schemas';
import {
  Cart,
  CartIdentifiers,
  CartRepository,
  CartStatus,
  CreateCartInput,
  UpdateCartPayload,
} from '../domain';

const toDomainCart = (doc: CartDocument): Cart => ({
  id: doc.resourceId,
  deviceId: doc.deviceId,
  sessionId: doc.sessionId ?? null,
  userId: doc.userId ?? null,
  status: doc.status,
  promoCode: doc.promoCode ?? null,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  items: doc.items ?? [],
});

const buildIdentifierFilter = (identifiers: CartIdentifiers): Filter<CartDocument> => {
  const filter: Filter<CartDocument> = { status: 'open' } as Filter<CartDocument>;
  if (identifiers.deviceId) {
    filter.deviceId = identifiers.deviceId;
  }
  if (identifiers.sessionId) {
    filter.sessionId = identifiers.sessionId;
  }
  if (identifiers.userId) {
    filter.userId = identifiers.userId;
  }
  return filter;
};

export const createMongoCartRepository = (collections: TenantCollections): CartRepository => {
  const carts = collections.carts as TenantCollection<CartDocument>;

  const findById = async (cartId: string): Promise<Cart | null> => {
    const doc = await carts.findOne({ resourceId: cartId } as Filter<CartDocument>);
    return doc ? toDomainCart(doc as CartDocument) : null;
  };

  const repository: CartRepository = {
    async findOpenCartByIdentifiers(identifiers: CartIdentifiers): Promise<Cart | null> {
      const filter = buildIdentifierFilter(identifiers);
      const doc = await carts.findOne(filter);
      return doc ? toDomainCart(doc as CartDocument) : null;
    },

    async findById(cartId: string): Promise<Cart | null> {
      return findById(cartId);
    },

    async create(input: CreateCartInput): Promise<Cart> {
      await carts.insertOne({
        resourceId: input.id,
        deviceId: input.deviceId,
        sessionId: input.sessionId ?? undefined,
        userId: input.userId ?? undefined,
        status: 'open',
        items: [],
        promoCode: input.promoCode ?? null,
      } as unknown as CartDocument);
      const created = await findById(input.id);
      if (!created) {
        throw new Error('Failed to create cart');
      }
      return created;
    },

    async update(cartId: string, update: UpdateCartPayload): Promise<Cart> {
      const payload: Record<string, unknown> = {};
      if (update.items) {
        payload.items = update.items;
      }
      if (Object.prototype.hasOwnProperty.call(update, 'promoCode')) {
        payload.promoCode = update.promoCode ?? null;
      }

      if (Object.keys(payload).length > 0) {
        await carts.updateOne(
          { resourceId: cartId } as Filter<CartDocument>,
          { $set: payload },
        );
      }

      const updated = await findById(cartId);
      if (!updated) {
        throw new Error('Failed to load cart after update');
      }
      return updated;
    },

    async setStatus(cartId: string, status: CartStatus): Promise<void> {
      await carts.updateOne(
        { resourceId: cartId } as Filter<CartDocument>,
        { $set: { status } },
      );
    },
  };

  return repository;
};
