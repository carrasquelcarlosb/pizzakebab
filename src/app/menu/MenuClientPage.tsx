"use client"

import { useMemo } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InteractiveMenuCard } from "@/components/interactive-menu-card"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/contexts/language-context"
import { AppProviders } from "@/contexts/app-providers"
import { getLocalizedMenuSections } from "@/lib/menu-data"

function MenuContent() {
  const { t } = useLanguage()

  const menuItems = useMemo(() => getLocalizedMenuSections(t), [t])

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
              <TabsTrigger value="drinks" className="text-lg py-2 px-4">
                {t("categories.drinks")}
              </TabsTrigger>
              <TabsTrigger value="desserts" className="text-lg py-2 px-4">
                {t("categories.desserts")}
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

            <TabsContent value="drinks">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menuItems.drinks.map((item) => (
                  <InteractiveMenuCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="desserts">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menuItems.desserts.map((item) => (
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
    <AppProviders>
      <MenuContent />
    </AppProviders>
  )
}
