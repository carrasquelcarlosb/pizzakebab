"use client"

import { HeroSection } from "@/components/hero-section"
import { FeaturedItems } from "@/components/featured-items"
import { CategorySection } from "@/components/category-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { PromoBanner } from "@/components/promo-banner"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { FloatingActionButton } from "@/components/floating-action-button"
import { LanguageProvider } from "@/contexts/language-context"

function HomeContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="sticky top-0 z-50 w-full border-b border-slate-200/50 backdrop-blur-md bg-white/80">
        <div className="container mx-auto px-4">
          <div className="hidden md:block">
            <MainNav />
          </div>
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>

      <main className="relative overflow-hidden">
        <HeroSection />

        <div className="py-16 space-y-24">
          <PromoBanner />
          <FeaturedItems />
          <CategorySection />
          <TestimonialsSection />
        </div>
      </main>

      <Footer />
      <FloatingActionButton />
    </div>
  )
}

export default function HomePageClient() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  )
}