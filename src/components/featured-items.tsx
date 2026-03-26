"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"

import { InteractiveMenuCard } from "@/components/interactive-menu-card"
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
    const el = scrollRef.current
    if (el) {
      el.addEventListener("scroll", checkScrollButtons)
      checkScrollButtons()
      return () => el.removeEventListener("scroll", checkScrollButtons)
    }
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -scrollRef.current.clientWidth / 2 : scrollRef.current.clientWidth / 2
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" })
    }
  }

  return (
    <section className="py-20 bg-pit relative overflow-hidden">
      {/* Subtle top-border glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-ember-600/30 to-transparent" />

      <div className="container relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-ember-500" />
              <span className="text-ember-400 text-xs font-medium tracking-widest uppercase">
                Hand-Picked
              </span>
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-cream leading-tight">
              {t("featured.title")}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-cream-dim hover:text-cream hover:border-white/20 disabled:opacity-30 transition-all"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-cream-dim hover:text-cream hover:border-white/20 disabled:opacity-30 transition-all"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <Link
              href="/menu"
              className="ml-2 text-ember-400 hover:text-ember-300 text-sm font-medium transition-colors"
            >
              {t("featured.viewAll")} →
            </Link>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {featuredItems.map((item) => (
            <div key={item.id} className="min-w-[280px] sm:min-w-[300px] snap-start">
              <InteractiveMenuCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
