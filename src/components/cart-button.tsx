"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useLanguage } from "@/contexts/language-context"

export function CartButton() {
  const { itemCount } = useCart()
  const { t } = useLanguage()

  return (
    <Link href="/cart">
      <Button variant="outline" size="icon" className="relative rounded-full" aria-label={t("nav.cart")}>
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
            {itemCount}
          </span>
        )}
      </Button>
    </Link>
  )
}
