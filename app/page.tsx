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
import { AnimatedBackground } from "@/components/animated-background"
import { FloatingActionButton } from "@/components/floating-action-button"
import { EnhancedTestimonials } from "@/components/enhanced-testimonials"

export default function Home() {
  return (
    <LanguageProvider>
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
              <Link href="/cart">
                <Button variant="outline" size="icon" className="relative rounded-full">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                    3
                  </span>
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="hidden md:inline-flex rounded-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/order">
                <Button className="bg-red-600 hover:bg-red-700 rounded-full">Order Now</Button>
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
    </LanguageProvider>
  )
}

// Next.js 15 metadata API
export const metadata = {
  title: "PizzaKebab - Spice Up Your Experience",
  description: "Authentic flavors, fresh ingredients, and a taste that will keep you coming back for more.",
  keywords: ["pizza", "kebab", "restaurant", "food delivery", "authentic cuisine"],
  openGraph: {
    title: "PizzaKebab - Spice Up Your Experience",
    description: "Authentic flavors, fresh ingredients, and a taste that will keep you coming back for more.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["fr_FR", "de_DE"],
  },
}
