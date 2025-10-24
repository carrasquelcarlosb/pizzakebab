import { Filter } from 'mongodb';

import { TenantCollection, TenantCollections } from '../db/mongo';
import { MenuItemDocument } from '../db/schemas';
import {
  Cart,
  CartSummary,
  CartSummaryBuilder,
  MenuItem,
  buildCartSummary,
  evaluatePromoCode,
} from '../domain';

const toDomainMenuItem = (doc: MenuItemDocument): MenuItem => ({
  id: doc.resourceId,
  menuId: doc.menuId,
  name: doc.name,
  nameKey: doc.nameKey,
  description: doc.description,
  descriptionKey: doc.descriptionKey,
  categoryKey: doc.categoryKey,
  price: doc.price,
  currency: doc.currency,
  imageUrl: doc.imageUrl,
  rating: doc.rating,
  discountPercentage: doc.discountPercentage,
  isPopular: doc.isPopular,
  isNew: doc.isNew,
  isAvailable: doc.isAvailable,
});

export const createMongoCartSummaryBuilder = (
  collections: TenantCollections,
): CartSummaryBuilder => {
  const menuItemsCollection = collections.menuItems as TenantCollection<MenuItemDocument>;

  const buildSummary: CartSummaryBuilder = async (cart: Cart): Promise<CartSummary> => {
    const menuItemIds = Array.from(new Set(cart.items.map((item) => item.menuItemId)));
    if (menuItemIds.length === 0) {
      return buildCartSummary(cart, [], evaluatePromoCode);
    }

    const menuDocs = await menuItemsCollection
      .find({ resourceId: { $in: menuItemIds } } as Filter<MenuItemDocument>)
      .toArray();

    const menuItems = menuDocs.map((doc) => toDomainMenuItem(doc as MenuItemDocument));
    return buildCartSummary(cart, menuItems, evaluatePromoCode);
  };

  return buildSummary;
};
