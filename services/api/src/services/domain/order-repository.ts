import { TenantCollection, TenantCollections } from '../../db/mongo';
import { OrderDocument } from '../../db/schemas';
import { OrderRepository, OrderCreation } from '../../domain';

export const createOrderRepository = (collections: TenantCollections): OrderRepository => {
  const orders = collections.orders as TenantCollection<OrderDocument>;

  return {
    async create(input: OrderCreation): Promise<void> {
      await orders.insertOne({
        resourceId: input.id,
        cartId: input.cartId,
        status: input.status,
        total: input.total,
        currency: input.currency,
        submittedAt: input.submittedAt,
        promoCode: input.promotionCode ?? null,
        items: input.items,
        deliveryFee: input.deliveryFee,
        discountTotal: input.discountTotal,
        customer: input.customer,
        notes: input.notes,
      } as unknown as OrderDocument);
    },
  };
};
