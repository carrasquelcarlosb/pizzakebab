"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { translations, type Language, type TranslationKey } from "@/lib/translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

type TranslationDictionary = Record<string, unknown>

const getNestedValue = (dictionary: TranslationDictionary, path: readonly string[]) => {
  // Anti-pattern explained: mutating a loosely typed `any` while walking nested objects (the previous approach)
  // hides type issues and duplicates fallback logic. A small pure helper keeps the lookup obvious and testable.
  return path.reduce<unknown>((value, segment) => {
    if (value && typeof value === "object" && segment in value) {
      return (value as TranslationDictionary)[segment]
    }
    return undefined
  }, dictionary)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: TranslationKey): string => {
    const keys = key.split(".")

    const localized = getNestedValue(translations[language] as TranslationDictionary, keys)
    if (typeof localized === "string") {
      return localized
    }

    const fallback = getNestedValue(translations.en as TranslationDictionary, keys)
    // Anti-pattern explained: silently returning partially resolved objects made debugging impossible.
    // By checking for a final string result we expose missing translations quickly while still returning the key.
    return typeof fallback === "string" ? fallback : key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
