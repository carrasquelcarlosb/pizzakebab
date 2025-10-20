"use client"

import type React from "react"

import Link from "next/link"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
import type { TranslationKey } from "@/lib/translations"

type PaymentMethod = "card" | "cash"
type FulfillmentMethod = "delivery" | "pickup"

interface OrderForm {
   firstName: string
   lastName: string
   email: string
   phone: string
   address: string
   city: string
   zipCode: string
   paymentMethod: PaymentMethod | ""
   cardNumber?: string
   expiryDate?: string
   cvv?: string
 }

interface ResolvedSummaryLine {
   id: number
   quantity: number
   item: LocalizedMenuItem
 }

type OrderField = keyof OrderForm

const errorTranslationKeys: Record<OrderField, TranslationKey> = {
   firstName: "orderPage.errors.firstName",
   lastName: "orderPage.errors.lastName",
   email: "orderPage.errors.email",
   phone: "orderPage.errors.phone",
   address: "orderPage.errors.address",
   city: "orderPage.errors.city",
   zipCode: "orderPage.errors.zipCode",
   paymentMethod: "orderPage.errors.paymentMethod",
   cardNumber: "orderPage.errors.cardNumber",
   expiryDate: "orderPage.errors.expiryDate",
   cvv: "orderPage.errors.cvv",
 }

const cardSpecificFields: OrderField[] = ["cardNumber", "expiryDate", "cvv"]

function OrderContent() {
   const { t, language } = useLanguage()
   const { items, clear } = useCart()
   const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("delivery")
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
   const [errors, setErrors] = useState<Partial<Record<OrderField, string>>>({})

   const summaryItems = useMemo(() => {
     return items.reduce<ResolvedSummaryLine[]>((accumulator, line) => {
       const localizedItem = getLocalizedMenuItemById(line.id, t)
       if (!localizedItem) {
         return accumulator
       }
       accumulator.push({ ...line, item: localizedItem })
       return accumulator
     }, [])
   }, [items, t])

   const isCartEmpty = summaryItems.length === 0
   const isDelivery = fulfillmentMethod === "delivery"

   const formatPrice = (value: number) => formatCurrency(value, language)

   const summarySubtotal = summaryItems.reduce(
     (sum, line) => sum + line.item.price * line.quantity,
     0,
   )
   const deliveryFee = isDelivery ? 2.99 : 0
   const taxRate = 0.08
   const tax = summarySubtotal * taxRate
   const orderTotal = summarySubtotal + deliveryFee + tax

   const handleInputChange = (field: OrderField, value: string) => {
     setFormData((previous) => ({ ...previous, [field]: value }))
     if (errors[field]) {
       setErrors((previous) => ({ ...previous, [field]: undefined }))
     }
   }

   const isEmpty = (value: string | PaymentMethod | undefined | "") => {
     if (value === undefined) return true
     return String(value).trim().length === 0
   }

   const validateForm = (): boolean => {
     const newErrors: Partial<Record<OrderField, string>> = {}

     const requiredFields: OrderField[] = [
       "firstName",
       "lastName",
       "email",
       "phone",
       "paymentMethod",
     ]

     if (isDelivery) {
       requiredFields.push("address", "city", "zipCode")
     }

     for (const field of requiredFields) {
       if (isEmpty(formData[field])) {
         newErrors[field] = t(errorTranslationKeys[field])
       }
     }

     if (formData.paymentMethod === "card") {
       for (const field of cardSpecificFields) {
         if (isEmpty(formData[field])) {
           newErrors[field] = t(errorTranslationKeys[field])
         }
       }
     }

     setErrors(newErrors)
     return Object.keys(newErrors).length === 0
   }

   const onSubmit = async (event: React.FormEvent) => {
     event.preventDefault()

     if (isCartEmpty) {
       return
     }

     if (!validateForm()) {
       return
     }

     setIsSubmitting(true)

     try {
       await new Promise((resolve) => setTimeout(resolve, 2000))
       console.log("Order submitted:", { formData, fulfillmentMethod, items })
       clear()
       setFormData({
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
       setFulfillmentMethod("delivery")
       window.alert(t("orderPage.notifications.success"))
     } catch (error) {
       console.error("Order submission failed:", error)
       window.alert(t("orderPage.notifications.failure"))
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
           <h1 className="text-3xl font-bold mb-8">{t("orderPage.title")}</h1>

           {isCartEmpty ? (
             <Card className="max-w-xl mx-auto">
               <CardHeader>
                 <CardTitle>{t("orderPage.empty.title")}</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <p className="text-muted-foreground">{t("orderPage.empty.subtitle")}</p>
                 <Button asChild className="bg-red-600 hover:bg-red-700">
                   <Link href="/menu">{t("orderPage.empty.cta")}</Link>
                 </Button>
               </CardContent>
             </Card>
           ) : (
             <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <Card>
                   <CardHeader>
                     <CardTitle>{t("orderPage.sections.fulfillment")}</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <Button
                         type="button"
                         variant={isDelivery ? "default" : "outline"}
                         className="h-auto py-4 flex-col items-start text-left"
                         onClick={() => setFulfillmentMethod("delivery")}
                       >
                         <span className="font-semibold">{t("orderPage.fulfillment.delivery")}</span>
                         <span className="text-sm text-muted-foreground">
                           {t("orderPage.fulfillment.deliveryDescription")}
                         </span>
                       </Button>
                       <Button
                         type="button"
                         variant={!isDelivery ? "default" : "outline"}
                         className="h-auto py-4 flex-col items-start text-left"
                         onClick={() => setFulfillmentMethod("pickup")}
                       >
                         <span className="font-semibold">{t("orderPage.fulfillment.pickup")}</span>
                         <span className="text-sm text-muted-foreground">
                           {t("orderPage.fulfillment.pickupDescription")}
                         </span>
                       </Button>
                     </div>
                   </CardContent>
                 </Card>

                 <Card>
                   <CardHeader>
                     <CardTitle>{t("orderPage.sections.customerInformation")}</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <Label htmlFor="firstName">{t("orderPage.fields.firstName")}</Label>
                         <Input
                           id="firstName"
                           value={formData.firstName}
                           onChange={(event) => handleInputChange("firstName", event.target.value)}
                           className={errors.firstName ? "border-red-500" : ""}
                         />
                         {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                       </div>
                       <div>
                         <Label htmlFor="lastName">{t("orderPage.fields.lastName")}</Label>
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
                       <Label htmlFor="email">{t("orderPage.fields.email")}</Label>
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
                       <Label htmlFor="phone">{t("orderPage.fields.phone")}</Label>
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

                 {isDelivery && (
                   <Card>
                     <CardHeader>
                       <CardTitle>{t("orderPage.sections.deliveryAddress")}</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                       <div>
                         <Label htmlFor="address">{t("orderPage.fields.address")}</Label>
                         <Input
                           id="address"
                           value={formData.address}
                           onChange={(event) => handleInputChange("address", event.target.value)}
                           className={errors.address ? "border-red-500" : ""}
                         />
                         {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <Label htmlFor="city">{t("orderPage.fields.city")}</Label>
                           <Input
                             id="city"
                             value={formData.city}
                             onChange={(event) => handleInputChange("city", event.target.value)}
                             className={errors.city ? "border-red-500" : ""}
                           />
                           {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                         </div>
                         <div>
                           <Label htmlFor="zipCode">{t("orderPage.fields.zipCode")}</Label>
                           <Input
                             id="zipCode"
                             value={formData.zipCode}
                             onChange={(event) => handleInputChange("zipCode", event.target.value)}
                             className={errors.zipCode ? "border-red-500" : ""}
                           />
                           {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 )}

                 <Card>
                   <CardHeader>
                     <CardTitle>{t("orderPage.sections.paymentMethod")}</CardTitle>
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
                         <span>{t("orderPage.paymentMethods.card")}</span>
                       </label>
                       <label className="flex items-center space-x-2">
                         <input
                           type="radio"
                           value="cash"
                           checked={formData.paymentMethod === "cash"}
                           onChange={() => handleInputChange("paymentMethod", "cash")}
                         />
                         <span>{t("orderPage.paymentMethods.cash")}</span>
                       </label>
                     </div>

                     {errors.paymentMethod && (
                       <p className="text-red-500 text-sm">{errors.paymentMethod}</p>
                     )}

                     {formData.paymentMethod === "card" && (
                       <div className="space-y-4 pt-4 border-t">
                         <div>
                           <Label htmlFor="cardNumber">{t("orderPage.fields.cardNumber")}</Label>
                           <Input
                             id="cardNumber"
                             placeholder={t("orderPage.placeholders.cardNumber")}
                             value={formData.cardNumber}
                             onChange={(event) => handleInputChange("cardNumber", event.target.value)}
                             className={errors.cardNumber ? "border-red-500" : ""}
                           />
                           {errors.cardNumber && (
                             <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                           )}
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <Label htmlFor="expiryDate">{t("orderPage.fields.expiryDate")}</Label>
                             <Input
                               id="expiryDate"
                               placeholder={t("orderPage.placeholders.expiryDate")}
                               value={formData.expiryDate}
                               onChange={(event) => handleInputChange("expiryDate", event.target.value)}
                               className={errors.expiryDate ? "border-red-500" : ""}
                             />
                             {errors.expiryDate && (
                               <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                             )}
                           </div>
                           <div>
                             <Label htmlFor="cvv">{t("orderPage.fields.cvv")}</Label>
                             <Input
                               id="cvv"
                               placeholder={t("orderPage.placeholders.cvv")}
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
                     <CardTitle>{t("orderPage.sections.summary")}</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="space-y-2">
                       {summaryItems.map(({ id, item, quantity }) => {
                         const lineTotal = item.price * quantity
                         return (
                           <div className="flex justify-between" key={id}>
                             <span>
                               {item.name} × {quantity}
                             </span>
                             <span>{formatPrice(lineTotal)}</span>
                           </div>
                         )
                       })}
                     </div>

                     <Separator />

                     <div className="space-y-2 text-sm text-muted-foreground">
                       <div className="flex justify-between">
                         <span>{t("orderPage.summary.fulfillment")}</span>
                         <span>
                           {t(
                             fulfillmentMethod === "delivery"
                               ? "orderPage.fulfillment.delivery"
                               : "orderPage.fulfillment.pickup",
                           )}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span>{t("orderPage.summary.subtotal")}</span>
                         <span>{formatPrice(summarySubtotal)}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>{t("orderPage.summary.deliveryFee")}</span>
                         <span>{formatPrice(deliveryFee)}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>{t("orderPage.summary.tax")}</span>
                         <span>{formatPrice(tax)}</span>
                       </div>
                     </div>

                     <Separator />

                     <div className="flex justify-between font-bold text-lg">
                       <span>{t("orderPage.summary.total")}</span>
                       <span>{formatPrice(orderTotal)}</span>
                     </div>

                     <Button
                       type="submit"
                       className="w-full bg-red-600 hover:bg-red-700 mt-6"
                       disabled={isSubmitting}
                     >
                       {isSubmitting
                         ? t("orderPage.actions.processing")
                         : t("orderPage.actions.placeOrder")}
                     </Button>
                   </CardContent>
                 </Card>
               </div>
             </form>
           )}
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
