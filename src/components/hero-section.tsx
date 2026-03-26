"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Star, Flame, Clock } from "lucide-react"

import { useLanguage } from "@/contexts/language-context"

export function HeroSection() {
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center bg-void grain-overlay">
      {/* Ember glow radials */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-ember-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-saffron-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-ember-900/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="container relative z-10 py-24">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* ── Left column ── */}
          <div className="space-y-8">

            {/* Eyebrow */}
            <div
              className={`flex flex-wrap items-center gap-3 ${mounted ? "animate-ember-fade" : "opacity-0"}`}
            >
              <div className="flex items-center gap-2 bg-ember-600/10 border border-ember-600/20 rounded-full px-3.5 py-1.5">
                <Flame className="h-3.5 w-3.5 text-ember-500" />
                <span className="text-ember-400 text-xs font-medium tracking-widest uppercase">
                  Artisan Street Food
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-saffron-500 fill-saffron-500" />
                ))}
                <span className="text-cream-dim text-xs ml-0.5">4.9 · 500+ reviews</span>
              </div>
            </div>

            {/* Headline */}
            <div
              className={`${mounted ? "animate-ember-rise" : "opacity-0"}`}
            >
              <p className="font-display italic text-cream-dim text-xl md:text-2xl mb-1 leading-none">
                The Art of
              </p>
              <h1 className="font-display font-black leading-[0.9] tracking-tight">
                <span className="block text-6xl sm:text-7xl xl:text-8xl text-cream">
                  Fire &amp;
                </span>
                <span
                  className="block text-6xl sm:text-7xl xl:text-8xl"
                  style={{
                    background: "linear-gradient(135deg, #e8601a 0%, #f07535 40%, #c9911c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Spice.
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p
              className={`text-cream-dim text-base md:text-lg leading-relaxed max-w-md ${mounted ? "animate-ember-rise-delay-1" : "opacity-0"}`}
            >
              Slow-marinated meats, hand-stretched doughs, and centuries-old
              spice blends — crafted fresh and at your door in 15 minutes.
            </p>

            {/* CTAs */}
            <div
              className={`flex flex-wrap items-center gap-4 ${mounted ? "animate-ember-rise-delay-2" : "opacity-0"}`}
            >
              <Link href="/menu">
                <button className="group flex items-center gap-2.5 bg-ember-600 hover:bg-ember-500 text-cream font-medium text-sm px-7 py-3.5 rounded-full transition-all duration-300 hover:shadow-[0_0_32px_rgba(232,96,26,0.45)]">
                  Explore Menu
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link href="/order">
                <button className="flex items-center gap-2 border border-cream/15 hover:border-cream/30 text-cream-dim hover:text-cream font-medium text-sm px-7 py-3.5 rounded-full transition-all duration-300 hover:bg-white/4">
                  <Clock className="h-4 w-4" />
                  Order Now · 15min
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div
              className={`flex items-center gap-8 pt-6 border-t border-white/8 ${mounted ? "animate-ember-rise-delay-3" : "opacity-0"}`}
            >
              {[
                { value: "500+", label: "Customers" },
                { value: "4.9★", label: "Rating" },
                { value: "15min", label: "Delivery" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-8">
                  {i > 0 && <div className="w-px h-8 bg-white/10" />}
                  <div>
                    <div className="font-display font-bold text-2xl text-cream leading-none">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground text-xs tracking-widest uppercase mt-1">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column: visual ── */}
          <div className="relative hidden lg:flex justify-center items-center">
            {/* Outer glow ring */}
            <div className="absolute w-[520px] h-[520px] rounded-full bg-ember-600/6 blur-3xl animate-ember-pulse" />

            {/* Main image circle */}
            <div className="relative w-[460px] h-[460px] animate-float-slow">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg at 50% 50%, rgba(232,96,26,0.3) 0deg, rgba(201,145,28,0.1) 120deg, rgba(232,96,26,0.05) 240deg, rgba(232,96,26,0.3) 360deg)",
                  padding: "2px",
                  borderRadius: "50%",
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-ash">
                  <Image
                    src="/placeholder.svg?height=460&width=460"
                    alt="Signature dish"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-void/10 to-transparent" />
                </div>
              </div>

              {/* Floating card: Chef's Special */}
              <div className="absolute -left-12 top-1/3 bg-ash border border-white/8 rounded-2xl p-4 shadow-2xl animate-float backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ember-600/15 border border-ember-600/20 rounded-xl flex items-center justify-center shrink-0">
                    <Flame className="h-5 w-5 text-ember-500" />
                  </div>
                  <div>
                    <div className="text-cream text-sm font-medium leading-none mb-1">Chef&apos;s Pick</div>
                    <div className="text-muted-foreground text-xs">Mixed Grill Kebab</div>
                  </div>
                </div>
              </div>

              {/* Floating card: Deal */}
              <div
                className="absolute -right-8 bottom-1/4 bg-ash border border-saffron-600/20 rounded-2xl p-4 shadow-2xl"
                style={{ animation: "gentle-float 7s 1s ease-in-out infinite" }}
              >
                <div className="text-saffron-500 text-[10px] tracking-widest uppercase font-medium mb-1.5">
                  Today&apos;s Deal
                </div>
                <div className="font-display font-black text-2xl text-cream leading-none">
                  20% Off
                </div>
                <div className="text-muted-foreground text-xs mt-1">Code: WELCOME20</div>
              </div>

              {/* Floating rating dot */}
              <div className="absolute top-8 right-4 bg-saffron-600 text-void text-xs font-bold w-12 h-12 rounded-full flex flex-col items-center justify-center shadow-lg">
                <span className="text-base leading-none font-display font-black">4.9</span>
                <span className="text-[8px] leading-none mt-0.5">★★★★★</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-5 h-8 border border-cream/15 rounded-full flex justify-center pt-2">
          <div className="w-0.5 h-2 bg-cream/35 rounded-full animate-scroll-dot" />
        </div>
      </div>
    </section>
  )
}
