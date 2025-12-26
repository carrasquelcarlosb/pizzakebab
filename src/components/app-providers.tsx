"use client"

import type { ReactNode } from "react"

import { CartProvider } from "@/contexts/cart-context"
import { LanguageProvider } from "@/contexts/language-context"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <CartProvider>{children}</CartProvider>
    </LanguageProvider>
  )
}
