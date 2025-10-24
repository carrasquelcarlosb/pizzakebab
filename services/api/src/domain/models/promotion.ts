export type PromotionType = 'percentage' | 'flat' | 'delivery';

export interface PromotionDefinition {
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

export type PromotionEvaluator = (
  rawCode: string | null | undefined,
  subtotal: number,
  deliveryFee: number,
) => PromotionResult;
