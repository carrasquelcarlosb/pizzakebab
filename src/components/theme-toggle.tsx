"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsLight(document.documentElement.classList.contains("light"))
  }, [])

  const toggle = () => {
    const html = document.documentElement
    if (isLight) {
      html.classList.remove("light")
      localStorage.setItem("theme", "dark")
      setIsLight(false)
    } else {
      html.classList.add("light")
      localStorage.setItem("theme", "light")
      setIsLight(true)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className={cn(
        "relative w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300",
        "border-white/10 hover:border-white/20 text-cream-dim hover:text-cream",
        !mounted && "opacity-0 pointer-events-none"
      )}
    >
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-300",
          isLight ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-75"
        )}
      >
        <Moon className="h-[15px] w-[15px]" />
      </span>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-300",
          isLight ? "opacity-0 -rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
        )}
      >
        <Sun className="h-[15px] w-[15px]" />
      </span>
    </button>
  )
}
