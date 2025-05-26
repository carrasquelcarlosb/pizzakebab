"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Star, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"

export function HeroSection() {
  const { t } = useLanguage()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Animated background layers */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50 z-10" />
      <div
        className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-amber-900/20 z-10 transition-all duration-1000"
        style={{
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
        }}
      />

      {/* Background image with parallax */}
      <div className="absolute inset-0">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Delicious pizza and kebab"
          fill
          className="object-cover scale-110 animate-slow-zoom"
          priority
        />
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-red-500/20 rounded-full blur-xl animate-float" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-amber-500/20 rounded-full blur-xl animate-float-delayed" />
      <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-red-400/30 rounded-full blur-lg animate-pulse" />

      <div className="absolute inset-0 z-20 flex items-center">
        <div className="container">
          <div className="max-w-2xl space-y-8">
            <Badge className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 mb-4 animate-bounce-subtle">
              <Star className="h-4 w-4 mr-2 animate-spin-slow" /> {t("hero.badge")}
            </Badge>

            <h1 className="text-6xl font-bold tracking-tight text-white sm:text-7xl md:text-8xl drop-shadow-2xl">
              <span className="inline-block animate-slide-up">{t("hero.title")}</span>{" "}
              <span className="text-red-500 inline-block animate-slide-up-delayed bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                {t("hero.pizza")}
              </span>{" "}
              <span className="inline-block animate-slide-up-delayed-2">&</span>{" "}
              <span className="text-amber-400 inline-block animate-slide-up-delayed-3 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                {t("hero.kebab")}
              </span>{" "}
              <span className="inline-block animate-slide-up-delayed-4">{t("hero.experience")}</span>
            </h1>

            <p className="text-xl text-white/90 drop-shadow-lg animate-fade-in-up max-w-lg leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0 pt-6">
              <Link href="/menu">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-lg group relative overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  <span className="relative z-10 flex items-center">
                    {t("hero.viewMenu")}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-black text-lg group backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                {t("hero.specialDeals")}
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 animate-fade-in-up-delayed">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-white/70 text-sm">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">4.9</div>
                <div className="text-white/70 text-sm">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">15min</div>
                <div className="text-white/70 text-sm">Avg Delivery</div>
              </div>
            </div>
          </div>

          {/* Enhanced Chef's Special Card */}
          <div className="absolute bottom-8 right-8 md:right-16 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hidden lg:block transform hover:scale-105 transition-all duration-500 shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-amber-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="h-20 w-20 relative rounded-full overflow-hidden border-3 border-amber-400 shadow-lg">
                <Image src="/placeholder.svg?height=100&width=100" alt="Chef" fill className="object-cover" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">{t("hero.chefSpecial")}</p>
                <p className="text-amber-300 text-sm leading-relaxed">{t("hero.chefSpecialText")}</p>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400 mr-0.5" />
                  ))}
                  <span className="text-white/80 text-xs ml-2">Chef's Choice</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  )
}
