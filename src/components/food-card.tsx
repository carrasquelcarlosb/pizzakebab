"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, ShoppingCart, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { useCart } from "@/contexts/cart-context"
import { formatCurrency } from "@/lib/menu-data"

interface FoodItem {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  discount?: number
  rating?: number
  popular?: boolean
  new?: boolean
}

interface FoodCardProps {
  item: FoodItem
}

export function FoodCard({ item }: FoodCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { t, language } = useLanguage()
  const { addItem } = useCart()

  const discountedPrice = item.discount
    ? item.price - (item.price * item.discount) / 100
    : item.price
  const formattedPrice = formatCurrency(discountedPrice, language)
  const formattedOriginalPrice = item.discount
    ? formatCurrency(item.price, language)
    : undefined

  const handleAddToCart = async () => {
    if (isAdding) {
      return
    }
    setIsAdding(true)
    try {
      await addItem(
        {
          id: item.id,
          name: item.name,
          price: Number(discountedPrice.toFixed(2)),
          image: item.image,
        },
        1,
      )
      setTimeout(() => setIsAdding(false), 1000)
    } catch (error) {
      console.error("Failed to add item to cart", error)
      setIsAdding(false)
    }
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 h-full flex flex-col group",
        isHovered && "shadow-xl shadow-red-500/10 scale-[1.02]",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          className={`object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {item.discount && (
          <Badge className="absolute top-2 right-2 bg-red-600 font-bold animate-pulse">
            {item.discount}% {t("common.off")}
          </Badge>
        )}

        <Badge className="absolute top-2 left-2 bg-amber-500 text-white">{item.category}</Badge>

        {item.popular && (
          <Badge className="absolute bottom-2 left-2 bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Star className="h-3 w-3 mr-1 fill-white" /> {t("categories.popular")}
          </Badge>
        )}

        {item.new && (
          <Badge className="absolute bottom-2 right-2 bg-amber-400 text-black font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {t("common.new")}
          </Badge>
        )}
      </div>
      <CardContent className="pt-4 flex-1 relative">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg mb-1 group-hover:text-red-600 transition-colors">{item.name}</h3>
          {item.rating && (
            <div className="flex items-center text-amber-500">
              <Star className="h-4 w-4 fill-amber-500 mr-1" />
              <span className="text-sm font-medium">{item.rating}</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2">{item.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-0 pb-4">
        <div className="font-bold text-lg">
          <span className="text-red-600">{formattedPrice}</span>
          {formattedOriginalPrice && (
            <span className="text-sm text-muted-foreground line-through ml-2">{formattedOriginalPrice}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full h-9 w-9 border-red-200 text-red-600 hover:text-red-700 hover:border-red-300 transition-all"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className={cn(
              "rounded-full h-9 w-9 bg-red-600 hover:bg-red-700 transition-all overflow-hidden",
              isAdding && "bg-green-600 hover:bg-green-700",
            )}
            onClick={handleAddToCart}
          >
            <ShoppingCart
              className={cn("h-4 w-4 transition-transform duration-300", isAdding && "translate-y-[-100%]")}
            />
            <span
              className={cn(
                "absolute h-4 w-4 transition-transform duration-300",
                isAdding ? "translate-y-0" : "translate-y-[100%]",
              )}
            >
              ✓
            </span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
