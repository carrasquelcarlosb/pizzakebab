"use client"

import type React from "react"

import { useMemo, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { AppProviders } from "@/components/app-providers"
import { useLanguage } from "@/contexts/language-context"
import { useCart } from "@/contexts/cart-context"
import { CartButton } from "@/components/cart-button"
import { formatCurrency } from "@/lib/cart"

interface OrderForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  zipCode: string
  paymentMethod: string
  cardNumber?: string
  expiryDate?: string
  cvv?: string
}

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

function OrderContent() {
  const { t, language } = useLanguage()
  const { items, subtotal, deliveryFee, total, orderMode, setOrderMode } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<OrderForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof OrderForm, string>>>({})

  const locale = localeMap[language] ?? "en-US"
  const currency = currencyMap[language] ?? "USD"
  const isPickup = orderMode === "pickup"
  const requiredMessage = t("checkout.errors.required")

  const handleInputChange = (field: keyof OrderForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof OrderForm, string>> = {}

    const baseFields: Array<keyof OrderForm> = ["firstName", "lastName", "email", "phone", "paymentMethod"]
    const addressFields: Array<keyof OrderForm> = ["address", "city", "zipCode"]

    for (const field of baseFields) {
      if (!formData[field]) {
        newErrors[field] = requiredMessage
      }
    }

    if (!isPickup) {
      for (const field of addressFields) {
        if (!formData[field]) {
          newErrors[field] = requiredMessage
        }
      }
    }

    if (formData.paymentMethod === "card") {
      for (const field of ["cardNumber", "expiryDate", "cvv"] as Array<keyof OrderForm>) {
        if (!formData[field]) {
          newErrors[field] = requiredMessage
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      alert(t("checkout.success"))
    } catch (error) {
      console.error("Order submission failed:", error)
      alert(t("checkout.failure"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const orderModeLabel = useMemo(
    () => (orderMode === "delivery" ? t("cart.delivery") : t("cart.pickup")),
    [orderMode, t],
  )
  const selectedModeLabel = `${t("checkout.selectedModePrefix")} ${orderModeLabel}`

  if (items.length === 0) {
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
            <CartButton />
          </div>
        </header>
        <main className="flex-1">
          <div className="container py-16 text-center space-y-6">
            <h1 className="text-3xl font-bold">{t("checkout.emptyTitle")}</h1>
            <p className="text-muted-foreground">{t("checkout.emptySubtitle")}</p>
            <Link href="/menu">
              <Button className="bg-red-600 hover:bg-red-700">{t("cart.browseMenu")}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
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
          <CartButton />
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">{t("checkout.title")}</h1>
            <div className="text-sm text-muted-foreground">{selectedModeLabel}</div>
          </div>

          <form onSubmit={(e) => onSubmit(e)} className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("checkout.sections.customerInformation")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t("checkout.fields.firstName")}</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t("checkout.fields.lastName")}</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">{t("checkout.fields.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">{t("checkout.fields.phone")}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className={isPickup ? "opacity-75" : ""}>
                <CardHeader>
                  <CardTitle>{t("checkout.sections.deliveryAddress")}</CardTitle>
                  {isPickup && (
                    <p className="text-sm text-muted-foreground">{t("checkout.pickupNotice")}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">{t("checkout.fields.address")}</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className={errors.address ? "border-red-500" : ""}
                      disabled={isPickup}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">{t("checkout.fields.city")}</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className={errors.city ? "border-red-500" : ""}
                        disabled={isPickup}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="zipCode">{t("checkout.fields.zipCode")}</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        className={errors.zipCode ? "border-red-500" : ""}
                        disabled={isPickup}
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("checkout.sections.paymentMethod")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="card"
                        checked={formData.paymentMethod === "card"}
                        onChange={() => handleInputChange("paymentMethod", "card")}
                      />
                      <span>{t("checkout.payment.card")}</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="cash"
                        checked={formData.paymentMethod === "cash"}
                        onChange={() => handleInputChange("paymentMethod", "cash")}
                      />
                      <span>{t("checkout.payment.cash")}</span>
                    </label>
                    {errors.paymentMethod && <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>}
                  </div>

                  {formData.paymentMethod === "card" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="cardNumber">{t("checkout.fields.cardNumber")}</Label>
                        <Input
                          id="cardNumber"
                          placeholder={t("checkout.placeholders.cardNumber")}
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                          className={errors.cardNumber ? "border-red-500" : ""}
                        />
                        {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">{t("checkout.fields.expiryDate")}</Label>
                          <Input
                            id="expiryDate"
                            placeholder={t("checkout.placeholders.expiryDate")}
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                            className={errors.expiryDate ? "border-red-500" : ""}
                          />
                          {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                        </div>
                        <div>
                          <Label htmlFor="cvv">{t("checkout.fields.cvv")}</Label>
                          <Input
                            id="cvv"
                            placeholder={t("checkout.placeholders.cvv")}
                            value={formData.cvv}
                            onChange={(e) => handleInputChange("cvv", e.target.value)}
                            className={errors.cvv ? "border-red-500" : ""}
                          />
                          {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{t("checkout.sections.orderSummary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2" role="group" aria-label={t("cart.orderModeLabel")}>
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
                  <p className="text-xs text-muted-foreground">
                    {orderMode === "delivery" ? t("cart.deliveryDescription") : t("cart.pickupDescription")}
                  </p>

                  <Separator />

                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.name}
                          <span className="text-muted-foreground"> × {item.quantity}</span>
                        </span>
                        <span>{formatCurrency(item.price * item.quantity, locale, currency)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t("cart.subtotal")}</span>
                      <span>{formatCurrency(subtotal, locale, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("cart.deliveryFee")}</span>
                      <span>{orderMode === "pickup" ? t("cart.free") : formatCurrency(deliveryFee, locale, currency)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>{t("cart.total")}</span>
                    <span>{formatCurrency(total, locale, currency)}</span>
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 mt-6" disabled={isSubmitting}>
                    {isSubmitting ? t("checkout.actions.processing") : t("checkout.actions.placeOrder")}
                  </Button>

                  <Link href="/cart" className="block">
                    <Button type="button" variant="outline" className="w-full">
                      {t("checkout.actions.backToCart")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function OrderClientPage() {
  return (
    <AppProviders>
      <OrderContent />
    </AppProviders>
  )
}
