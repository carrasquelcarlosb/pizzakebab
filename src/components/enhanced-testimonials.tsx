"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star, ChevronLeft, ChevronRight, MapPin, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

export function EnhancedTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const { t } = useLanguage()

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: t("testimonials.reviews.sarah"),
      date: "2 weeks ago",
      location: "London",
      verified: true,
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: t("testimonials.reviews.michael"),
      date: "1 month ago",
      location: "Barcelona",
      verified: true,
    },
    {
      id: 3,
      name: "Emma Williams",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 4,
      text: t("testimonials.reviews.emma"),
      date: "3 weeks ago",
      location: "Berlin",
      verified: true,
    },
    {
      id: 4,
      name: "David Rodriguez",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: t("testimonials.reviews.david"),
      date: "2 days ago",
      location: "Paris",
      verified: true,
    },
  ]

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const go = (dir: "prev" | "next") => {
    setActiveIndex((i) =>
      dir === "next"
        ? (i + 1) % testimonials.length
        : (i - 1 + testimonials.length) % testimonials.length
    )
    setIsAutoPlaying(false)
  }

  const active = testimonials[activeIndex]

  return (
    <section className="py-24 bg-void relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-ember-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="container relative">
        {/* Header */}
        <div className="max-w-xl mx-auto text-center mb-16">
          {/* Large decorative quote */}
          <div
            className="text-8xl font-display font-black leading-none mb-4 select-none"
            style={{ color: "rgba(232,96,26,0.15)" }}
            aria-hidden
          >
            "
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-cream mt-[-2rem]">
            {t("testimonials.title")}
          </h2>
          <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
            {t("testimonials.subtitle")}
          </p>
        </div>

        {/* Main testimonial */}
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-ash border border-white/6 rounded-3xl p-8 md:p-12 transition-all duration-500 ember-glow">
            {/* Stars */}
            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < active.rating
                      ? "text-saffron-400 fill-saffron-400"
                      : "text-white/10"
                  )}
                />
              ))}
              <span className="text-muted-foreground text-xs ml-2">{active.date}</span>
            </div>

            {/* Quote text */}
            <blockquote className="font-display text-lg md:text-xl text-cream leading-relaxed mb-8 italic">
              &ldquo;{active.text}&rdquo;
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-ember-600/40">
                    <Image
                      src={active.avatar}
                      alt={active.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  {active.verified && (
                    <div className="absolute -bottom-1 -right-1 text-ember-500 bg-ash rounded-full">
                      <CheckCircle className="h-4 w-4 fill-ember-600/20" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-cream font-medium text-sm">{active.name}</div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {active.location}
                  </div>
                </div>
              </div>

              {/* Nav arrows */}
              <div className="flex items-center gap-2">
                <button
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-cream-dim hover:text-cream hover:border-white/20 transition-all"
                  onClick={() => go("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-cream-dim hover:text-cream hover:border-white/20 transition-all"
                  onClick={() => go("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  activeIndex === i
                    ? "w-8 bg-ember-500"
                    : "w-1.5 bg-white/15 hover:bg-white/25"
                )}
                onClick={() => { setActiveIndex(i); setIsAutoPlaying(false) }}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>

          {/* Thumbnail previews */}
          <div className="flex justify-center gap-3 mt-6">
            {testimonials.map((item, i) => (
              <button
                key={item.id}
                className={cn(
                  "relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-300",
                  activeIndex === i
                    ? "border-ember-500 scale-110"
                    : "border-white/10 opacity-50 hover:opacity-75"
                )}
                onClick={() => { setActiveIndex(i); setIsAutoPlaying(false) }}
              >
                <Image src={item.avatar} alt={item.name} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex flex-wrap justify-center gap-12 mt-16 pt-12 border-t border-white/5">
          {[
            { value: "500+", label: "Happy Customers" },
            { value: "4.9", label: "Average Rating" },
            { value: "98%", label: "Would Recommend" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-black text-4xl text-cream">{stat.value}</div>
              <div className="text-muted-foreground text-xs tracking-widest uppercase mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
