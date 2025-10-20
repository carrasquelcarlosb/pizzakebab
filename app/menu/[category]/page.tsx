import { notFound } from "next/navigation"
import { InteractiveMenuCard } from "@/components/interactive-menu-card"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { LanguageProvider } from "@/contexts/language-context"
import { menuCatalog, validMenuCategories } from "@/data/menu-catalog"

// Next.js 15: params is now a Promise
type Props = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CategoryPage(props: Props) {
  // Next.js 15: Await the params
  const params = await props.params
  const searchParams = await props.searchParams

  const { category } = params
  const { sort, filter } = searchParams

  if (!validMenuCategories.includes(category)) {
    notFound()
  }

  const items = menuCatalog[category] || []

  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background">
          <div className="container flex h-16 items-center justify-between">
            <div className="hidden md:flex">
              <MainNav />
            </div>
            <div className="md:hidden">
              <MobileNav />
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="container py-8">
            <h1 className="text-4xl font-bold mb-8 capitalize">{category}</h1>

            {/* Filter and sort options */}
            <div className="flex gap-4 mb-8">
              <select className="px-4 py-2 border rounded-lg">
                <option value="">Sort by</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="popular">Popularity</option>
              </select>

              <select className="px-4 py-2 border rounded-lg">
                <option value="">All Items</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="spicy">Spicy</option>
                <option value="new">New Items</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <InteractiveMenuCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  )
}

// Next.js 15: generateStaticParams for static generation
export async function generateStaticParams() {
  return validMenuCategories.map((category) => ({
    category,
  }))
}

// Next.js 15: generateMetadata with async params
export async function generateMetadata(props: Props) {
  const params = await props.params
  const { category } = params

  return {
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} - PizzaKebab`,
    description: `Explore our delicious ${category} menu at PizzaKebab.`,
  }
}
