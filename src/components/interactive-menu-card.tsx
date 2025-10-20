"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ShoppingCart, Star, Heart, Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { useCart } from "@/contexts/cart-context"

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
  const cardRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()
  const { addItem } = useCart()

  const effectivePrice = item.discount
    ? item.price - (item.price * item.discount) / 100
    : item.price
  const displayPrice = effectivePrice.toFixed(2)

  const handleAddToCart = () => {
    addItem(item.id, quantity)
    setIsAdding(true)
    addItem(
      {
        id: item.id,
        name: item.name,
        price: Number(effectivePrice.toFixed(2)),
        image: item.image,
      },
      quantity,
    )
    setTimeout(() => {
      setIsAdding(false)
      setQuantity(1)
    }, 1200)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
    setIsHovered(false)
  }

  return (
    <Card
      ref={cardRef}
      className={cn(
        "overflow-hidden transition-all duration-500 h-full flex flex-col group cursor-pointer",
        "hover:shadow-2xl hover:shadow-red-500/20 border-0 bg-white/95 backdrop-blur-sm",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          className={`object-cover transition-all duration-700 ${isHovered ? "scale-110 rotate-2" : "scale-100"}`}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

        {/* Floating badges */}
        {item.discount && (
          <Badge className="absolute top-3 right-3 bg-red-600 font-bold animate-pulse shadow-lg">
            {item.discount}% {t("common.off")}
          </Badge>
        )}

        <Badge className="absolute top-3 left-3 bg-amber-500 text-white shadow-lg backdrop-blur-sm">
          {item.category}
        </Badge>

        {/* Action buttons overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0",
          )}
        >
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/90 hover:bg-white shadow-lg transform hover:scale-110 transition-all"
            onClick={(e) => {
              e.stopPropagation()
              setIsLiked(!isLiked)
            }}
          >
            <Heart className={cn("h-4 w-4", isLiked ? "fill-red-500 text-red-500" : "text-gray-600")} />
          </Button>

          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/90 hover:bg-white shadow-lg transform hover:scale-110 transition-all"
          >
            <Share2 className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        {/* Status badges */}
        {item.popular && (
          <Badge className="absolute bottom-3 left-3 bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            <Star className="h-3 w-3 mr-1 fill-white" /> {t("categories.popular")}
          </Badge>
        )}

        {item.new && (
          <Badge className="absolute bottom-3 right-3 bg-amber-400 text-black font-bold opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            {t("common.new")}
          </Badge>
        )}
      </div>

      <CardContent className="pt-6 flex-1 relative">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-xl mb-2 group-hover:text-red-600 transition-colors leading-tight">
            {item.name}
          </h3>
          {item.rating && (
            <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-1 rounded-full">
              <Star className="h-4 w-4 fill-amber-500 mr-1" />
              <span className="text-sm font-bold">{item.rating}</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">{item.description}</p>

        {/* Quantity selector */}
        <div
          className={cn(
            "flex items-center gap-2 mt-4 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          )}
        >
          <span className="text-sm text-gray-600">{t("cart.quantity")}:</span>
          <div className="flex items-center border rounded-full">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </Button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-0 pb-6 px-6">
        <div className="font-bold text-xl">
          <span className="text-red-600 text-2xl">{formattedPrice}</span>
          {formattedOriginalPrice && (
            <span className="text-sm text-muted-foreground line-through ml-2">{formattedOriginalPrice}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isInCart && (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              {t("common.inCart")}: {quantityInCart}
            </Badge>
          )}
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t("cart.added")}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {t("cart.addToCart")}
            </div>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
