"use client"

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
import { useLanguage } from "@/contexts/language-context"
import { useCart } from "@/contexts/cart-context"
import { CartButton } from "@/components/cart-button"
import { formatCurrency } from "@/lib/cart"

const localeMap: Record<string, string> = {
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
}
const currencyMap: Record<string, string> = {
  en: "USD",
  fr: "EUR",
  de: "EUR",
}

function CartContent() {
  const { t, language } = useLanguage()
  const { items, updateQuantity, removeItem, subtotal, deliveryFee, total, orderMode, setOrderMode } = useCart()

  const locale = localeMap[language] ?? "en-US"
  const currency = currencyMap[language] ?? "USD"

  const handleDecrease = (id: number, quantity: number) => {
    updateQuantity(id, quantity - 1)
  }

  const handleIncrease = (id: number, quantity: number) => {
    updateQuantity(id, quantity + 1)
  }

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

          {items.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">{t("cart.empty")}</h2>
              <p className="text-muted-foreground mb-6">{t("cart.emptySubtitle")}</p>
              <Link href="/menu">
                <Button className="bg-red-600 hover:bg-red-700">{t("cart.browseMenu")}</Button>
              </Link>
            </div>
          ) : (
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
                          <p className="text-muted-foreground">{formatCurrency(item.price, locale, currency)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDecrease(item.id, item.quantity)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleIncrease(item.id, item.quantity)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <div className="font-semibold">{formatCurrency(item.price * item.quantity, locale, currency)}</div>
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
              </div>

              <div>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">{t("cart.orderSummary")}</h2>
                    <div className="mb-6">
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
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>{t("cart.subtotal")}</span>
                        <span>{formatCurrency(subtotal, locale, currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("cart.deliveryFee")}</span>
                        <span>{orderMode === "pickup" ? t("cart.free") : formatCurrency(deliveryFee, locale, currency)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>{t("cart.total")}</span>
                        <span>{formatCurrency(total, locale, currency)}</span>
                      </div>

                      <div className="pt-4">
                        <Input placeholder={t("cart.promoCode")} className="mb-4" />
                        <Link href="/order">
                          <Button className="w-full bg-red-600 hover:bg-red-700 mb-2">
                            {t("cart.proceedToCheckout")}
                          </Button>
                        </Link>
                        <Link href="/menu">
                          <Button variant="outline" className="w-full">
                            {t("cart.continueShopping")}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function CartPageClient() {
  return (
    <AppProviders>
      <CartContent />
    </AppProviders>
  )
}
