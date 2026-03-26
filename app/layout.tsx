import type { Metadata } from "next"
import { Playfair_Display, DM_Sans } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
})

export const metadata: Metadata = {
  title: {
    default: "PizzaKebab - Spice Up Your Experience",
    template: "%s | PizzaKebab",
  },
  description: "Authentic flavors, fresh ingredients, and a taste that will keep you coming back for more.",
  keywords: ["pizza", "kebab", "restaurant", "food delivery", "authentic cuisine"],
  authors: [{ name: "PizzaKebab Team" }],
  creator: "PizzaKebab",
  publisher: "PizzaKebab",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://pizzakebab.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pizzakebab.com",
    title: "PizzaKebab - Spice Up Your Experience",
    description: "Authentic flavors, fresh ingredients, and a taste that will keep you coming back for more.",
    siteName: "PizzaKebab",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('theme')==='light'){document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${playfair.variable} ${dmSans.variable} font-sans`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}