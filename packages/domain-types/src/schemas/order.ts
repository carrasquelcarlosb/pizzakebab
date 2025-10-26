import { cartTotalsSchema, customerSchema, promotionSchema } from "./shared"

export const submitOrderBodySchema = {
  type: "object",
  properties: {
    cartId: { type: "string", minLength: 1 },
    promoCode: { type: ["string", "null"] },
    notes: { type: "string" },
    customer: customerSchema
  },
  required: ["cartId"],
  additionalProperties: false
} as const

export const orderResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    cartId: { type: "string" },
    status: { type: "string" },
    total: { type: "number" },
    currency: { type: "string" },
    submittedAt: { type: "string", format: "date-time" },
    promotion: promotionSchema,
    totals: cartTotalsSchema,
    customer: customerSchema,
    notes: { type: "string" }
  },
  required: ["id", "cartId", "status", "total", "currency", "submittedAt", "totals"],
  additionalProperties: false
} as const
