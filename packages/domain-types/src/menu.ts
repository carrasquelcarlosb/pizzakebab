export interface MenuItem {
  id: string
  menuId: string
  name: string
  nameKey?: string
  description?: string
  descriptionKey?: string
  categoryKey?: string
  price: number
  currency: string
  imageUrl?: string
  rating?: number
  discountPercentage?: number
  isPopular?: boolean
  isNew?: boolean
  isAvailable: boolean
}
