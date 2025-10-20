import type { TranslationKey, FoodKey, Language } from "@/lib/translations"

export type MenuCategory = "pizzas" | "kebabs" | "wraps" | "sides"

type CategoryTranslationKey = Extract<
  TranslationKey,
  `categories.${string}` | `common.${string}`
>

interface MenuItemDefinition<TFood extends FoodKey = FoodKey> {
  id: number
  food: TFood
  price: number
  image: string
  categoryKey: CategoryTranslationKey
  rating?: number
  popular?: boolean
  discount?: number
  new?: boolean
}

export interface LocalizedMenuItem {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  rating?: number
  popular?: boolean
  discount?: number
  new?: boolean
}

const BASE_IMAGE = "/placeholder.svg?height=300&width=300"

export const menuCatalog: Record<MenuCategory, readonly MenuItemDefinition[]> = {
  pizzas: [
    {
      id: 101,
      food: "spicyKebabPizza",
      price: 14.99,
      image: BASE_IMAGE,
      categoryKey: "common.specialtyPizzas",
      rating: 4.8,
      popular: true,
    },
    {
      id: 102,
      food: "margherita",
      price: 11.99,
      image: BASE_IMAGE,
      categoryKey: "common.classicPizzas",
      rating: 4.6,
    },
    {
      id: 103,
      food: "meatFeastPizza",
      price: 15.99,
      image: BASE_IMAGE,
      categoryKey: "common.specialtyPizzas",
      discount: 10,
      rating: 4.9,
    },
    {
      id: 104,
      food: "veggieSupreme",
      price: 13.99,
      image: BASE_IMAGE,
      categoryKey: "common.vegetarian",
      rating: 4.4,
    },
  ],
  kebabs: [
    {
      id: 201,
      food: "mixedGrillKebab",
      price: 16.99,
      image: BASE_IMAGE,
      categoryKey: "categories.kebabs",
      rating: 4.7,
    },
    {
      id: 202,
      food: "chickenShish",
      price: 13.99,
      image: BASE_IMAGE,
      categoryKey: "categories.kebabs",
      rating: 4.5,
    },
    {
      id: 203,
      food: "lambKofte",
      price: 14.99,
      image: BASE_IMAGE,
      categoryKey: "categories.kebabs",
      discount: 15,
      rating: 4.8,
    },
    {
      id: 204,
      food: "vegetableKebab",
      price: 12.99,
      image: BASE_IMAGE,
      categoryKey: "common.vegetarian",
      rating: 4.3,
    },
  ],
  wraps: [
    {
      id: 301,
      food: "chickenShawarmaWrap",
      price: 9.99,
      image: BASE_IMAGE,
      categoryKey: "categories.wraps",
      rating: 4.6,
    },
    {
      id: 302,
      food: "lambDonerWrap",
      price: 10.99,
      image: BASE_IMAGE,
      categoryKey: "categories.wraps",
      rating: 4.4,
    },
    {
      id: 303,
      food: "falafelWrap",
      price: 8.99,
      image: BASE_IMAGE,
      categoryKey: "common.vegetarian",
      rating: 4.4,
      new: true,
    },
  ],
  sides: [
    {
      id: 401,
      food: "garlicCheeseBread",
      price: 5.99,
      image: BASE_IMAGE,
      categoryKey: "categories.sides",
      rating: 4.5,
    },
    {
      id: 402,
      food: "spicyPotatoWedges",
      price: 4.99,
      image: BASE_IMAGE,
      categoryKey: "categories.sides",
      rating: 4.2,
    },
  ],
} as const

const catalogEntries = Object.entries(menuCatalog) as [
  MenuCategory,
  readonly MenuItemDefinition[],
][]

const menuItemIndex = new Map<number, MenuItemDefinition>(
  catalogEntries.flatMap(([, items]) => items.map((item) => [item.id, item] as const)),
)

const toTranslationKey = <TKey extends TranslationKey>(key: TKey) => key

const resolveMenuItem = (
  definition: MenuItemDefinition,
  translate: (key: TranslationKey) => string,
): LocalizedMenuItem => {
  const nameKey = toTranslationKey(`food.${definition.food}.name` as const)
  const descriptionKey = toTranslationKey(`food.${definition.food}.description` as const)

  return {
    id: definition.id,
    name: translate(nameKey),
    description: translate(descriptionKey),
    price: definition.price,
    image: definition.image,
    category: translate(toTranslationKey(definition.categoryKey)),
    rating: definition.rating,
    popular: definition.popular,
    discount: definition.discount,
    new: definition.new,
  }
}

export const getLocalizedMenuSections = (
  translate: (key: TranslationKey) => string,
): Record<MenuCategory, LocalizedMenuItem[]> =>
  Object.fromEntries(
    catalogEntries.map(([category, items]) => [
      category,
      items.map((item) => resolveMenuItem(item, translate)),
    ]),
  ) as Record<MenuCategory, LocalizedMenuItem[]>

export const getLocalizedMenuItemById = (
  id: number,
  translate: (key: TranslationKey) => string,
): LocalizedMenuItem | undefined => {
  const definition = menuItemIndex.get(id)
  return definition ? resolveMenuItem(definition, translate) : undefined
}

export const defaultFeaturedItemIds = [101, 201, 401, 301, 103, 303] as const

export const getFeaturedMenuItems = (
  translate: (key: TranslationKey) => string,
  ids: readonly number[] = defaultFeaturedItemIds,
): LocalizedMenuItem[] =>
  ids
    .map((id) => menuItemIndex.get(id))
    .filter((definition): definition is MenuItemDefinition => Boolean(definition))
    .map((definition) => resolveMenuItem(definition, translate))

export const getMenuCategoryLabelKey = (category: MenuCategory): TranslationKey =>
  toTranslationKey(`categories.${category}` as const)

export const getMenuCategoryCount = (category: MenuCategory): number =>
  menuCatalog[category].length

const localeByLanguage: Record<Language, string> = {
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
}

const currencyByLanguage: Record<Language, string> = {
  en: "USD",
  fr: "EUR",
  de: "EUR",
}

export const formatCurrency = (value: number, language: Language): string => {
  const locale = localeByLanguage[language] ?? "en-US"
  const currency = currencyByLanguage[language] ?? "USD"

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
