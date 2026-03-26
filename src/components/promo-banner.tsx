"use client"

import Link from "next/link"
import { Clock, ArrowRight } from "lucide-react"

import { useLanguage } from "@/contexts/language-context"

export function PromoBanner() {
  const { t } = useLanguage()

  return (
    <section
      className="relative overflow-hidden py-5 border-y border-white/5"
      style={{ background: "linear-gradient(90deg, #1c1510 0%, #251c14 50%, #1c1510 100%)" }}
    >
      {/* Ember glow accent */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[80px] bg-ember-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Left content */}
          <div className="flex items-center gap-5">
            {/* Big discount badge */}
            <div
              className="shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-display font-black text-void shadow-lg"
              style={{ background: "linear-gradient(135deg, #e8601a, #c9911c)" }}
            >
              <span className="text-xl leading-none">20</span>
              <span className="text-[9px] leading-none tracking-wider">% OFF</span>
            </div>
            <div>
              <p className="text-cream font-medium text-sm">
                {t("promo.title")}
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                {t("promo.subtitle")}{" "}
                <span className="font-mono font-bold text-saffron-400 bg-saffron-600/10 px-1.5 py-0.5 rounded border border-saffron-600/20 text-[11px]">
                  {t("promo.code")}
                </span>
              </p>
            </div>
          </div>

          {/* Right: countdown + CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>{t("promo.countdown")}</span>
            </div>
            <Link href="/menu">
              <button className="group flex items-center gap-1.5 bg-ember-600/15 hover:bg-ember-600/25 border border-ember-600/25 hover:border-ember-600/40 text-ember-400 hover:text-ember-300 text-xs font-medium px-4 py-2 rounded-full transition-all">
                {t("promo.orderNow")}
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
