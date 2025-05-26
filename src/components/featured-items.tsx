"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Utensils } from "lucide-react"

import { InteractiveMenuCard } from "@/components/interactive-menu-card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export function FeaturedItems() {
  const { t } = useLanguage()

  const featuredItems = [
    {
      id: 1,
      name: t("food.spicyKebabPizza.name"),
      description: t("food.spicyKebabPizza.description"),
      price: 14.99,
      image: "/placeholder.svg?height=300&width=300",
      category: t("common.specialtyPizzas"),
      rating: 4.8,
      popular: true,
    },
    {
      id: 2,
      name: t("food.mixedGrillKebab.name"),
      description: t("food.mixedGrillKebab.description"),
      price: 16.99,
      image: "/placeholder.svg?height=300&width=300",
      category: t("categories.kebabs"),
      rating: 4.7,
    },
    {
      id: 3,
      name: t("food.garlicCheeseBread.name"),
      description: t("food.garlicCheeseBread.description"),
      price: 5.99,
      image: "/placeholder.svg?height=300&width=300",
      category: t("categories.sides"),
      rating: 4.5,
    },
    {
      id: 4,
      name: t("food.chickenShawarmaWrap.name"),
      description: t("food.chickenShawarmaWrap.description"),
      price: 9.99,
      image: "/placeholder.svg?height=300&width=300",
      category: t("categories.wraps"),
      rating: 4.6,
    },
    {
      id: 5,
      name: t("food.meatFeastPizza.name"),
      description: t("food.meatFeastPizza.description"),
      price: 15.99,
      image: "/placeholder.svg?height=300&width=300",
      category: t("common.specialtyPizzas"),
      rating: 4.9,
      popular: true,
      discount: 10,
    },
    {
      id: 6,
      name: t("food.falafelWrap.name"),
      description: t("food.falafelWrap.description"),
      price: 8.99,
      image: "/placeholder.svg?height=300&width=300",
      category: t("common.vegetarian"),
      rating: 4.4,
      new: true,
    },
  ]

  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScrollButtons)
      // Initial check
      checkScrollButtons()

      return () => scrollElement.removeEventListener("scroll", checkScrollButtons)
    }
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current
      const scrollAmount = direction === "left" ? -clientWidth / 2 : clientWidth / 2
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-200 to-transparent"></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-radial from-amber-200/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-radial from-red-200/20 to-transparent rounded-full blur-3xl"></div>

      <div className="container relative">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Utensils className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold">{t("featured.title")}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-red-200 text-red-600 hover:text-red-700 hover:border-red-300 transition-all disabled:opacity-50"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-red-200 text-red-600 hover:text-red-700 hover:border-red-300 transition-all disabled:opacity-50"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Link href="/menu" className="text-red-600 hover:text-red-700 font-medium hover:underline ml-2">
              {t("featured.viewAll")}
            </Link>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {featuredItems.map((item) => (
            <div key={item.id} className="min-w-[280px] sm:min-w-[320px] snap-start">
              <InteractiveMenuCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
