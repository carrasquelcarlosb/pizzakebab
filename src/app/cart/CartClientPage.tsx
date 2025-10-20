"use client"

import { useMemo } from "react"
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
import { useLanguage } from "@/contexts/language-context"
import { AppProviders } from "@/contexts/app-providers"
import { useCart } from "@/contexts/cart-context"
import {
  formatCurrency,
  getLocalizedMenuItemById,
  type LocalizedMenuItem,
} from "@/lib/menu-data"

interface ResolvedCartItem {
  id: number
  quantity: number
  item: LocalizedMenuItem
}

function CartContent() {
  const { t, language } = useLanguage()
  const { items, updateItemQuantity, removeItem } = useCart()

  const resolvedItems = useMemo(() => {
    return items.reduce<ResolvedCartItem[]>((accumulator, line) => {
      const localizedItem = getLocalizedMenuItemById(line.id, t)
      if (!localizedItem) {
        return accumulator
      }
      accumulator.push({ ...line, item: localizedItem })
      return accumulator
    }, [])
  }, [items, t])

  const subtotal = resolvedItems.reduce(
    (sum, line) => sum + line.item.price * line.quantity,
    0,
  )
  const deliveryFee = resolvedItems.length > 0 ? 2.99 : 0
  const total = subtotal + deliveryFee

  const formatPrice = (value: number) => formatCurrency(value, language)
  const isCartEmpty = resolvedItems.length === 0

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
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8">{t("cart.title")}</h1>

          {isCartEmpty ? (
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
                {resolvedItems.map(({ id, item, quantity }) => {
                  const lineTotal = item.price * quantity

                  return (
                    <Card key={id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-20 w-20 rounded-md overflow-hidden">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-muted-foreground">{formatPrice(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateItemQuantity(id, quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateItemQuantity(id, quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <div className="font-semibold">{formatPrice(lineTotal)}</div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                              onClick={() => removeItem(id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">{t("cart.orderSummary")}</h2>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>{t("cart.subtotal")}</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("cart.deliveryFee")}</span>
                        <span>{formatPrice(deliveryFee)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>{t("cart.total")}</span>
                        <span>{formatPrice(total)}</span>
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
