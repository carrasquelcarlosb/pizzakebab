"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Flame } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import {
  getMenuCategoryCount,
  getMenuCategoryLabelKey,
  type MenuCategory,
} from "@/lib/menu-data"

export function CategorySection() {
  const { t } = useLanguage()

  const coreCategories: Array<{ key: MenuCategory; featured?: boolean }> = [
    { key: "pizzas", featured: true },
    { key: "kebabs", featured: true },
    { key: "wraps" },
    { key: "sides" },
  ]

  const categories = [
    ...coreCategories.map(({ key, featured }) => ({
      id: key,
      name: t(getMenuCategoryLabelKey(key)),
      image: "/placeholder.svg?height=400&width=400",
      count: getMenuCategoryCount(key),
      href: `/menu/${key}`,
      featured,
    })),
    {
      id: "drinks",
      name: t("categories.drinks"),
      image: "/placeholder.svg?height=400&width=400",
      count: 6,
      href: "/menu/drinks",
    },
    {
      id: "desserts",
      name: t("categories.desserts"),
      image: "/placeholder.svg?height=400&width=400",
      count: 4,
      href: "/menu/desserts",
    },
  ]

  return (
    <section className="py-16 bg-white relative">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-gradient-radial from-red-200/20 to-transparent rounded-full blur-3xl"></div>

      <div className="container">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Flame className="h-6 w-6 text-amber-500" />
          </div>
          <h2 className="text-3xl font-bold">{t("categories.title")}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={category.href} className="group">
              <div className="relative overflow-hidden rounded-xl aspect-square mb-2 shadow-md shadow-slate-200/50 border border-slate-100">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <h3 className="font-bold text-lg group-hover:text-amber-300 transition-colors">{category.name}</h3>
                    <p className="text-sm text-white/80">
                      {category.count} {t("categories.items")}
                    </p>
                  </div>
                </div>

                {category.featured && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {t("categories.popular")}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/menu">
            <Button className="bg-red-600 hover:bg-red-700 group relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                {t("categories.viewFullMenu")}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-red-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
