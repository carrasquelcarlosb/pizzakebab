import type { PricedItem } from "./pricing"

export interface SampleCartItem extends PricedItem {
  id: number
  name: string
  image?: string
}

export const sampleCartItems: SampleCartItem[] = [
  {
    id: 101,
    name: "Spicy Kebab Pizza",
    price: 14.99,
    quantity: 1,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 201,
    name: "Mixed Grill Kebab",
    price: 16.99,
    quantity: 1,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 401,
    name: "Garlic Cheese Bread",
    price: 5.99,
    quantity: 1,
    image: "/placeholder.svg?height=100&width=100",
  },
]
