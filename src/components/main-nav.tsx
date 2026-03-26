"use client"

import Link from "next/link"
import { Phone, Flame } from "lucide-react"

import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export function MainNav() {
  const { t } = useLanguage()

  const navItems = [
    { title: t("nav.home"),      href: "/",          active: true },
    { title: t("nav.menu"),      href: "/menu" },
    { title: t("nav.deals"),     href: "/deals" },
    { title: t("nav.locations"), href: "/locations" },
    { title: t("nav.about"),     href: "/about" },
  ]

  return (
    <nav className="flex items-center gap-8">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group shrink-0">
        <div className="w-8 h-8 bg-ember-600 rounded-lg flex items-center justify-center shadow-[0_0_16px_rgba(232,96,26,0.35)] group-hover:shadow-[0_0_24px_rgba(232,96,26,0.55)] transition-shadow">
          <Flame className="h-4 w-4 text-cream" />
        </div>
        <span className="font-display font-bold text-lg text-cream leading-none">
          Pizza<span className="text-ember-500">Kebab</span>
        </span>
      </Link>

      {/* Links */}
      <div className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm transition-colors duration-200 relative py-1",
              item.active
                ? "text-ember-400 font-medium"
                : "text-cream-dim hover:text-cream"
            )}
          >
            {item.title}
            {item.active && (
              <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-ember-500 rounded-full" />
            )}
          </Link>
        ))}
      </div>

      {/* Phone */}
      <div className="hidden lg:flex items-center gap-2 border-l border-white/8 pl-8">
        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-muted-foreground text-sm">{t("nav.phone")}</span>
      </div>

      <LanguageSwitcher />
    </nav>
  )
}
