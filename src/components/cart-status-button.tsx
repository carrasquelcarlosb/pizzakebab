"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

interface CartStatusButtonProps {
  className?: string
}

export function CartStatusButton({ className }: CartStatusButtonProps) {
  const { totalItems } = useCart()
  const { t } = useLanguage()

  return (
    <Button
      asChild
      variant="outline"
      size="icon"
      className={cn("relative rounded-full", className)}
    >
      <Link href="/cart" aria-label={t("nav.cart")}
        className="flex h-full w-full items-center justify-center"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
            {totalItems}
          </span>
        )}
      </Link>
    </Button>
  )
}
