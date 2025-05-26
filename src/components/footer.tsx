"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4 text-red-500">
              Pizza<span className="text-amber-400">Kebab</span>
            </h3>
            <p className="text-gray-400 mb-4">{t("footer.description")}</p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover:text-red-500">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-red-500">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-red-500">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/menu" className="text-gray-400 hover:text-white">
                  {t("nav.menu")}
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-gray-400 hover:text-white">
                  {t("nav.deals")}
                </Link>
              </li>
              <li>
                <Link href="/locations" className="text-gray-400 hover:text-white">
                  {t("nav.locations")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white">
                  {t("footer.careers")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">{t("footer.contactUs")}</h3>
            <ul className="space-y-2 text-gray-400">
              <li>{t("footer.address")}</li>
              <li>{t("footer.phone")}</li>
              <li>{t("footer.email")}</li>
              <li>{t("footer.hours")}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">{t("footer.newsletter")}</h3>
            <p className="text-gray-400 mb-4">{t("footer.newsletterText")}</p>
            <div className="flex flex-col space-y-2">
              <Input type="email" placeholder={t("footer.emailPlaceholder")} className="bg-gray-800 border-gray-700" />
              <Button className="bg-red-600 hover:bg-red-700">{t("footer.subscribe")}</Button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>
            © {new Date().getFullYear()} {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  )
}
