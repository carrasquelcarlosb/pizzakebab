import { notFound } from "next/navigation"

import { AppProviders } from "@/components/app-providers"
import { CATEGORY_ORDER, isKnownCategory } from "@/lib/menu-transform"

import { CategoryMenuClient } from "./CategoryMenuClient"

const STATIC_CATEGORIES = CATEGORY_ORDER as readonly string[]

interface CategoryPageProps {
  params: { category: string }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = params.category.toLowerCase()

  if (!STATIC_CATEGORIES.includes(category)) {
    notFound()
  }

  return (
    <AppProviders>
      <CategoryMenuClient category={category} />
    </AppProviders>
  )
}

export function generateStaticParams() {
  return STATIC_CATEGORIES.map((category) => ({ category }))
}

export function generateMetadata({ params }: CategoryPageProps) {
  const category = params.category
  const label = isKnownCategory(category) ? category : category
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1)

  return {
    title: `${capitalized} - PizzaKebab`,
    description: `Explore our delicious ${label} menu at PizzaKebab.`,
  }
}

