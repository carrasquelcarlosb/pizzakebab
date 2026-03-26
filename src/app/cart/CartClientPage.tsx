"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { AppProviders } from "@/components/app-providers"
import { CartButton } from "@/components/cart-button"
import { useCart } from "@/contexts/cart-context"
import { useLanguage } from "@/contexts/language-context"
import { formatCurrency as formatMenuCurrency } from "@/lib/menu-data"

function CartContent() {
  const { t, language } = useLanguage()
  const {
    items,
    orderMode,
    setOrderMode,
    subtotal,
    deliveryFee,
    discount,
    total,
    removeItem,
    updateQuantity,
    clearCart,
    applyPromoCode,
    promoCode,
    isLoading,
    error,
    refreshCart,
  } = useCart()
  const [promoInput, setPromoInput] = useState(promoCode ?? "")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  const formatCurrency = (value: number) => formatMenuCurrency(value, language)

  const handleApplyPromo = async () => {
    setIsApplyingPromo(true)
    try {
      await applyPromoCode(promoInput.trim() ? promoInput.trim() : null)
    } finally {
      setIsApplyingPromo(false)
    }
  }

  if (isLoading && items.length === 0) {
    return <div className="py-16 text-center text-muted-foreground">Loading cart…</div>
  }

  if (error && items.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-red-600 font-semibold">{t("checkout.failure")}</p>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => void refreshCart()} variant="outline" className="rounded-full">
          Retry
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center space-y-6">
        <h2 className="text-2xl font-semibold">{t("cart.empty")}</h2>
        <p className="text-muted-foreground">{t("cart.emptySubtitle")}</p>
        <div className="flex justify-center gap-4">
          <Link href="/menu">
            <Button className="bg-red-600 hover:bg-red-700 rounded-full">{t("cart.browseMenu")}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 rounded-md overflow-hidden">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-muted-foreground">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right min-w-[80px]">
                  <div className="font-semibold">{formatCurrency(item.price * item.quantity)}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => void clearCart()} className="text-red-600 hover:text-red-700">
            Clear cart
          </Button>
        </div>
      </div>

      <div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold">{t("cart.orderSummary")}</h2>

            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">{t("cart.orderModeLabel")}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={orderMode === "delivery" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setOrderMode("delivery")}
                >
                  {t("cart.delivery")}
                </Button>
                <Button
                  type="button"
                  variant={orderMode === "pickup" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setOrderMode("pickup")}
                >
                  {t("cart.pickup")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {orderMode === "delivery" ? t("cart.deliveryDescription") : t("cart.pickupDescription")}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>{t("cart.subtotal")}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("cart.deliveryFee")}</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>{t("cart.total")}</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Input
                placeholder={t("cart.promoCode")}
                value={promoInput}
                onChange={(event) => setPromoInput(event.target.value)}
              />
              <Button className="w-full" onClick={handleApplyPromo} disabled={isApplyingPromo} variant="outline">
                {isApplyingPromo ? "Applying…" : "Apply"}
              </Button>
              <Link href="/order">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  {t("cart.proceedToCheckout")}
                </Button>
              </Link>
              <Link href="/menu">
                <Button variant="outline" className="w-full">
                  {t("cart.continueShopping")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CartPageLayout() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="hidden md:flex">
            <MainNav />
          </div>
          <div className="md:hidden">
            <MobileNav />
          </div>
          <div className="flex items-center gap-4">
            <CartButton />
            <Link href="/menu">
              <Button variant="outline" className="rounded-full">
                {t("cart.continueShopping")}
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8">{t("cart.title")}</h1>
          <CartContent />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function CartPageClient() {
  return (
    <AppProviders>
      <CartPageLayout />
    </AppProviders>
  )
}

