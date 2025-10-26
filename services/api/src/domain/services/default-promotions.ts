import { PromotionDefinition, PromotionResult } from '@pizzakebab/domain-types';
import { createPromotionEvaluator } from './promotion';

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

const evaluator = createPromotionEvaluator(PROMOTIONS);

export const evaluatePromoCode = (
  rawCode: string | null | undefined,
  subtotal: number,
  deliveryFee: number,
): PromotionResult => evaluator(rawCode, subtotal, deliveryFee);
