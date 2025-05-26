import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

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
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "fr-FR": "/fr",
      "de-DE": "/de",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pizzakebab.com",
    title: "PizzaKebab - Spice Up Your Experience",
    description: "Authentic flavors, fresh ingredients, and a taste that will keep you coming back for more.",
    siteName: "PizzaKebab",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PizzaKebab - Delicious Pizza and Kebab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PizzaKebab - Spice Up Your Experience",
    description: "Authentic flavors, fresh ingredients, and a taste that will keep you coming back for more.",
    images: ["/twitter-image.jpg"],
    creator: "@pizzakebab",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
