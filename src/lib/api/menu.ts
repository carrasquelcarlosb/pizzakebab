import { apiFetch } from "@/lib/api-client"
import type { TranslationKey } from "@/lib/translations"

export interface MenuItemApi {
  id: string
  legacyId?: number
  menuId: string
  name: string
  description?: string
  nameKey?: TranslationKey
  descriptionKey?: TranslationKey
  categoryKey?: TranslationKey
  price: number
  currency: string
  imageUrl?: string
  rating?: number
  discountPercentage?: number
  isPopular?: boolean
  isNew?: boolean
  isAvailable: boolean
}

export interface MenuApi {
  id: string
  name: string
  description?: string
  translationKey?: TranslationKey
  isActive: boolean
  items: MenuItemApi[]
}

export interface MenusResponse {
  menus: MenuApi[]
}

export const fetchMenus = async (): Promise<MenusResponse> => apiFetch<MenusResponse>("/menus")

