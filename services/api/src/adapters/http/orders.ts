import { OrderReceipt, SubmitOrderInput } from '../../domain';

export interface SubmitOrderDto {
  cartId: string;
  promoCode?: string | null;
  notes?: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

export const mapSubmitOrderRequest = (body: SubmitOrderDto): SubmitOrderInput => ({
  cartId: body.cartId,
  promoCode: body.promoCode ?? null,
  notes: body.notes,
  customer: body.customer,
});

export const mapOrderReceiptToResponse = (receipt: OrderReceipt) => ({
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
