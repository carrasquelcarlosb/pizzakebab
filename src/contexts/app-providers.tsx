"use client"

import type { ReactNode } from "react"

import { CartProvider } from "./cart-context"
import { LanguageProvider } from "./language-context"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <CartProvider>{children}</CartProvider>
    </LanguageProvider>
  )
}
