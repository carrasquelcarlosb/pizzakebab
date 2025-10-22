export type PromotionType = 'percentage' | 'flat' | 'delivery';

interface PromotionDefinition {
  type: PromotionType;
  value: number;
  minimumSubtotal?: number;
  description?: string;
}

export interface AppliedPromotion {
  code: string;
  amount: number;
  type: PromotionType;
  description?: string;
}

export interface PromotionResult {
  appliedPromotion?: AppliedPromotion;
  reason?: string;
}

const PROMOTIONS: Record<string, PromotionDefinition> = {
  WELCOME20: {
    type: 'percentage',
    value: 0.2,
    minimumSubtotal: 20,
    description: '20% off first order over $20',
  },
  FREESHIP: {
    type: 'delivery',
    value: 1,
    minimumSubtotal: 15,
    description: 'Free delivery on orders over $15',
  },
};

const clampDiscount = (amount: number, ceiling: number): number => {
  if (amount <= 0) {
    return 0;
  }
  if (amount > ceiling) {
    return ceiling;
  }
  return Number(amount.toFixed(2));
};

export const evaluatePromoCode = (
  rawCode: string | null | undefined,
  subtotal: number,
  deliveryFee: number,
): PromotionResult => {
  if (!rawCode) {
    return {};
  }

  const normalized = rawCode.trim().toUpperCase();
  if (!normalized) {
    return {};
  }

  const definition = PROMOTIONS[normalized];
  if (!definition) {
    return { reason: 'unknown_promo_code' };
  }

  if (definition.minimumSubtotal && subtotal < definition.minimumSubtotal) {
    return { reason: 'minimum_not_met' };
  }

  const ceiling = subtotal + deliveryFee;
  switch (definition.type) {
    case 'percentage': {
      const amount = clampDiscount(subtotal * definition.value, ceiling);
      if (amount <= 0) {
        return { reason: 'no_discount' };
      }
      return {
        appliedPromotion: {
          code: normalized,
          amount,
          type: definition.type,
          description: definition.description,
        },
      };
    }
    case 'flat': {
      const amount = clampDiscount(definition.value, ceiling);
      if (amount <= 0) {
        return { reason: 'no_discount' };
      }
      return {
        appliedPromotion: {
          code: normalized,
          amount,
          type: definition.type,
          description: definition.description,
        },
      };
    }
    case 'delivery': {
      if (deliveryFee <= 0) {
        return { reason: 'no_delivery_fee' };
      }
      const amount = clampDiscount(deliveryFee * definition.value, ceiling);
      return {
        appliedPromotion: {
          code: normalized,
          amount,
          type: definition.type,
          description: definition.description,
        },
      };
    }
    default:
      return {};
  }
};

