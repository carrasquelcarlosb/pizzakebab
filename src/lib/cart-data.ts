export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

export const sharedCartItems: CartItem[] = [
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

export const DEFAULT_DELIVERY_FEE = 2.99
export const DEFAULT_TAX_RATE = 0.0864
