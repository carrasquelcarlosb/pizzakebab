import { notFound } from "next/navigation"
import { InteractiveMenuCard } from "@/components/interactive-menu-card"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { LanguageProvider } from "@/contexts/language-context"

// Next.js 15: params is now a Promise
type Props = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const validCategories = ["pizzas", "kebabs", "wraps", "sides", "drinks", "desserts"]

const categoryItems = {
  pizzas: [
    {
      id: 101,
      name: "Spicy Kebab Pizza",
      description: "Our signature pizza topped with juicy kebab meat, jalapeños, and special spicy sauce",
      price: 14.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Specialty Pizzas",
      rating: 4.8,
      popular: true,
    },
    // Add more items...
  ],
  kebabs: [
    {
      id: 201,
      name: "Mixed Grill Kebab",
      description: "A delicious mix of chicken, beef, and lamb kebab with grilled vegetables",
      price: 16.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Kebabs",
      rating: 4.7,
    },
    // Add more items...
  ],
  // Add other categories...
}

export default async function CategoryPage(props: Props) {
  // Next.js 15: Await the params
  const params = await props.params
  const searchParams = await props.searchParams

  const { category } = params
  const { sort, filter } = searchParams

  if (!validCategories.includes(category)) {
    notFound()
  }

  const items = categoryItems[category as keyof typeof categoryItems] || []

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
  return validCategories.map((category) => ({
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
