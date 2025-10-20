"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"

export function CartButton() {
  const { totalItems } = useCart()

  return (
    <Link href="/cart">
      <Button variant="outline" size="icon" className="relative rounded-full">
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
            {totalItems}
          </span>
        )}
      </Button>
    </Link>
  )
}
