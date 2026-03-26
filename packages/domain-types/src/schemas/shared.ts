export const promotionSchema = {
  type: ["object", "null"],
  properties: {
    code: { type: "string" },
    amount: { type: "number" },
    type: { type: "string" },
    description: { type: "string" }
  },
  required: ["code", "amount", "type"],
  additionalProperties: false
} as const

export const cartTotalsSchema = {
  type: "object",
  properties: {
    subtotal: { type: "number" },
    deliveryFee: { type: "number" },
    discount: { type: "number" },
    total: { type: "number" },
    currency: { type: "string" }
  },
  required: ["subtotal", "deliveryFee", "discount", "total", "currency"],
  additionalProperties: false
} as const

export const customerSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    phone: { type: "string" },
    email: { type: "string" }
  },
  additionalProperties: false
} as const
