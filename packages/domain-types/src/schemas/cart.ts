import { cartTotalsSchema, promotionSchema } from "./shared"

export const hydratedMenuItemSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    menuId: { type: "string" },
    name: { type: "string" },
    nameKey: { type: "string" },
    description: { type: "string" },
    descriptionKey: { type: "string" },
    categoryKey: { type: "string" },
    price: { type: "number" },
    currency: { type: "string" },
    imageUrl: { type: "string" },
    rating: { type: "number" },
    discountPercentage: { type: "number" },
    isPopular: { type: "boolean" },
    isNew: { type: "boolean" },
    isAvailable: { type: "boolean" }
  },
  required: ["id", "menuId", "name", "price", "currency", "isAvailable"],
  additionalProperties: false
} as const

export const cartItemSchema = {
  type: "object",
  properties: {
    menuItemId: { type: "string" },
    quantity: { type: "integer" },
    notes: { type: "string" },
    menuItem: { type: ["object", "null"], anyOf: [hydratedMenuItemSchema, { type: "null" }] }
  },
  required: ["menuItemId", "quantity"],
  additionalProperties: false
} as const

export const cartResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    deviceId: { type: "string" },
    sessionId: { type: ["string", "null"] },
    userId: { type: ["string", "null"] },
    status: { type: "string", enum: ["open", "checked_out"] },
    promoCode: { type: ["string", "null"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    items: { type: "array", items: cartItemSchema },
    totals: cartTotalsSchema,
    promotion: promotionSchema
  },
  required: ["id", "deviceId", "status", "createdAt", "updatedAt", "items", "totals"],
  additionalProperties: false
} as const

export const createCartBodySchema = {
  type: "object",
  properties: {
    deviceId: { type: "string", minLength: 1 },
    sessionId: { type: "string", minLength: 1 },
    userId: { type: "string", minLength: 1 },
    promoCode: { type: "string", minLength: 1 }
  },
  additionalProperties: false,
  anyOf: [{ required: ["deviceId"] }, { required: ["sessionId"] }, { required: ["userId"] }]
} as const

export const cartItemInputSchema = {
  type: "object",
  properties: {
    menuItemId: { type: "string", minLength: 1 },
    quantity: { type: "integer", minimum: 0 },
    notes: { type: "string" }
  },
  required: ["menuItemId", "quantity"],
  additionalProperties: false
} as const

export const updateCartBodySchema = {
  type: "object",
  properties: {
    items: { type: "array", items: cartItemInputSchema, maxItems: 100 },
    promoCode: { type: ["string", "null"] }
  },
  additionalProperties: false
} as const

export const cartParamsSchema = {
  type: "object",
  properties: {
    cartId: { type: "string", minLength: 1 }
  },
  required: ["cartId"],
  additionalProperties: false
} as const
