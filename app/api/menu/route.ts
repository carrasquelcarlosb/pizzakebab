import { type NextRequest, NextResponse } from "next/server"

import { menuCatalog } from "@/data/menu-catalog"

// Next.js 15: GET route handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = searchParams.get("limit")
    const sort = searchParams.get("sort")

    const catalogValues = Object.values(menuCatalog)
    let data = category ? menuCatalog[category] || [] : catalogValues.flat()

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
