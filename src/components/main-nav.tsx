"use client"

import Link from "next/link"
import { Phone } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export function MainNav() {
  const { t } = useLanguage()

  const navItems = [
    {
      title: t("nav.home"),
      href: "/",
      active: true,
    },
    {
      title: t("nav.menu"),
      href: "/menu",
    },
    {
      title: t("nav.deals"),
      href: "/deals",
    },
    {
      title: t("nav.locations"),
      href: "/locations",
    },
    {
      title: t("nav.about"),
      href: "/about",
    },
  ]

  return (
    <nav className="flex items-center space-x-6 text-sm font-medium">
      <Link href="/" className="flex items-center space-x-2">
        <div className="relative overflow-hidden rounded-full bg-gradient-to-r from-red-600 to-amber-500 p-1 shadow-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xl font-bold text-red-600">
            PK
          </span>
        </div>
        <span className="font-bold text-xl">
          Pizza<span className="text-red-600">Kebab</span>
        </span>
      </Link>
      <div className="hidden md:flex items-center space-x-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-red-600 relative py-1",
              item.active ? "text-red-600 font-bold" : "text-foreground",
            )}
          >
            {item.title}
            {item.active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full"></span>}
          </Link>
        ))}
      </div>
      <div className="hidden lg:flex items-center border-l border-slate-200 pl-6 ml-2">
        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-red-600 gap-2">
          <Phone className="h-4 w-4" />
          <span className="font-bold">{t("nav.phone")}</span>
        </Button>
      </div>
      <div className="ml-4">
        <LanguageSwitcher />
      </div>
    </nav>
  )
}
