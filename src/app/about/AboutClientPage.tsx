"use client"

import { useRef, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LanguageProvider, useLanguage } from "@/contexts/language-context"
import { Heart, Users, Award, Leaf, Clock, Star } from "lucide-react"
import Image from "next/image"

interface TeamMember {
  id: string
  nameKey: string
  roleKey: string
  bioKey: string
  image: string
  specialties: string[]
}

interface Value {
  id: string
  titleKey: string
  descriptionKey: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const teamData: TeamMember[] = [
  {
    id: "chef-marco",
    nameKey: "about.team.marco.name",
    roleKey: "about.team.marco.role",
    bioKey: "about.team.marco.bio",
    image: "/placeholder.svg?height=300&width=300",
    specialties: ["Wood-fired Pizza", "Italian Cuisine", "Recipe Innovation"]
  },
  {
    id: "chef-hassan",
    nameKey: "about.team.hassan.name",
    roleKey: "about.team.hassan.role",
    bioKey: "about.team.hassan.bio",
    image: "/placeholder.svg?height=300&width=300",
    specialties: ["Authentic Kebabs", "Mediterranean Spices", "Grilled Meats"]
  },
  {
    id: "manager-sofia",
    nameKey: "about.team.sofia.name",
    roleKey: "about.team.sofia.role",
    bioKey: "about.team.sofia.bio",
    image: "/placeholder.svg?height=300&width=300",
    specialties: ["Customer Experience", "Operations", "Team Leadership"]
  }
]

const valuesData: Value[] = [
  {
    id: "quality",
    titleKey: "about.values.quality.title",
    descriptionKey: "about.values.quality.description",
    icon: Award
  },
  {
    id: "authenticity",
    titleKey: "about.values.authenticity.title",
    descriptionKey: "about.values.authenticity.description",
    icon: Heart
  },
  {
    id: "sustainability",
    titleKey: "about.values.sustainability.title",
    descriptionKey: "about.values.sustainability.description",
    icon: Leaf
  },
  {
    id: "community",
    titleKey: "about.values.community.title",
    descriptionKey: "about.values.community.description",
    icon: Users
  }
]

function AboutContent() {
  const { t } = useLanguage()
  const observerRef = useRef<IntersectionObserver>()

  // Transform data with translations
  const team = teamData.map(member => ({
    ...member,
    name: t(member.nameKey),
    role: t(member.roleKey),
    bio: t(member.bioKey)
  }))

  const values = valuesData.map(value => ({
    ...value,
    title: t(value.titleKey),
    description: t(value.descriptionKey)
  }))

  // Intersection observer for scroll animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px 0px' }
    )

    const elements = document.querySelectorAll('.observe-me')
    elements.forEach((el) => observerRef.current?.observe(el))

    return () => observerRef.current?.disconnect()
  }, [])

  const stats = [
    { value: "2018", labelKey: "about.stats.founded" },
    { value: "10K+", labelKey: "about.stats.customers" },
    { value: "3", labelKey: "about.stats.locations" },
    { value: "4.8", labelKey: "about.stats.rating" }
  ]

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

      {/* Hero Section - Story Opening */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-6xl lg:text-7xl font-light text-slate-900 tracking-tight">
              {t("about.hero.title")}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 font-bold">
                {t("about.hero.subtitle")}
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
              {t("about.hero.description")}
            </p>

            <div className="pt-8">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-red-100 text-red-700 px-6 py-3 rounded-full">
                <Clock className="w-4 h-4" />
                {t("about.hero.since2018")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Minimalist counters */}
      <section className="py-16 border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.labelKey}
                  className="text-center observe-me opacity-0 transition-all duration-700"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl lg:text-5xl font-light text-slate-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500 uppercase tracking-wide">
                    {t(stat.labelKey)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story Section - Flowing narrative */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 observe-me opacity-0">
                <div>
                  <h2 className="text-4xl font-light text-slate-900 mb-6">
                    {t("about.story.title")}
                  </h2>
                  <div className="space-y-6 text-slate-600 leading-relaxed">
                    <p>{t("about.story.paragraph1")}</p>
                    <p>{t("about.story.paragraph2")}</p>
                    <p>{t("about.story.paragraph3")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="text-sm text-slate-500">
                    {t("about.story.customerRating")}
                  </div>
                </div>
              </div>

              <div className="relative observe-me opacity-0">
                <div className="relative h-96 rounded-2xl overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Restaurant Story"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>

                {/* Floating elements */}
                <div className="absolute -top-8 -left-8 w-20 h-20 bg-red-500/20 rounded-full blur-xl animate-float" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-orange-500/20 rounded-full blur-xl animate-float-delayed" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Zen philosophy */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 observe-me opacity-0">
              <h2 className="text-4xl font-light text-slate-900 mb-6">
                {t("about.values.title")}
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
                {t("about.values.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <Card
                    key={value.id}
                    className="border-0 shadow-sm bg-white/80 backdrop-blur-sm observe-me opacity-0"
                    style={{ transitionDelay: `${index * 0.15}s` }}
                  >
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                        <Icon className="w-8 h-8 text-slate-600" />
                      </div>
                      <h3 className="text-2xl font-light text-slate-900 mb-4">
                        {value.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Meet the artisans */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 observe-me opacity-0">
              <h2 className="text-4xl font-light text-slate-900 mb-6">
                {t("about.team.title")}
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
                {t("about.team.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card
                  key={member.id}
                  className="group border-0 shadow-sm hover:shadow-xl transition-all duration-700 bg-white/80 observe-me opacity-0"
                  style={{
                    transitionDelay: `${index * 0.15}s`,
                    transform: index % 2 === 0 ? 'translateY(2rem)' : 'translateY(-2rem)'
                  }}
                >
                  <div className="relative">
                    <div className="relative h-80 overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="text-2xl font-light mb-1">{member.name}</h3>
                        <p className="text-white/80 text-sm">{member.role}</p>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <p className="text-slate-600 leading-relaxed mb-4 text-sm">
                        {member.bio}
                      </p>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-900">
                          {t("about.team.specialties")}:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {member.specialties.map((specialty, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement - Call to action */}
      <section className="py-20 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8 observe-me opacity-0">
            <h2 className="text-4xl lg:text-5xl font-light text-slate-900">
              {t("about.mission.title")}
            </h2>
            <p className="text-2xl text-slate-600 font-light leading-relaxed">
              {t("about.mission.description")}
            </p>

            <div className="pt-8 space-y-4">
              <Button
                size="lg"
                className="bg-slate-900 hover:bg-red-600 text-white px-12 py-4 text-lg font-light tracking-wide transition-all duration-300"
              >
                {t("about.mission.action")}
              </Button>
              <p className="text-sm text-slate-500">
                {t("about.mission.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .animate-fade-in-up {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}

export default function AboutPageClient() {
  return (
    <LanguageProvider>
      <AboutContent />
    </LanguageProvider>
  )
}