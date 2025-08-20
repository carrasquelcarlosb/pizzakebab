"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { LanguageProvider, useLanguage } from "@/contexts/language-context"

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

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  zipCode?: string
  paymentMethod?: string
  cardNumber?: string
  expiryDate?: string
  cvv?: string
}

function OrderContent() {
  const { t } = useLanguage()
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
  const [errors, setErrors] = useState<FormErrors>({})

  const handleInputChange = (field: keyof OrderForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<OrderForm> = {}

    if (!formData.firstName) newErrors.firstName = t("order.errors.firstNameRequired")
    if (!formData.lastName) newErrors.lastName = t("order.errors.lastNameRequired")
    if (!formData.email) newErrors.email = t("order.errors.emailRequired")
    if (!formData.phone) newErrors.phone = t("order.errors.phoneRequired")
    if (!formData.address) newErrors.address = t("order.errors.addressRequired")
    if (!formData.city) newErrors.city = t("order.errors.cityRequired")
    if (!formData.zipCode) newErrors.zipCode = t("order.errors.zipCodeRequired")
    if (!formData.paymentMethod) newErrors.paymentMethod = t("order.errors.paymentMethodRequired")

    if (formData.paymentMethod === "card") {
      if (!formData.cardNumber) newErrors.cardNumber = t("order.errors.cardNumberRequired")
      if (!formData.expiryDate) newErrors.expiryDate = t("order.errors.expiryDateRequired")
      if (!formData.cvv) newErrors.cvv = t("order.errors.cvvRequired")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, you would process the order here
      console.log("Order submitted:", formData)

      // Redirect to success page or show success message
      alert("Order placed successfully!")
    } catch (error) {
      console.error("Order submission failed:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
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
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8">{t("order.title")}</h1>

          <form onSubmit={(e) => onSubmit(e)} className="grid md:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("order.customerInfo")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t("order.firstName")}</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t("order.lastName")}</Label>
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
                    <Label htmlFor="email">{t("order.email")}</Label>
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
                    <Label htmlFor="phone">{t("order.phone")}</Label>
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

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("order.deliveryAddress")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">{t("order.streetAddress")}</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className={errors.address ? "border-red-500" : ""}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">{t("order.city")}</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className={errors.city ? "border-red-500" : ""}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="zipCode">{t("order.zipCode")}</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        className={errors.zipCode ? "border-red-500" : ""}
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("order.paymentMethod")}</CardTitle>
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
                      <span>{t("order.creditCard")}</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="cash"
                        checked={formData.paymentMethod === "cash"}
                        onChange={() => handleInputChange("paymentMethod", "cash")}
                      />
                      <span>{t("order.cashOnDelivery")}</span>
                    </label>
                  </div>

                  {formData.paymentMethod === "card" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="cardNumber">{t("order.cardNumber")}</Label>
                        <Input
                          id="cardNumber"
                          placeholder={t("order.cardNumberPlaceholder")}
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                          className={errors.cardNumber ? "border-red-500" : ""}
                        />
                        {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">{t("order.expiryDate")}</Label>
                          <Input
                            id="expiryDate"
                            placeholder={t("order.expiryPlaceholder")}
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                            className={errors.expiryDate ? "border-red-500" : ""}
                          />
                          {errors.expiryDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="cvv">{t("order.cvv")}</Label>
                          <Input
                            id="cvv"
                            placeholder={t("order.cvvPlaceholder")}
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

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{t("order.orderSummary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t("food.spicyKebabPizza.name")}</span>
                      <span>$14.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("food.mixedGrillKebab.name")}</span>
                      <span>$16.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("food.garlicCheeseBread.name")}</span>
                      <span>$5.99</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t("order.subtotal")}</span>
                      <span>$37.97</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("order.deliveryFee")}</span>
                      <span>$2.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("order.tax")}</span>
                      <span>$3.28</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>{t("order.total")}</span>
                    <span>$44.24</span>
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 mt-6" disabled={isSubmitting}>
                    {isSubmitting ? t("order.processing") : t("order.placeOrder")}
                  </Button>
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
    <LanguageProvider>
      <OrderContent />
    </LanguageProvider>
  )
}
