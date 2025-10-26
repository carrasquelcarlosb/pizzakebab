import { Cart, CartSummary } from '@pizzakebab/domain-types';

export interface SerializedCartItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
  menuItem?: {
    id: string;
    menuId: string;
    name: string;
    nameKey?: string;
    description?: string;
    descriptionKey?: string;
    categoryKey?: string;
    price: number;
    currency: string;
    imageUrl?: string;
    rating?: number;
    discountPercentage?: number;
    isPopular?: boolean;
    isNew?: boolean;
    isAvailable: boolean;
  };
}

export interface SerializedCart {
  id: string;
  deviceId: string;
  sessionId?: string | null;
  userId?: string | null;
  status: Cart['status'];
  promoCode?: string | null;
  createdAt: string;
  updatedAt: string;
  items: SerializedCartItem[];
  totals: CartSummary['totals'];
  promotion?: CartSummary['promotion'];
}

export const serializeCart = (cart: Cart, summary: CartSummary): SerializedCart => ({
  id: cart.id,
  deviceId: cart.deviceId,
  sessionId: cart.sessionId ?? null,
  userId: cart.userId ?? null,
  status: cart.status,
  promoCode: cart.promoCode ?? null,
  createdAt: cart.createdAt.toISOString(),
  updatedAt: cart.updatedAt.toISOString(),
  items: summary.items.map((item) => ({
    menuItemId: item.menuItemId,
    quantity: item.quantity,
    notes: item.notes,
    menuItem: item.menuItem
      ? {
          id: item.menuItem.id,
          menuId: item.menuItem.menuId,
          name: item.menuItem.name,
          nameKey: item.menuItem.nameKey,
          description: item.menuItem.description,
          descriptionKey: item.menuItem.descriptionKey,
          categoryKey: item.menuItem.categoryKey,
          price: item.menuItem.price,
          currency: item.menuItem.currency,
          imageUrl: item.menuItem.imageUrl,
          rating: item.menuItem.rating,
          discountPercentage: item.menuItem.discountPercentage,
          isPopular: item.menuItem.isPopular,
          isNew: item.menuItem.isNew,
          isAvailable: item.menuItem.isAvailable,
        }
      : undefined,
  })),
  totals: summary.totals,
  promotion: summary.promotion,
});
