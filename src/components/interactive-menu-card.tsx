"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import { ShoppingCart, Star, Heart, Share2 } from "lucide-react"
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

interface InteractiveMenuCardProps {
  item: FoodItem
}

export function InteractiveMenuCard({ item }: InteractiveMenuCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const { language, t } = useLanguage()
  const { addItem, items } = useCart()

  const effectivePrice = item.discount
    ? item.price - (item.price * item.discount) / 100
    : item.price
  const formattedPrice = formatCurrency(effectivePrice, language)
  const formattedOriginalPrice = item.discount
    ? formatCurrency(item.price, language)
    : null
  const quantityInCart = items.find((line) => line.id === item.id)?.quantity ?? 0
  const isInCart = quantityInCart > 0

  const handleAddToCart = async () => {
    if (isAdding) {
      return
    }
    setIsAdding(true)
    setTimeout(() => setIsAdding(false), 1500)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 14
    const rotateY = (centerX - x) / 14
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
    setIsHovered(false)
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "overflow-hidden h-full flex flex-col cursor-pointer rounded-2xl transition-all duration-500",
        "bg-ash border border-white/6",
        isHovered && "shadow-[0_0_0_1px_rgba(232,96,26,0.3),0_16px_48px_rgba(232,96,26,0.15)]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          className={cn(
            "object-cover transition-all duration-700",
            isHovered ? "scale-110" : "scale-100"
          )}
        />
        {/* Dark tint on hover */}
        <div className={cn(
          "absolute inset-0 bg-void/40 transition-opacity duration-500",
          isHovered ? "opacity-100" : "opacity-0"
        )} />

        {/* Discount badge */}
        {item.discount && (
          <div className="absolute top-3 right-3 bg-ember-600 text-cream text-xs font-bold px-2 py-1 rounded-full">
            {item.discount}% {t("common.off")}
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3 bg-void/70 backdrop-blur-sm text-cream-dim text-xs px-2.5 py-1 rounded-full border border-white/10">
          {item.category}
        </div>

        {/* Hover action row */}
        <div className={cn(
          "absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 pb-4 transition-all duration-300",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          <button
            className="w-9 h-9 rounded-full bg-ash/90 border border-white/10 flex items-center justify-center hover:bg-smoke transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked) }}
          >
            <Heart className={cn("h-3.5 w-3.5 transition-colors", isLiked ? "fill-ember-500 text-ember-500" : "text-cream-dim")} />
          </button>
          <button className="w-9 h-9 rounded-full bg-ash/90 border border-white/10 flex items-center justify-center hover:bg-smoke transition-colors">
            <Share2 className="h-3.5 w-3.5 text-cream-dim" />
          </button>
        </div>

        {/* Popular/New labels */}
        {item.popular && (
          <div className={cn(
            "absolute bottom-14 left-3 bg-ember-600/90 backdrop-blur-sm text-cream text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 transition-all duration-500",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          )}>
            <Star className="h-3 w-3 fill-cream" /> {t("categories.popular")}
          </div>
        )}
        {item.new && (
          <div className={cn(
            "absolute bottom-14 right-3 bg-saffron-600/90 backdrop-blur-sm text-void text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-500",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          )}>
            {t("common.new")}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-display font-bold text-lg text-cream leading-tight group-hover:text-ember-400 transition-colors">
            {item.name}
          </h3>
          {item.rating && (
            <div className="shrink-0 flex items-center gap-1 bg-saffron-600/10 border border-saffron-600/15 px-2 py-0.5 rounded-full">
              <Star className="h-3 w-3 text-saffron-400 fill-saffron-400" />
              <span className="text-saffron-400 text-xs font-medium">{item.rating}</span>
            </div>
          )}
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Quantity selector — visible on hover */}
        <div className={cn(
          "flex items-center gap-2 mt-3 transition-all duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <span className="text-muted-foreground text-xs">Qty:</span>
          <div className="flex items-center border border-white/10 rounded-full">
            <button
              className="w-7 h-7 rounded-full text-cream-dim hover:text-cream text-sm leading-none transition-colors"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              −
            </button>
            <span className="w-6 text-center text-sm text-cream font-medium">{quantity}</span>
            <button
              className="w-7 h-7 rounded-full text-cream-dim hover:text-cream text-sm leading-none transition-colors"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-5 pb-5">
        <div className="flex items-baseline gap-2">
          <span
            className="font-display font-bold text-2xl"
            style={{ color: "#e8601a" }}
          >
            {formattedPrice}
          </span>
          {item.discount && formattedOriginalPrice && (
            <span className="text-muted-foreground text-sm line-through">{formattedOriginalPrice}</span>
          )}
        </div>

        <button
          className={cn(
            "flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-300",
            isAdding
              ? "bg-green-700 text-cream"
              : "bg-ember-600 hover:bg-ember-500 text-cream hover:shadow-[0_0_20px_rgba(232,96,26,0.4)]"
          )}
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-cream/50 border-t-cream rounded-full animate-spin" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </>
          )}
        </button>
      </div>
    </div>
  )
}
