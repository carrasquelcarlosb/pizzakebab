"use client"

import { useState } from "react"
import { Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import type { Language } from "@/lib/translations"

const languages = {
  en: { name: "English", flag: "🇺🇸", nativeName: "English" },
  fr: { name: "Français", flag: "🇫🇷", nativeName: "Français" },
  de: { name: "Deutsch", flag: "🇩🇪", nativeName: "Deutsch" },
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 relative overflow-hidden group hover:bg-red-50 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Globe className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
          <span className="hidden sm:inline text-2xl transition-transform duration-300 group-hover:scale-110">
            {languages[language].flag}
          </span>
          <span className="hidden md:inline font-medium">{languages[language].nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2">
        {Object.entries(languages).map(([code, { name, flag, nativeName }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => {
              setLanguage(code as Language)
              setIsOpen(false)
            }}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200",
              language === code ? "bg-red-50 text-red-600 border border-red-200" : "hover:bg-gray-50",
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{nativeName}</span>
                <span className="text-xs text-gray-500">{name}</span>
              </div>
            </div>
            {language === code && <Check className="h-4 w-4 text-red-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
