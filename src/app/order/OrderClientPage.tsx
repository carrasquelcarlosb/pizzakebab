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
import { calculatePricingBreakdown } from "@/lib/pricing"
import { sampleCartItems } from "@/lib/sample-cart-items"
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
  const [errors, setErrors] = useState<OrderFormErrors>({})
  const addressLabels = getAddressLabels(t)
  const orderItems = sampleCartItems
  const pricing = calculatePricingBreakdown(orderItems)

  const handleInputChange = (field: keyof OrderForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
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
          <h1 className="text-3xl font-bold mb-8">Complete Your Order</h1>

          <form onSubmit={(e) => onSubmit(e)} className="grid md:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
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
                    <Label htmlFor="email">Email</Label>
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
                    <Label htmlFor="phone">Phone</Label>
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
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">{addressLabels.address}</Label>
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
                      <Label htmlFor="city">{addressLabels.city}</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className={errors.city ? "border-red-500" : ""}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="zipCode">{addressLabels.zipCode}</Label>
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
                  <CardTitle>Payment Method</CardTitle>
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
                      <span>Credit/Debit Card</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="cash"
                        checked={formData.paymentMethod === "cash"}
                        onChange={() => handleInputChange("paymentMethod", "cash")}
                      />
                      <span>Cash on Delivery</span>
                    </label>
                  </div>

                  {formData.paymentMethod === "card" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                          className={errors.cardNumber ? "border-red-500" : ""}
                        />
                        {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                            className={errors.expiryDate ? "border-red-500" : ""}
                          />
                          {errors.expiryDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
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
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.name}
                          {item.quantity > 1 ? ` ×${item.quantity}` : ""}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
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
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>{t("cart.total")}</span>
                    <span>${pricing.total.toFixed(2)}</span>
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 mt-6" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Place Order"}
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
