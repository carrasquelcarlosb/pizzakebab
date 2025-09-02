"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LanguageProvider, useLanguage } from "@/contexts/language-context"
import { Clock, Star, Percent, Gift, Flame, Users, Calendar, ShoppingCart } from "lucide-react"
import Image from "next/image"

interface Deal {
  id: string
  titleKey: string
  descriptionKey: string
  discount: string
  originalPrice: number
  dealPrice: number
  validUntil: string
  image: string
  category: "pizza" | "kebab" | "combo" | "special"
  isLimited: boolean
  isPopular: boolean
}

const dealsData: Deal[] = [
  {
    id: "deal-1",
    titleKey: "deals.midnightFeast.title",
    descriptionKey: "deals.midnightFeast.description",
    discount: "30%",
    originalPrice: 28.99,
    dealPrice: 19.99,
    validUntil: "2024-12-31",
    image: "/placeholder.svg?height=300&width=400",
    category: "combo",
    isLimited: true,
    isPopular: true
  },
  {
    id: "deal-2",
    titleKey: "deals.studentSpecial.title",
    descriptionKey: "deals.studentSpecial.description",
    discount: "25%",
    originalPrice: 15.99,
    dealPrice: 11.99,
    validUntil: "2024-12-31",
    image: "/placeholder.svg?height=300&width=400",
    category: "pizza",
    isLimited: false,
    isPopular: false
  },
  {
    id: "deal-3",
    titleKey: "deals.familyFeast.title",
    descriptionKey: "deals.familyFeast.description",
    discount: "35%",
    originalPrice: 45.99,
    dealPrice: 29.99,
    validUntil: "2024-12-31",
    image: "/placeholder.svg?height=300&width=400",
    category: "combo",
    isLimited: false,
    isPopular: true
  },
  {
    id: "deal-4",
    titleKey: "deals.kebabMaster.title",
    descriptionKey: "deals.kebabMaster.description",
    discount: "20%",
    originalPrice: 24.99,
    dealPrice: 19.99,
    validUntil: "2024-12-31",
    image: "/placeholder.svg?height=300&width=400",
    category: "kebab",
    isLimited: true,
    isPopular: false
  }
]

function DealsContent() {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({})
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)

  // Transform deals data with translated content
  const deals = dealsData.map(deal => ({
    ...deal,
    title: t(deal.titleKey),
    description: t(deal.descriptionKey)
  }))

  // Timer for limited deals - minimalist approach
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const newTimeLeft: { [key: string]: string } = {}

      deals.forEach(deal => {
        if (deal.isLimited) {
          const endTime = new Date(deal.validUntil).getTime()
          const distance = endTime - now

          if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24))
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))

            newTimeLeft[deal.id] = `${days}d ${hours}h ${minutes}m`
          } else {
            newTimeLeft[deal.id] = "Expired"
          }
        }
      })

      setTimeLeft(newTimeLeft)
    }, 1000)

    return () => clearInterval(interval)
  }, [deals])

  const categories = [
    { id: "all", label: t("deals.categories.all"), icon: Gift },
    { id: "combo", label: t("deals.categories.combo"), icon: Users },
    { id: "pizza", label: t("deals.categories.pizza"), icon: Percent },
    { id: "kebab", label: t("deals.categories.kebab"), icon: Flame }
  ]

  const filteredDeals = selectedCategory === "all"
    ? deals
    : deals.filter(deal => deal.category === selectedCategory)

  const formatPrice = (price: number) => `€${price.toFixed(2)}`

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubscribing(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false)
      setEmail("")
      // In a real app, you would show a toast notification here
      console.log(`Subscribed email: ${email}`)
    }, 1000)
  }

  const handleClaimDeal = (deal: typeof deals[0]) => {
    // In a real app, this would add the deal to cart
    console.log(`Claimed deal: ${deal.title} for ${formatPrice(deal.dealPrice)}`)
    // You could also show a toast notification here
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <div className="sticky top-0 z-50 w-full border-b border-slate-200/50 backdrop-blur-md bg-white/80">
        <div className="container mx-auto px-4">
          <div className="hidden md:block">
            <MainNav />
          </div>
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>

      {/* Hero Section - Zen simplicity */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-red-100 text-red-700 px-6 py-3 rounded-full text-sm font-medium">
              <Flame className="w-4 h-4" />
              {t("deals.hero.badge")}
            </div>

            <h1 className="text-6xl lg:text-7xl font-light text-slate-900 tracking-tight">
              {t("deals.hero.title")}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 font-bold">
                {t("deals.hero.subtitle")}
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
              {t("deals.hero.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter - Clean lines */}
      <section className="py-12 border-b border-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant="ghost"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-8 py-4 rounded-full transition-all duration-500 border ${selectedCategory === category.id
                      ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-105"
                      : "border-slate-200 hover:border-slate-300 hover:scale-105"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Deals Grid - Parkour flow */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {filteredDeals.map((deal, index) => (
              <Card
                key={deal.id}
                className="group overflow-hidden border-0 shadow-sm hover:shadow-2xl transition-all duration-700 animate-slide-up bg-white/80 backdrop-blur-sm"
                style={{
                  animationDelay: `${index * 0.15}s`,
                  transform: index % 2 === 0 ? 'translateY(2rem)' : 'translateY(-2rem)'
                }}
              >
                <div className="relative">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={deal.image}
                      alt={deal.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Minimalist badges */}
                    <div className="absolute top-6 left-6 flex flex-col gap-3">
                      <div className="bg-white/90 backdrop-blur-sm text-slate-900 px-4 py-2 rounded-full text-sm font-medium">
                        -{deal.discount}
                      </div>
                      {deal.isPopular && (
                        <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          {t("deals.badges.popular")}
                        </div>
                      )}
                    </div>

                    {/* Timer */}
                    {deal.isLimited && timeLeft[deal.id] && (
                      <div className="absolute top-6 right-6 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {timeLeft[deal.id]}
                      </div>
                    )}

                    {/* Price overlay */}
                    <div className="absolute bottom-6 right-6 text-right">
                      <div className="text-sm text-white/70 line-through">
                        {formatPrice(deal.originalPrice)}
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {formatPrice(deal.dealPrice)}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-8">
                    <h3 className="text-2xl font-light text-slate-900 mb-4 group-hover:text-red-600 transition-colors">
                      {deal.title}
                    </h3>

                    <p className="text-slate-600 mb-8 leading-relaxed">
                      {deal.description}
                    </p>

                    <div className="space-y-4">
                      <Button
                        size="lg"
                        className="w-full bg-slate-900 hover:bg-red-600 text-white font-light tracking-wide transition-all duration-300 rounded-none"
                        onClick={() => handleClaimDeal(deal)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {t("deals.actions.claim")}
                      </Button>

                      <div className="text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t("deals.validUntil")} {new Date(deal.validUntil).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          {filteredDeals.length === 0 && (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-8">
                <Gift className="w-16 h-16 text-slate-300" />
              </div>
              <h3 className="text-3xl font-light text-slate-900 mb-4">{t("deals.empty.title")}</h3>
              <p className="text-slate-500 font-light">{t("deals.empty.description")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter - Minimal CTA */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-light text-slate-900">{t("deals.newsletter.title")}</h2>
            <p className="text-slate-600 leading-relaxed font-light">
              {t("deals.newsletter.description")}
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-0 max-w-md mx-auto border border-slate-200 rounded-none overflow-hidden bg-white">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("deals.newsletter.placeholder")}
                className="flex-1 px-6 py-4 border-none focus:ring-0 text-slate-900 rounded-none"
                required
              />
              <Button
                type="submit"
                size="lg"
                disabled={isSubscribing || !email.trim()}
                className="bg-slate-900 hover:bg-red-600 text-white px-8 rounded-none font-light disabled:opacity-50"
              >
                {isSubscribing ? "..." : t("deals.newsletter.button")}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function DealsPageClient() {
  return (
    <LanguageProvider>
      <DealsContent />
    </LanguageProvider>
  )
}