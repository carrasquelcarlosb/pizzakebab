"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Utensils } from "lucide-react"

import { InteractiveMenuCard } from "@/components/interactive-menu-card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { getFeaturedMenuItems } from "@/lib/menu-data"

export function FeaturedItems() {
  const { t } = useLanguage()

  const featuredItems = useMemo(() => getFeaturedMenuItems(t), [t])

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
