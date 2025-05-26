import { type NextRequest, NextResponse } from "next/server"

// Sample menu data
const menuData = {
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
      ingredients: ["kebab meat", "jalapeños", "mozzarella", "tomato sauce", "spicy sauce"],
      allergens: ["gluten", "dairy"],
    },
    // Add more items...
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
      ingredients: ["chicken", "beef", "lamb", "grilled vegetables", "rice"],
      allergens: [],
    },
    // Add more items...
  ],
}

// Next.js 15: GET route handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = searchParams.get("limit")
    const sort = searchParams.get("sort")

    let data = category ? menuData[category as keyof typeof menuData] || [] : Object.values(menuData).flat()

    // Apply sorting
    if (sort === "price-low") {
      data = data.sort((a, b) => a.price - b.price)
    } else if (sort === "price-high") {
      data = data.sort((a, b) => b.price - a.price)
    } else if (sort === "rating") {
      data = data.sort((a, b) => b.rating - a.rating)
    }

    // Apply limit
    if (limit) {
      data = data.slice(0, Number.parseInt(limit))
    }

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch menu items",
      },
      { status: 500 },
    )
  }
}

// Next.js 15: POST route handler for adding new menu items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { name, description, price, category } = body
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // In a real app, you would save to a database
    const newItem = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newItem,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create menu item",
      },
      { status: 500 },
    )
  }
}
