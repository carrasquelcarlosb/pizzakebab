import { PromotionDefinition, PromotionEvaluator, PromotionResult, PromotionType } from '../models/promotion';

const clampDiscount = (amount: number, ceiling: number): number => {
  if (amount <= 0) {
    return 0;
  }
  if (amount > ceiling) {
    return ceiling;
  }
  return Number(amount.toFixed(2));
};

export const createPromotionEvaluator = (
  promotions: Record<string, PromotionDefinition>,
): PromotionEvaluator => {
  const byCode = Object.fromEntries(
    Object.entries(promotions).map(([code, definition]) => [code.toUpperCase(), definition]),
  );

  const evaluate: PromotionEvaluator = (rawCode, subtotal, deliveryFee): PromotionResult => {
    if (!rawCode) {
      return {};
    }

    const normalized = rawCode.trim().toUpperCase();
    if (!normalized) {
      return {};
    }

    const definition = byCode[normalized];
    if (!definition) {
      return { reason: 'unknown_promo_code' };
    }

    if (definition.minimumSubtotal && subtotal < definition.minimumSubtotal) {
      return { reason: 'minimum_not_met' };
    }

    const ceiling = subtotal + deliveryFee;
    switch (definition.type) {
      case 'percentage':
        return applyPercentagePromotion(normalized, definition, subtotal, ceiling);
      case 'flat':
        return applyFlatPromotion(normalized, definition, ceiling);
      case 'delivery':
        return applyDeliveryPromotion(normalized, definition, deliveryFee, ceiling);
      default:
        return {};
    }
  };

  return evaluate;
};

const applyPercentagePromotion = (
  code: string,
  definition: PromotionDefinition,
  subtotal: number,
  ceiling: number,
): PromotionResult => {
  const amount = clampDiscount(subtotal * definition.value, ceiling);
  if (amount <= 0) {
    return { reason: 'no_discount' };
  }

  return buildPromotionResult(code, definition, amount);
};

const applyFlatPromotion = (
  code: string,
  definition: PromotionDefinition,
  ceiling: number,
): PromotionResult => {
  const amount = clampDiscount(definition.value, ceiling);
  if (amount <= 0) {
    return { reason: 'no_discount' };
  }

  return buildPromotionResult(code, definition, amount);
};

const applyDeliveryPromotion = (
  code: string,
  definition: PromotionDefinition,
  deliveryFee: number,
  ceiling: number,
): PromotionResult => {
  if (deliveryFee <= 0) {
    return { reason: 'no_delivery_fee' };
  }

  const amount = clampDiscount(deliveryFee * definition.value, ceiling);
  if (amount <= 0) {
    return { reason: 'no_discount' };
  }

  return buildPromotionResult(code, definition, amount);
};

const buildPromotionResult = (
  code: string,
  definition: PromotionDefinition,
  amount: number,
): PromotionResult => ({
  appliedPromotion: {
    code,
    amount,
    type: definition.type as PromotionType,
    description: definition.description,
  },
});
