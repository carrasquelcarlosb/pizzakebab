"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, ShoppingCart, Star } from "lucide-react"

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
  const [isAdding, setIsAdding]   = useState(false)
  const { t } = useLanguage()

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
    setTimeout(() => setIsAdding(false), 1000)
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-ash border border-white/6 flex flex-col transition-all duration-300 group h-full",
        isHovered && "shadow-[0_0_0_1px_rgba(232,96,26,0.25),0_12px_40px_rgba(232,96,26,0.12)]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          className={cn(
            "object-cover transition-transform duration-500",
            isHovered ? "scale-110" : "scale-100"
          )}
        />
        <div className={cn(
          "absolute inset-0 bg-void/40 transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )} />

        {item.discount && (
          <div className="absolute top-2.5 right-2.5 bg-ember-600 text-cream text-[10px] font-bold px-2 py-0.5 rounded-full">
            {item.discount}% {t("common.off")}
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 bg-void/70 backdrop-blur-sm text-cream-dim text-[10px] px-2 py-0.5 rounded-full border border-white/10">
          {item.category}
        </div>

        {item.popular && (
          <div className={cn(
            "absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-ember-600/90 text-cream text-[10px] font-medium px-2 py-0.5 rounded-full transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <Star className="h-2.5 w-2.5 fill-cream" /> {t("categories.popular")}
          </div>
        )}
        {item.new && (
          <div className={cn(
            "absolute bottom-2.5 right-2.5 bg-saffron-600/90 text-void text-[10px] font-bold px-2 py-0.5 rounded-full transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            {t("common.new")}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h3 className="font-display font-bold text-base text-cream leading-tight group-hover:text-ember-400 transition-colors">
            {item.name}
          </h3>
          {item.rating && (
            <div className="shrink-0 flex items-center gap-0.5 bg-saffron-600/10 px-1.5 py-0.5 rounded-full">
              <Star className="h-2.5 w-2.5 text-saffron-400 fill-saffron-400" />
              <span className="text-saffron-400 text-[10px] font-medium">{item.rating}</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-xl text-ember-500">${displayPrice}</span>
            {item.discount && (
              <span className="text-muted-foreground text-xs line-through">${item.price.toFixed(2)}</span>
            )}
          </div>
          <div className="flex gap-1.5">
            <button className="w-8 h-8 rounded-full border border-white/10 hover:border-white/20 flex items-center justify-center text-cream-dim hover:text-cream transition-all">
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                isAdding
                  ? "bg-green-700 text-cream"
                  : "bg-ember-600 hover:bg-ember-500 text-cream hover:shadow-[0_0_16px_rgba(232,96,26,0.35)]"
              )}
              onClick={handleAddToCart}
            >
              <ShoppingCart className={cn("h-3.5 w-3.5 transition-transform duration-300", isAdding && "scale-0")} />
              {isAdding && <span className="absolute text-xs">✓</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
