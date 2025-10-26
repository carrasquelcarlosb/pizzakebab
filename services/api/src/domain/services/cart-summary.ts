import {
  Cart,
  CartItem,
  CartSummary,
  HydratedCartItem,
  MenuItem,
  PromotionEvaluator,
} from '@pizzakebab/domain-types';

const DEFAULT_CURRENCY = 'USD';
const DEFAULT_DELIVERY_FEE = 2.99;

export const sanitizeCartItems = (items: CartItem[]): CartItem[] =>
  items.filter((item) => Number.isFinite(item.quantity) && item.quantity > 0);

export const normalizeCartItems = (
  items: Array<{ menuItemId: string; quantity: number; notes?: string }>,
): CartItem[] => {
  if (!items || items.length === 0) {
    return [];
  }

  const aggregated = new Map<string, { quantity: number; notes?: string }>();
  for (const item of items) {
    const menuItemId = String(item.menuItemId);
    if (!menuItemId) {
      continue;
    }

    const normalizedQuantity = Math.max(
      0,
      Math.min(Number.isFinite(item.quantity) ? Math.floor(item.quantity) : 0, 99),
    );
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

const hydrateCartItems = (
  items: CartItem[],
  menuItems: MenuItem[],
): HydratedCartItem[] => {
  const sanitized = sanitizeCartItems(items);
  if (sanitized.length === 0) {
    return [];
  }

  const menuItemMap = new Map(menuItems.map((menuItem) => [menuItem.id, menuItem]));
  return sanitized.map((item) => ({
    ...item,
    menuItem: menuItemMap.get(item.menuItemId),
  }));
};

const roundCurrency = (value: number): number => Number(value.toFixed(2));

export const buildCartSummary = (
  cart: Cart,
  menuItems: MenuItem[],
  evaluatePromotion: PromotionEvaluator,
): CartSummary => {
  const items = hydrateCartItems(cart.items ?? [], menuItems);

  let subtotal = 0;
  let currency = DEFAULT_CURRENCY;

  for (const item of items) {
    if (item.menuItem && item.menuItem.isAvailable) {
      subtotal += item.menuItem.price * item.quantity;
      currency = item.menuItem.currency ?? currency;
    }
  }

  const deliveryFee = items.length > 0 ? DEFAULT_DELIVERY_FEE : 0;
  const promoResult = evaluatePromotion(cart.promoCode ?? null, subtotal, deliveryFee);
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
