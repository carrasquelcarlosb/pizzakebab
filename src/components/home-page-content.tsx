"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { HeroSection } from "@/components/hero-section"
import { FeaturedItems } from "@/components/featured-items"
import { CategorySection } from "@/components/category-section"
import { PromoBanner } from "@/components/promo-banner"
import { Footer } from "@/components/footer"
import { AnimatedBackground } from "@/components/animated-background"
import { FloatingActionButton } from "@/components/floating-action-button"
import { EnhancedTestimonials } from "@/components/enhanced-testimonials"
import { CartButton } from "@/components/cart-button"
import { useLanguage } from "@/contexts/language-context"

export function HomePageContent() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
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
        <HeroSection />
        <PromoBanner />
        <FeaturedItems />
        <CategorySection />
        <EnhancedTestimonials />
      </main>
      <AnimatedBackground />
      <FloatingActionButton />
      <Footer />
    </div>
  )
}
