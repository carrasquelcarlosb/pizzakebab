import { type NextRequest, NextResponse } from "next/server"

// In a real app, this would be stored in a database
let cartItems: Array<{
  id: number
  name: string
  price: number
  quantity: number
  image: string
}> = []

// Next.js 15: GET route handler
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: cartItems,
      total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cart items",
      },
      { status: 500 },
    )
  }
}

// Next.js 15: POST route handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, price, quantity = 1, image } = body

    if (!id || !name || !price) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex((item) => item.id === id)

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cartItems[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      cartItems.push({ id, name, price, quantity, image })
    }

    return NextResponse.json({
      success: true,
      data: cartItems,
      message: "Item added to cart successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add item to cart",
      },
      { status: 500 },
    )
  }
}

// Next.js 15: DELETE route handler
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Item ID is required",
        },
        { status: 400 },
      )
    }

    cartItems = cartItems.filter((item) => item.id !== Number.parseInt(id))

    return NextResponse.json({
      success: true,
      data: cartItems,
      message: "Item removed from cart successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove item from cart",
      },
      { status: 500 },
    )
  }
}
