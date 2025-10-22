"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InteractiveMenuCard } from "@/components/interactive-menu-card"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/contexts/language-context"
import { AppProviders } from "@/components/app-providers"
import { CartButton } from "@/components/cart-button"
import { Button } from "@/components/ui/button"
import { fetchMenus, type MenuApi } from "@/lib/api/menu"
import { buildCategoryMap, CATEGORY_ORDER, isKnownCategory } from "@/lib/menu-transform"

function MenuContent() {
  const { t } = useLanguage()
  const [menus, setMenus] = useState<MenuApi[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadMenus = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetchMenus()
      setMenus(response.menus.filter((menu) => menu.isActive))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load menu")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadMenus()
  }, [loadMenus])

  const sections = useMemo(() => buildCategoryMap(menus, t), [menus, t])

  const categories = useMemo(() => {
    const known = new Set<string>(CATEGORY_ORDER)
    const extras = menus
      .map((menu) => menu.id)
      .filter((category) => !known.has(category))
    return [...CATEGORY_ORDER, ...extras.filter((value, index, list) => list.indexOf(value) === index)]
  }, [menus])

  const defaultTab = categories[0] ?? CATEGORY_ORDER[0]

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
            <Link href="/login">
              <Button variant="outline" className="hidden md:inline-flex rounded-full">
                {t("nav.signIn")}
              </Button>
            </Link>
            <Link href="/order">
              <Button className="bg-red-600 hover:bg-red-700 rounded-full">{t("nav.orderNow")}</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-4xl font-bold mb-8">{t("menuPage.title")}</h1>

          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading menu…</div>
          ) : error ? (
            <div className="py-16 text-center space-y-4">
              <p className="text-red-600 font-semibold">{t("checkout.failure")}</p>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => void loadMenus()} variant="outline" className="rounded-full">
                Retry
              </Button>
            </div>
          ) : (
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="mb-8 flex flex-wrap h-auto">
                {categories.map((category) => {
                  const label = isKnownCategory(category)
                    ? t(`categories.${category}` as const)
                    : category
                  return (
                    <TabsTrigger key={category} value={category} className="text-lg py-2 px-4 capitalize">
                      {label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(sections[category] ?? []).map((item) => (
                      <InteractiveMenuCard key={`${category}-${item.id}`} item={item} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
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

