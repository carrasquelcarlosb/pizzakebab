import type { MenuApi, MenuItemApi } from "@/lib/api/menu"
import type { LocalizedMenuItem } from "@/lib/menu-data"
import type { TranslationKey } from "@/lib/translations"

export const CATEGORY_ORDER = ["pizzas", "kebabs", "wraps", "sides", "drinks", "desserts"] as const
export type OrderedCategory = (typeof CATEGORY_ORDER)[number]

const FALLBACK_IMAGE = "/placeholder.svg?height=300&width=300"

export const toNumericId = (value: string): number => {
  const parsed = Number.parseInt(value, 10)
  if (Number.isFinite(parsed)) {
    return parsed
  }
  return Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

type TranslateFn = (key: TranslationKey) => string

export const toLocalizedItem = (
  item: MenuItemApi,
  categoryLabel: string,
  translate: TranslateFn,
): LocalizedMenuItem => {
  const name = item.nameKey ? translate(item.nameKey) : item.name
  const description = item.descriptionKey ? translate(item.descriptionKey) : item.description ?? ""
  const category = item.categoryKey ? translate(item.categoryKey) : categoryLabel

  return {
    id: toNumericId(item.id),
    name,
    description,
    price: item.price,
    image: item.imageUrl ?? FALLBACK_IMAGE,
    category,
    rating: item.rating,
    popular: item.isPopular,
    discount: item.discountPercentage ?? undefined,
    new: item.isNew,
  }
}

export const buildCategoryMap = (
  menus: MenuApi[],
  translate: TranslateFn,
): Record<string, LocalizedMenuItem[]> => {
  const baseEntries: Array<[string, LocalizedMenuItem[]]> = CATEGORY_ORDER.map((category) => [
    category,
    [] as LocalizedMenuItem[],
  ])
  const knownCategories = new Set(baseEntries.map(([category]) => category))

  for (const menu of menus) {
    if (!knownCategories.has(menu.id)) {
      baseEntries.push([menu.id, []])
      knownCategories.add(menu.id)
    }
  }

  const categoryMap = new Map<string, LocalizedMenuItem[]>(baseEntries)

  for (const menu of menus) {
    const label = menu.translationKey ? translate(menu.translationKey) : menu.name
    const items = menu.items
      .filter((item) => item.isAvailable)
      .map((item) => toLocalizedItem(item, label, translate))

    const existing = categoryMap.get(menu.id) ?? []
    categoryMap.set(menu.id, [...existing, ...items])
  }

  return Object.fromEntries(categoryMap.entries()) as Record<string, LocalizedMenuItem[]>
}

export const isKnownCategory = (value: string): value is OrderedCategory =>
  (CATEGORY_ORDER as readonly string[]).includes(value)

