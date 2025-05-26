"use client"

import Link from "next/link"
import { Clock, Percent } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export function PromoBanner() {
  const { t } = useLanguage()

  return (
    <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=200')] opacity-10"></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-radial from-amber-400/30 to-transparent rounded-full blur-3xl"></div>

      <div className="container relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-full mr-4">
              <Percent className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{t("promo.title")}</h3>
              <p className="text-white/80">
                {t("promo.subtitle")} <span className="font-bold">{t("promo.code")}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
              <Clock className="h-5 w-5 mr-2" />
              <span className="font-medium">{t("promo.countdown")}</span>
            </div>
            <Link href="/menu">
              <Button className="bg-white text-red-600 hover:bg-amber-100 hover:text-red-700 font-bold">
                {t("promo.orderNow")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
