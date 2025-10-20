export interface MenuCatalogItem {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  rating: number
  popular?: boolean
  discount?: number
}

export type MenuCatalog = Record<string, MenuCatalogItem[]>

export const menuCatalog: MenuCatalog = {
  pizzas: [
    {
      id: 101,
      name: "Spicy Kebab Pizza",
      description: "Our signature pizza topped with juicy kebab meat, jalapeños, and special spicy sauce",
      price: 14.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Specialty Pizzas",
      rating: 4.8,
      popular: true,
    },
    {
      id: 102,
      name: "Margherita",
      description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
      price: 11.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Classic Pizzas",
      rating: 4.6,
    },
    {
      id: 103,
      name: "Meat Feast Pizza",
      description: "Loaded with pepperoni, sausage, bacon, and ground beef for meat lovers",
      price: 15.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Specialty Pizzas",
      rating: 4.9,
      discount: 10,
    },
    {
      id: 104,
      name: "Veggie Supreme",
      description: "Fresh vegetables including peppers, onions, mushrooms, and olives",
      price: 13.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Vegetarian",
      rating: 4.4,
    },
  ],
  kebabs: [
    {
      id: 201,
      name: "Mixed Grill Kebab",
      description: "A delicious mix of chicken, beef, and lamb kebab with grilled vegetables",
      price: 16.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Kebabs",
      rating: 4.7,
    },
    {
      id: 202,
      name: "Chicken Shish",
      description: "Marinated chicken pieces grilled to perfection",
      price: 13.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Kebabs",
      rating: 4.5,
    },
    {
      id: 203,
      name: "Lamb Kofte",
      description: "Seasoned minced lamb formed into kebabs and grilled",
      price: 14.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Kebabs",
      rating: 4.8,
      discount: 15,
    },
    {
      id: 204,
      name: "Vegetable Kebab",
      description: "Grilled seasonal vegetables with halloumi cheese",
      price: 12.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Vegetarian",
      rating: 4.3,
    },
  ],
  wraps: [
    {
      id: 301,
      name: "Chicken Shawarma Wrap",
      description: "Tender chicken shawarma with fresh vegetables and garlic sauce in a warm wrap",
      price: 9.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Wraps",
      rating: 4.6,
    },
    {
      id: 302,
      name: "Lamb Doner Wrap",
      description: "Sliced lamb doner with lettuce, tomato, onion, and tzatziki sauce",
      price: 10.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Wraps",
      rating: 4.4,
    },
  ],
  sides: [
    {
      id: 401,
      name: "Garlic Cheese Bread",
      description: "Freshly baked bread topped with garlic butter and melted cheese",
      price: 5.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Sides",
      rating: 4.5,
    },
    {
      id: 402,
      name: "Spicy Potato Wedges",
      description: "Crispy potato wedges seasoned with spicy herbs",
      price: 4.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Sides",
      rating: 4.2,
    },
  ],
  drinks: [
    {
      id: 501,
      name: "Classic Cola",
      description: "Refreshing fizzy cola served chilled.",
      price: 2.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Drinks",
      rating: 4.2,
      popular: true,
    },
    {
      id: 502,
      name: "Sparkling Water",
      description: "Lightly carbonated mineral water with a slice of lemon.",
      price: 2.49,
      image: "/placeholder.svg?height=300&width=300",
      category: "Drinks",
      rating: 4.0,
    },
  ],
  desserts: [
    {
      id: 601,
      name: "Baklava",
      description: "Layers of flaky pastry with nuts and honey syrup.",
      price: 4.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Desserts",
      rating: 4.6,
    },
    {
      id: 602,
      name: "Tiramisu",
      description: "Classic Italian dessert with mascarpone and espresso-soaked ladyfingers.",
      price: 5.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Desserts",
      rating: 4.7,
    },
  ],
} satisfies MenuCatalog

export const validMenuCategories = Object.keys(menuCatalog)
