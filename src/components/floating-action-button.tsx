"use client"

import { useState } from "react"
import Link from "next/link"
import { Phone, MessageCircle, ShoppingCart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  const actions = [
    {
      icon: Phone,
      label: t("nav.phone"),
      href: "tel:123-456-7890",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      icon: MessageCircle,
      label: "Chat",
      href: "#",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      icon: ShoppingCart,
      label: t("nav.cart"),
      href: "/cart",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Action buttons */}
        <div
          className={cn(
            "absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300",
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
          )}
        >
          {actions.map((action, index) => (
            <Link key={action.label} href={action.href}>
              <Button
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110",
                  action.color,
                  isOpen ? "animate-in slide-in-from-bottom-2" : "",
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <action.icon className="h-5 w-5" />
                <span className="sr-only">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>

        {/* Main FAB */}
        <Button
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg transition-all duration-300 transform hover:scale-110",
            isOpen && "rotate-45",
          )}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  )
}
