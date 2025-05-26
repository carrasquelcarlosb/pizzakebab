"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export function MobileNav() {
  const [open, setOpen] = useState(false)
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-white">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <span className="font-bold text-xl text-red-600">
              Pizza<span className="text-amber-500">Kebab</span>
            </span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-6 w-6" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <nav className="mt-8 flex flex-col space-y-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "text-lg transition-colors hover:text-red-600",
                item.active ? "text-red-600 font-bold" : "text-foreground",
              )}
            >
              {item.title}
            </Link>
          ))}
          <div className="flex flex-col space-y-3 pt-4">
            <div className="pt-4 border-t">
              <LanguageSwitcher />
            </div>
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full">
                {t("nav.signIn")}
              </Button>
            </Link>
            <Link href="/order" onClick={() => setOpen(false)}>
              <Button className="w-full bg-red-600 hover:bg-red-700">{t("nav.orderNow")}</Button>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
