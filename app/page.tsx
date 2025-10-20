import { AppProviders } from "@/components/app-providers"
import { HomePageContent } from "@/components/home-page-content"

export default function Home() {
  return (
    <AppProviders>
      <HomePageContent />
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
