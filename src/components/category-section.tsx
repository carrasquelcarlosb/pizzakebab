"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { useLanguage } from "@/contexts/language-context"
import {
  getMenuCategoryCount,
  getMenuCategoryLabelKey,
  type MenuCategory,
} from "@/lib/menu-data"

export function CategorySection() {
  const { t } = useLanguage()

  const categories = [
    { id: 1, name: t("categories.pizzas"),   image: "/placeholder.svg?height=400&width=400", count: 12, href: "/menu/pizzas",   span: "lg:col-span-2 lg:row-span-2" },
    { id: 2, name: t("categories.kebabs"),   image: "/placeholder.svg?height=400&width=400", count: 8,  href: "/menu/kebabs",   span: "lg:col-span-2 lg:row-span-2" },
    { id: 3, name: t("categories.wraps"),    image: "/placeholder.svg?height=200&width=400", count: 6,  href: "/menu/wraps",    span: "" },
    { id: 4, name: t("categories.sides"),    image: "/placeholder.svg?height=200&width=400", count: 10, href: "/menu/sides",    span: "" },
    { id: 5, name: t("categories.drinks"),   image: "/placeholder.svg?height=200&width=400", count: 15, href: "/menu/drinks",   span: "" },
    { id: 6, name: t("categories.desserts"), image: "/placeholder.svg?height=200&width=400", count: 7,  href: "/menu/desserts", span: "" },
  ]

  const [featured, ...rest] = categories

  return (
    <section className="py-20 bg-coal relative overflow-hidden">
      {/* Section glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="container relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-ember-400 text-xs font-medium tracking-widest uppercase mb-3">
              Browse by type
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cream">
              {t("categories.title")}
            </h2>
          </div>
          <Link href="/menu">
            <button className="hidden md:flex items-center gap-2 text-sm text-cream-dim hover:text-cream border border-white/10 hover:border-white/20 px-5 py-2.5 rounded-full transition-all">
              {t("categories.viewFullMenu")}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 grid-rows-auto lg:grid-rows-2 gap-4 lg:h-[520px]">

          {/* Large featured card — Pizzas */}
          <Link
            href={featured.href}
            className={`group relative overflow-hidden rounded-2xl bg-ash border border-white/6 col-span-2 lg:col-span-2 lg:row-span-2 ember-glow-hover transition-all duration-500`}
          >
            <Image
              src={featured.image}
              alt={featured.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/30 to-transparent" />
            <div className="absolute inset-0 bg-ember-600/0 group-hover:bg-ember-600/8 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-muted-foreground text-xs tracking-widest uppercase mb-1">
                {featured.count} items
              </p>
              <h3 className="font-display font-bold text-2xl text-cream leading-tight group-hover:text-ember-300 transition-colors">
                {featured.name}
              </h3>
              <div className="mt-3 flex items-center gap-1.5 text-ember-400 text-xs font-medium opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                View all <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </Link>

          {/* Large featured card — Kebabs */}
          <Link
            href={categories[1].href}
            className={`group relative overflow-hidden rounded-2xl bg-ash border border-white/6 col-span-2 lg:col-span-2 lg:row-span-2 ember-glow-hover transition-all duration-500`}
          >
            <Image
              src={categories[1].image}
              alt={categories[1].name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/30 to-transparent" />
            <div className="absolute inset-0 bg-ember-600/0 group-hover:bg-ember-600/8 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-muted-foreground text-xs tracking-widest uppercase mb-1">
                {categories[1].count} items
              </p>
              <h3 className="font-display font-bold text-2xl text-cream group-hover:text-ember-300 transition-colors">
                {categories[1].name}
              </h3>
              <div className="mt-3 flex items-center gap-1.5 text-ember-400 text-xs font-medium opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                View all <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </Link>

          {/* Small cards — right column */}
          {rest.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative overflow-hidden rounded-xl bg-ash border border-white/6 ember-glow-hover transition-all duration-500"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-void/20 to-transparent" />
              <div className="absolute inset-0 bg-ember-600/0 group-hover:bg-ember-600/6 transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-muted-foreground text-[10px] tracking-widest uppercase mb-0.5">
                  {cat.count} items
                </p>
                <h3 className="font-display font-semibold text-base text-cream group-hover:text-ember-300 transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/menu">
            <button className="flex items-center gap-2 text-sm text-cream-dim border border-white/10 px-6 py-3 rounded-full mx-auto transition-colors hover:text-cream hover:border-white/20">
              {t("categories.viewFullMenu")}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
