"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InteractiveMenuCard } from "@/components/interactive-menu-card"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { LanguageProvider, useLanguage } from "@/contexts/language-context"
import { CartProvider } from "@/contexts/cart-context"

function MenuContent() {
  const { t } = useLanguage()

  // Update menu items with translations
  const menuItems = {
    pizzas: [
      {
        id: 101,
        name: t("food.spicyKebabPizza.name"),
        description: t("food.spicyKebabPizza.description"),
        price: 14.99,
        image: "/placeholder.svg?height=300&width=300",
        category: t("common.specialtyPizzas"),
        rating: 4.8,
        popular: true,
      },
      {
        id: 102,
        name: t("food.margherita.name"),
        description: t("food.margherita.description"),
        price: 11.99,
        image: "/placeholder.svg?height=300&width=300",
        category: t("common.classicPizzas"),
        rating: 4.6,
      },
      {
        id: 103,
        name: t("food.meatFeastPizza.name"),
        description: t("food.meatFeastPizza.description"),
        price: 15.99,
        image: "/placeholder.svg?height=300&width=300",
        category: t("common.specialtyPizzas"),
        discount: 10,
        rating: 4.9,
      },
      {
        id: 104,
        name: t("food.veggieSupreme.name"),
        description: t("food.veggieSupreme.description"),
        price: 13.99,
        image: "/placeholder.svg?height=300&width=300",
        category: t("common.vegetarian"),
        rating: 4.4,
      },
    ],
    kebabs: [
      {
        id: 201,
        name: t("food.mixedGrillKebab.name"),
        description: t("food.mixedGrillKebab.description"),
        price: 16.99,
        image: "/placeholder.svg?height=300&width=300",
        category: t("categories.kebabs"),
        rating: 4.7,
      },
      {
        id: 202,
        name: t("food.chickenShish.name"),
        description: t("food.chickenShish.description"),
        price: 13.99,
        image: "/placeholder.svg?height=300&width=300",
        category: t("categories.kebabs"),
        rating: 4.5,
      },
      {
        id: 203,
        name: t("food.lambKofte.name"),
        description: t("food.lambKofte.description"),
        price: 14.99,
        image: "/placeholder.svg?height=300&width=300",
        category: t("categories.kebabs"),
        discount: 15,
        rating: 4.8,
      },
      {
        id: 204,
        name: t("food.vegetableKebab.name"),
        description: t("food.vegetableKebab.description"),
        price: 12.99,
        image: "/placeholder.svg?height=300&width=300",
        category: t("common.vegetarian"),
        rating: 4.3,
      },
    ],
    wraps: [
      {
        id: 301,
        name: t("food.chickenShawarmaWrap.name"),
        description: t("food.chickenShawarmaWrap.description"),
        price: 9.99,
        image: "/placeholder.svg?height=300&width=300",
        category: t("categories.wraps"),
        rating: 4.6,
      },
      {
        id: 302,
        name: t("food.lambDonerWrap.name"),
        description: t("food.lambDonerWrap.description"),
        price: 10.99,
        image: "/placeholder.svg?height=300&width=300",
        category: t("categories.wraps"),
        rating: 4.4,
      },
    ],
    sides: [
      {
        id: 401,
        name: t("food.garlicCheeseBread.name"),
        description: t("food.garlicCheeseBread.description"),
        price: 5.99,
        image: "/placeholder.svg?height=300&width=300",
        category: t("categories.sides"),
        rating: 4.5,
      },
      {
        id: 402,
        name: t("food.spicyPotatoWedges.name"),
        description: t("food.spicyPotatoWedges.description"),
        price: 4.99,
        image: "/placeholder.svg?height=300&width=300",
        category: t("categories.sides"),
        rating: 4.2,
      },
    ],
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
          <h1 className="text-4xl font-bold mb-8">{t("menuPage.title")}</h1>

          <Tabs defaultValue="pizzas" className="w-full">
            <TabsList className="mb-8 flex flex-wrap h-auto">
              <TabsTrigger value="pizzas" className="text-lg py-2 px-4">
                {t("categories.pizzas")}
              </TabsTrigger>
              <TabsTrigger value="kebabs" className="text-lg py-2 px-4">
                {t("categories.kebabs")}
              </TabsTrigger>
              <TabsTrigger value="wraps" className="text-lg py-2 px-4">
                {t("categories.wraps")}
              </TabsTrigger>
              <TabsTrigger value="sides" className="text-lg py-2 px-4">
                {t("categories.sides")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pizzas">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menuItems.pizzas.map((item) => (
                  <InteractiveMenuCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="kebabs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menuItems.kebabs.map((item) => (
                  <InteractiveMenuCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wraps">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menuItems.wraps.map((item) => (
                  <InteractiveMenuCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sides">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menuItems.sides.map((item) => (
                  <InteractiveMenuCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function MenuPageClient() {
  return (
    <LanguageProvider>
      <CartProvider>
        <MenuContent />
      </CartProvider>
    </LanguageProvider>
  )
}
