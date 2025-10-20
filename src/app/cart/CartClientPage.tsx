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
import { LanguageProvider, useLanguage } from "@/contexts/language-context"
import { calculatePricingBreakdown } from "@/lib/pricing"
import { sampleCartItems } from "@/lib/sample-cart-items"

function CartContent() {
  const [cartItems, setCartItems] = useState(sampleCartItems)
  const { t } = useLanguage()

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return

    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const pricing = calculatePricingBreakdown(cartItems)

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

          {cartItems.length === 0 ? (
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
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 rounded-md overflow-hidden">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
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
                          <div className="font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
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
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>{t("cart.subtotal")}</span>
                        <span>${pricing.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("cart.deliveryFee")}</span>
                        <span>${pricing.deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("cart.tax")}</span>
                        <span>${pricing.tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>{t("cart.total")}</span>
                        <span>${pricing.total.toFixed(2)}</span>
                      </div>

                      <div className="pt-4">
                        <Input placeholder={t("cart.promoCode")} className="mb-4" />
                        <Button className="w-full bg-red-600 hover:bg-red-700 mb-2">
                          {t("cart.proceedToCheckout")}
                        </Button>
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
    <LanguageProvider>
      <CartContent />
    </LanguageProvider>
  )
}
