"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { InteractiveMenuCard } from "@/components/interactive-menu-card"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { fetchMenus, type MenuApi } from "@/lib/api/menu"
import { buildCategoryMap, isKnownCategory } from "@/lib/menu-transform"

interface CategoryMenuClientProps {
  category: string
}

export function CategoryMenuClient({ category }: CategoryMenuClientProps) {
  const { t } = useLanguage()
  const [menus, setMenus] = useState<MenuApi[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadMenu = useCallback(async () => {
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
    void loadMenu()
  }, [loadMenu])

  const sections = useMemo(() => buildCategoryMap(menus, t), [menus, t])
  const items = sections[category] ?? []
  const categoryLabel = isKnownCategory(category) ? t(`categories.${category}` as const) : category

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
          <h1 className="text-4xl font-bold mb-8 capitalize">{categoryLabel}</h1>

          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading items…</div>
          ) : error ? (
            <div className="py-16 text-center space-y-4">
              <p className="text-red-600 font-semibold">{t("checkout.failure")}</p>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => void loadMenu()} variant="outline" className="rounded-full">
                Retry
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-2 text-muted-foreground">
              <p>No items available in this category.</p>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-8">
                <select className="px-4 py-2 border rounded-lg">
                  <option value="">Sort by</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="popular">Popularity</option>
                </select>

                <select className="px-4 py-2 border rounded-lg">
                  <option value="">All Items</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="spicy">Spicy</option>
                  <option value="new">New Items</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <InteractiveMenuCard key={`${category}-${item.id}`} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

