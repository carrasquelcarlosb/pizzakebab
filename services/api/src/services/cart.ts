import { Filter } from 'mongodb';

import { TenantCollections } from '../db/mongo';
import { CartDocument, CartItem, MenuItemDocument } from '../db/schemas';
import { AppliedPromotion, evaluatePromoCode } from './promotions';

const DEFAULT_CURRENCY = 'USD';
const DEFAULT_DELIVERY_FEE = 2.99;

export interface HydratedMenuItem {
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
}

export interface HydratedCartItem extends CartItem {
  menuItem?: HydratedMenuItem;
}

export interface CartTotals {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  currency: string;
}

export interface CartSummary {
  items: HydratedCartItem[];
  totals: CartTotals;
  promotion?: AppliedPromotion;
}

const sanitizeCartItems = (items: CartItem[]): CartItem[] =>
  items.filter((item) => Number.isFinite(item.quantity) && item.quantity > 0);

const hydrateCartItems = async (
  collections: TenantCollections,
  items: CartItem[],
): Promise<HydratedCartItem[]> => {
  const sanitized = sanitizeCartItems(items);

  if (sanitized.length === 0) {
    return [];
  }

  const menuItemIds = sanitized.map((item) => item.menuItemId);
  const menuItems = (await collections.menuItems
    .find({ resourceId: { $in: menuItemIds } } as Filter<MenuItemDocument>)
    .toArray()) as MenuItemDocument[];

  const menuItemMap = new Map(menuItems.map((doc) => [doc.resourceId, doc]));

  return sanitized.map((item) => {
    const doc = menuItemMap.get(item.menuItemId);
    if (!doc) {
      return { ...item };
    }

    const hydratedMenuItem: HydratedMenuItem = {
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
    };

    return {
      ...item,
      menuItem: hydratedMenuItem,
    };
  });
};

const roundCurrency = (value: number): number => Number(value.toFixed(2));

export const buildCartSummary = async (
  collections: TenantCollections,
  cart: CartDocument,
): Promise<CartSummary> => {
  const items = await hydrateCartItems(collections, cart.items ?? []);

  let subtotal = 0;
  let currency = DEFAULT_CURRENCY;

  for (const item of items) {
    if (item.menuItem && item.menuItem.isAvailable) {
      subtotal += item.menuItem.price * item.quantity;
      currency = item.menuItem.currency ?? currency;
    }
  }

  const deliveryFee = items.length > 0 ? DEFAULT_DELIVERY_FEE : 0;
  const promoResult = evaluatePromoCode(cart.promoCode, subtotal, deliveryFee);
  const discount = promoResult.appliedPromotion?.amount ?? 0;
  const total = Math.max(subtotal + deliveryFee - discount, 0);

  return {
    items,
    totals: {
      subtotal: roundCurrency(subtotal),
      deliveryFee: roundCurrency(deliveryFee),
      discount: roundCurrency(discount),
      total: roundCurrency(total),
      currency,
    },
    promotion: promoResult.appliedPromotion,
  };
};

export interface SerializedCartItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
  menuItem?: HydratedMenuItem;
}

export interface SerializedCart {
  id: string;
  deviceId: string;
  sessionId?: string;
  userId?: string;
  status: CartDocument['status'];
  promoCode?: string | null;
  createdAt: string;
  updatedAt: string;
  items: SerializedCartItem[];
  totals: CartTotals;
  promotion?: AppliedPromotion;
}

export const serializeCart = (cart: CartDocument, summary: CartSummary): SerializedCart => ({
  id: cart.resourceId,
  deviceId: cart.deviceId,
  sessionId: cart.sessionId,
  userId: cart.userId,
  status: cart.status,
  promoCode: cart.promoCode ?? null,
  createdAt: cart.createdAt.toISOString(),
  updatedAt: cart.updatedAt.toISOString(),
  items: summary.items.map((item) => ({
    menuItemId: item.menuItemId,
    quantity: item.quantity,
    notes: item.notes,
    menuItem: item.menuItem,
  })),
  totals: summary.totals,
  promotion: summary.promotion,
});

