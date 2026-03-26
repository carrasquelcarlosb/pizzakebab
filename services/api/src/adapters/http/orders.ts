import type { OrderResponseDto, SubmitOrderDto } from '@pizzakebab/domain-types';

import { OrderReceipt, SubmitOrderInput } from '../../domain';

export const mapSubmitOrderRequest = (body: SubmitOrderDto): SubmitOrderInput => ({
  cartId: body.cartId,
  promoCode: body.promoCode ?? null,
  notes: body.notes,
  customer: body.customer,
});

export const mapOrderReceiptToResponse = (receipt: OrderReceipt): OrderResponseDto => ({
  order: {
    id: receipt.order.id,
    cartId: receipt.order.cartId,
    status: receipt.order.status,
    total: receipt.order.total,
    currency: receipt.order.currency,
    submittedAt: receipt.order.submittedAt.toISOString(),
    promotion: receipt.order.promotion,
    totals: receipt.order.totals,
    customer: receipt.order.customer,
    notes: receipt.order.notes,
  },
});
