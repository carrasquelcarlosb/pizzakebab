import type { FastifyRequest } from 'fastify';

import type { TenantCollections } from '../db/mongo';
import type {
  CartRepository,
  CartSummaryBuilder,
  KitchenNotifier,
  OrderRepository,
  TenantContextProvider,
} from '../domain';
import { createMongoCartRepository } from './cart-repository';
import { createMongoCartSummaryBuilder } from './cart-summary-builder';
import { createKitchenNotifier } from './kitchen-notifier';
import { createMongoOrderRepository } from './order-repository';

export const createRequestTenantContextProvider = (
  request: FastifyRequest,
): TenantContextProvider => {
  let collectionsCache: Promise<TenantCollections> | null = null;
  let cartRepository: Promise<CartRepository> | null = null;
  let summaryBuilder: Promise<CartSummaryBuilder> | null = null;
  let orderRepository: Promise<OrderRepository> | null = null;
  let kitchenNotifier: Promise<KitchenNotifier> | null = null;

  const getCollections = (): Promise<TenantCollections> => {
    if (!collectionsCache) {
      collectionsCache = request.getTenantCollections();
    }
    return collectionsCache;
  };

  return {
    async getCartRepository(): Promise<CartRepository> {
      if (!cartRepository) {
        cartRepository = getCollections().then((collections) => createMongoCartRepository(collections));
      }
      return cartRepository;
    },

    async getCartSummaryBuilder(): Promise<CartSummaryBuilder> {
      if (!summaryBuilder) {
        summaryBuilder = getCollections().then((collections) =>
          createMongoCartSummaryBuilder(collections),
        );
      }
      return summaryBuilder;
    },

    async getOrderRepository(): Promise<OrderRepository> {
      if (!orderRepository) {
        orderRepository = getCollections().then((collections) => createMongoOrderRepository(collections));
      }
      return orderRepository;
    },

    async getKitchenNotifier(): Promise<KitchenNotifier> {
      if (!kitchenNotifier) {
        kitchenNotifier = getCollections().then((collections) =>
          createKitchenNotifier(request.tenantId, collections, request.log),
        );
      }
      return kitchenNotifier;
    },
  };
};
