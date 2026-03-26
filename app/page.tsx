import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { HeroSection } from "@/components/hero-section"
import { FeaturedItems } from "@/components/featured-items"
import { CategorySection } from "@/components/category-section"
import { PromoBanner } from "@/components/promo-banner"
import { Footer } from "@/components/footer"
import { LanguageProvider } from "@/contexts/language-context"
import { FloatingActionButton } from "@/components/floating-action-button"
import { EnhancedTestimonials } from "@/components/enhanced-testimonials"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-pit">
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-pit/85 backdrop-blur-md">
          <div className="container flex h-16 items-center justify-between">
            <div className="hidden md:flex">
              <MainNav />
            </div>
            <div className="md:hidden">
              <MobileNav />
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/cart">
                <button className="relative w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-cream-dim hover:text-cream hover:border-white/20 transition-all">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ember-600 text-[10px] text-cream font-medium">
                    3
                  </span>
                </button>
              </Link>
              <Link href="/login" className="hidden md:block">
                <button className="text-cream-dim hover:text-cream text-sm font-medium px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-all">
                  Sign In
                </button>
              </Link>
              <Link href="/order">
                <button className="bg-ember-600 hover:bg-ember-500 text-cream text-sm font-medium px-5 py-2 rounded-full transition-all hover:shadow-[0_0_20px_rgba(232,96,26,0.4)]">
                  Order Now
                </button>
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

        <FloatingActionButton />
        <Footer />
      </div>
    </LanguageProvider>
  )
}

export const metadata = {
  title: "PizzaKebab - Spice Up Your Experience",
  description: "Authentic flavors, fresh ingredients, and a taste that will keep you coming back for more.",
}
