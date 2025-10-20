import { notFound } from "next/navigation"

import { AppProviders } from "@/contexts/app-providers"
import { menuCatalog, type MenuCategory } from "@/lib/menu-data"

import { CategoryMenuClient } from "./CategoryMenuClient"

type Props = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const validCategories = Object.keys(menuCatalog) as MenuCategory[]

export default async function CategoryPage(props: Props) {
  const params = await props.params
  await props.searchParams

  const categoryParam = params.category as MenuCategory

  if (!validCategories.includes(categoryParam)) {
    notFound()
  }

  return (
    <AppProviders>
      <CategoryMenuClient category={categoryParam} />
    </AppProviders>
  )
}

export async function generateStaticParams() {
  return validCategories.map((category) => ({
    category,
  }))
}

export async function generateMetadata(props: Props) {
  const params = await props.params
  const { category } = params

  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1)

  return {
    title: `${capitalizedCategory} - PizzaKebab`,
    description: `Explore our delicious ${category} menu at PizzaKebab.`,
  }
}
