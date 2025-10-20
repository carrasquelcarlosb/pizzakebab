import Link from "next/link"

import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { HeroSection } from "@/components/hero-section"
import { FeaturedItems } from "@/components/featured-items"
import { CategorySection } from "@/components/category-section"
import { PromoBanner } from "@/components/promo-banner"
import { Footer } from "@/components/footer"
import { AppProviders } from "@/contexts/app-providers"
import { AnimatedBackground } from "@/components/animated-background"
import { FloatingActionButton } from "@/components/floating-action-button"
import { EnhancedTestimonials } from "@/components/enhanced-testimonials"
import { CartStatusButton } from "@/components/cart-status-button"

export default function Home() {
  return (
    <AppProviders>
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
              <CartStatusButton />
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
    </AppProviders>
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
