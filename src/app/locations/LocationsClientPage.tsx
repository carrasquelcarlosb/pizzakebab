"use client"

import { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LanguageProvider, useLanguage } from "@/contexts/language-context"
import { MapPin, Phone, Clock, Navigation, Star, Car, Bike, Footprints } from "lucide-react"
import Link from "next/link"

interface Location {
  id: string
  nameKey: string
  address: string
  phone: string
  coordinates: { lat: number; lng: number }
  hours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  features: string[]
  rating: number
  deliveryTime: string
  isNew: boolean
  isBusy: boolean
}

const locationsData: Location[] = [
  {
    id: "location-1",
    nameKey: "locations.downtown.name",
    address: "123 Main Street, Downtown District",
    phone: "+1 (555) 123-4567",
    coordinates: { lat: 40.7128, lng: -74.0060 },
    hours: {
      monday: "11:00 - 23:00",
      tuesday: "11:00 - 23:00",
      wednesday: "11:00 - 23:00",
      thursday: "11:00 - 23:00",
      friday: "11:00 - 24:00",
      saturday: "11:00 - 24:00",
      sunday: "12:00 - 22:00"
    },
    features: ["Dine-in", "Takeaway", "Delivery", "WiFi", "Parking"],
    rating: 4.8,
    deliveryTime: "25-35 min",
    isNew: false,
    isBusy: true
  },
  {
    id: "location-2",
    nameKey: "locations.university.name",
    address: "456 College Ave, University Quarter",
    phone: "+1 (555) 234-5678",
    coordinates: { lat: 40.7589, lng: -73.9851 },
    hours: {
      monday: "12:00 - 24:00",
      tuesday: "12:00 - 24:00",
      wednesday: "12:00 - 24:00",
      thursday: "12:00 - 02:00",
      friday: "12:00 - 02:00",
      saturday: "12:00 - 02:00",
      sunday: "12:00 - 23:00"
    },
    features: ["Dine-in", "Takeaway", "Delivery", "WiFi", "Student Discounts"],
    rating: 4.6,
    deliveryTime: "20-30 min",
    isNew: true,
    isBusy: false
  },
  {
    id: "location-3",
    nameKey: "locations.suburb.name",
    address: "789 Oak Street, Riverside Suburb",
    phone: "+1 (555) 345-6789",
    coordinates: { lat: 40.6892, lng: -74.0445 },
    hours: {
      monday: "11:00 - 22:00",
      tuesday: "11:00 - 22:00",
      wednesday: "11:00 - 22:00",
      thursday: "11:00 - 22:00",
      friday: "11:00 - 23:00",
      saturday: "11:00 - 23:00",
      sunday: "12:00 - 21:00"
    },
    features: ["Dine-in", "Takeaway", "Delivery", "Drive-through", "Family Friendly"],
    rating: 4.7,
    deliveryTime: "30-40 min",
    isNew: false,
    isBusy: false
  }
]

function LocationsContent() {
  const { t } = useLanguage()
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  // Transform locations data with translated names
  const locations = locationsData.map(location => ({
    ...location,
    name: t(location.nameKey)
  }))

  const getCurrentDayHours = (hours: Location['hours']) => {
    const today = new Date().getDay()
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return hours[days[today] as keyof typeof hours]
  }

  const isOpenNow = (hours: Location['hours']) => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const todayHours = getCurrentDayHours(hours)

    if (!todayHours || todayHours === "Closed") return false

    const [openTime, closeTime] = todayHours.split(' - ')
    const [openHour, openMin] = openTime.split(':').map(Number)
    const [closeHour, closeMin] = closeTime.split(':').map(Number)

    const openMinutes = openHour * 60 + openMin
    const closeMinutes = closeHour * 60 + closeMin

    return currentTime >= openMinutes && currentTime <= closeMinutes
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

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-6xl lg:text-7xl font-light text-slate-900 tracking-tight">
              {t("locations.hero.title")}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 font-bold">
                {t("locations.hero.subtitle")}
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
              {t("locations.hero.description")}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Button variant="outline" className="flex items-center gap-2 px-6 py-3 rounded-full">
                <Navigation className="w-4 h-4" />
                {t("locations.actions.findNearest")}
              </Button>
              <Button variant="outline" className="flex items-center gap-2 px-6 py-3 rounded-full">
                <Car className="w-4 h-4" />
                {t("locations.actions.delivery")}
              </Button>
              <Button variant="outline" className="flex items-center gap-2 px-6 py-3 rounded-full">
                <Footprints className="w-4 h-4" />
                {t("locations.actions.pickup")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder - Minimalist approach */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="overflow-hidden border-0 shadow-sm">
              <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                <div className="text-center space-y-4">
                  <MapPin className="w-16 h-16 text-slate-400 mx-auto" />
                  <h3 className="text-2xl font-light text-slate-600">{t("locations.map.placeholder")}</h3>
                  <p className="text-slate-500">{t("locations.map.description")}</p>
                </div>

                {/* Location markers simulation */}
                {locations.map((location, index) => (
                  <div
                    key={location.id}
                    className={`absolute w-4 h-4 rounded-full cursor-pointer transition-all duration-300 ${selectedLocation === location.id
                        ? "bg-red-500 scale-150"
                        : "bg-blue-500 hover:scale-125"
                      }`}
                    style={{
                      left: `${20 + index * 25}%`,
                      top: `${30 + index * 15}%`
                    }}
                    onClick={() => setSelectedLocation(
                      selectedLocation === location.id ? null : location.id
                    )}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {locations.map((location, index) => (
                <Card
                  key={location.id}
                  className={`group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-700 animate-slide-up cursor-pointer ${selectedLocation === location.id ? "ring-2 ring-blue-500" : ""
                    }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedLocation(
                    selectedLocation === location.id ? null : location.id
                  )}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-light text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {location.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(location.rating)
                                    ? "text-yellow-400 fill-current"
                                    : "text-slate-200"
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-slate-500">({location.rating})</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {location.isNew && (
                          <Badge className="bg-green-500 text-white px-2 py-1 text-xs">
                            {t("locations.badges.new")}
                          </Badge>
                        )}
                        {location.isBusy && (
                          <Badge variant="outline" className="border-orange-500 text-orange-600 px-2 py-1 text-xs">
                            {t("locations.badges.busy")}
                          </Badge>
                        )}
                        <Badge
                          className={`px-2 py-1 text-xs ${isOpenNow(location.hours)
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {isOpenNow(location.hours) ? t("locations.status.open") : t("locations.status.closed")}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Address & Contact */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                        <span className="text-sm text-slate-600 leading-relaxed">{location.address}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <Link
                          href={`tel:${location.phone}`}
                          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {location.phone}
                        </Link>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-600">
                          {t("locations.today")}: {getCurrentDayHours(location.hours)}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {location.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Delivery Info */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bike className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            {t("locations.delivery")}
                          </span>
                        </div>
                        <span className="text-sm text-green-600 font-medium">
                          {location.deliveryTime}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-slate-900 hover:bg-blue-600 text-white font-light"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t("locations.actions.order")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t("locations.actions.directions")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div>
              <h2 className="text-4xl font-light text-slate-900 mb-6">{t("locations.service.title")}</h2>
              <p className="text-xl text-slate-600 leading-relaxed font-light">
                {t("locations.service.description")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-sm bg-white/80">
                <CardContent className="p-8 text-center">
                  <Car className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-light text-slate-900 mb-2">{t("locations.service.delivery.title")}</h3>
                  <p className="text-slate-600 text-sm">{t("locations.service.delivery.description")}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/80">
                <CardContent className="p-8 text-center">
                  <Footprints className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-light text-slate-900 mb-2">{t("locations.service.pickup.title")}</h3>
                  <p className="text-slate-600 text-sm">{t("locations.service.pickup.description")}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/80">
                <CardContent className="p-8 text-center">
                  <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-light text-slate-900 mb-2">{t("locations.service.dineIn.title")}</h3>
                  <p className="text-slate-600 text-sm">{t("locations.service.dineIn.description")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function LocationsPageClient() {
  return (
    <LanguageProvider>
      <LocationsContent />
    </LanguageProvider>
  )
}