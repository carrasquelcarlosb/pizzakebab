"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Flame, MapPin, Phone, Mail, Clock } from "lucide-react"

import { useLanguage } from "@/contexts/language-context"

export function Footer() {
  const { t } = useLanguage()

  const socialLinks = [
    { icon: Facebook,  href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter,   href: "#", label: "Twitter" },
  ]

  const quickLinks = [
    { label: t("nav.menu"),      href: "/menu" },
    { label: t("nav.deals"),     href: "/deals" },
    { label: t("nav.locations"), href: "/locations" },
    { label: t("nav.about"),     href: "/about" },
    { label: t("footer.careers"), href: "/careers" },
  ]

  const contactItems = [
    { icon: MapPin,  text: t("footer.address") },
    { icon: Phone,   text: t("footer.phone") },
    { icon: Mail,    text: t("footer.email") },
    { icon: Clock,   text: t("footer.hours") },
  ]

  return (
    <footer className="bg-void border-t border-white/5">
      {/* Top section */}
      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="w-8 h-8 bg-ember-600 rounded-lg flex items-center justify-center shadow-[0_0_16px_rgba(232,96,26,0.35)] group-hover:shadow-[0_0_24px_rgba(232,96,26,0.55)] transition-shadow">
                <Flame className="h-4 w-4 text-cream" />
              </div>
              <span className="font-display font-bold text-lg text-cream">
                Pizza<span className="text-ember-500">Kebab</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground hover:text-ember-400 hover:border-ember-600/30 transition-all"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-cream text-sm mb-5 tracking-wide">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-cream-dim text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-cream text-sm mb-5 tracking-wide">
              {t("footer.contactUs")}
            </h4>
            <ul className="space-y-3">
              {contactItems.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5">
                  <Icon className="h-3.5 w-3.5 text-ember-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground text-sm leading-snug">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-semibold text-cream text-sm mb-2 tracking-wide">
              {t("footer.newsletter")}
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed mb-5">
              {t("footer.newsletterText")}
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="w-full bg-ash border border-white/8 rounded-xl px-4 py-2.5 text-sm text-cream placeholder:text-muted-foreground focus:outline-none focus:border-ember-600/40 transition-colors"
              />
              <button className="w-full bg-ember-600 hover:bg-ember-500 text-cream text-sm font-medium py-2.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(232,96,26,0.3)]">
                {t("footer.subscribe")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-muted-foreground hover:text-cream-dim text-xs transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
