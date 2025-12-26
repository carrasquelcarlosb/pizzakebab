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
import { CartButton } from "@/components/cart-button"
import { useLanguage } from "@/contexts/language-context"
import { useCart } from "@/contexts/cart-context"
import { formatCurrency as formatMenuCurrency } from "@/lib/menu-data"
import { getAddressLabels, validateAddressFields, type AddressFields } from "@/lib/address"

interface OrderForm extends AddressFields {
  firstName: string
  lastName: string
  email: string
  phone: string
  paymentMethod: string
  cardNumber?: string
  expiryDate?: string
  cvv?: string
}

type OrderFormErrors = Partial<Record<keyof OrderForm, string>>

function OrderContent() {
  const { t, language } = useLanguage()
  const {
    items,
    subtotal,
    deliveryFee,
    discount,
    total,
    orderMode,
    setOrderMode,
    submitCurrentOrder,
    isLoading,
  } = useCart()
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
  const [errors, setErrors] = useState<OrderFormErrors>({})
  const addressLabels = getAddressLabels(t)

  const handleInputChange = (field: keyof OrderForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: OrderFormErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.paymentMethod) newErrors.paymentMethod = "Payment method is required"

    const addressErrors = validateAddressFields(
      {
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
      },
      t,
    )

    Object.assign(newErrors, addressErrors)

    if (formData.paymentMethod === "card") {
      if (!formData.cardNumber?.trim()) newErrors.cardNumber = "Card number is required"
      if (!formData.expiryDate?.trim()) newErrors.expiryDate = "Expiry date is required"
      if (!formData.cvv?.trim()) newErrors.cvv = "CVV is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await submitCurrentOrder({
        customer: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
        },
      })
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
  const isPickup = orderMode === "pickup"
  const formatCurrency = (value: number) => formatMenuCurrency(value, language)

  if (isLoading && items.length === 0) {
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
          <div className="container py-16 text-center text-muted-foreground">Loading order…</div>
        </main>
        <Footer />
      </div>
    )
  }

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

          <form onSubmit={(event) => onSubmit(event)} className="grid md:grid-cols-2 gap-8">
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
                        onChange={(event) => handleInputChange("firstName", event.target.value)}
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t("checkout.fields.lastName")}</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(event) => handleInputChange("lastName", event.target.value)}
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
                      onChange={(event) => handleInputChange("email", event.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">{t("checkout.fields.phone")}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(event) => handleInputChange("phone", event.target.value)}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className={isPickup ? "opacity-75" : ""}>
                <CardHeader>
                  <CardTitle>{t("checkout.sections.deliveryAddress")}</CardTitle>
                  {isPickup && <p className="text-sm text-muted-foreground">{t("checkout.pickupNotice")}</p>}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">{addressLabels.address}</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(event) => handleInputChange("address", event.target.value)}
                      className={errors.address ? "border-red-500" : ""}
                      disabled={isPickup}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">{addressLabels.city}</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(event) => handleInputChange("city", event.target.value)}
                        className={errors.city ? "border-red-500" : ""}
                        disabled={isPickup}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="zipCode">{addressLabels.zipCode}</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(event) => handleInputChange("zipCode", event.target.value)}
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
                          onChange={(event) => handleInputChange("cardNumber", event.target.value)}
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
                            onChange={(event) => handleInputChange("expiryDate", event.target.value)}
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
                            onChange={(event) => handleInputChange("cvv", event.target.value)}
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
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.name}
                          {item.quantity > 1 ? ` ×${item.quantity}` : ""}
                        </span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
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
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>{t("cart.total")}</span>
                    <span>{formatCurrency(total)}</span>
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

