"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

export function EnhancedTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const { t } = useLanguage()

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 5,
      text: t("testimonials.reviews.sarah"),
      date: "2 weeks ago",
      location: "New York",
      verified: true,
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 5,
      text: t("testimonials.reviews.michael"),
      date: "1 month ago",
      location: "Los Angeles",
      verified: true,
    },
    {
      id: 3,
      name: "Emma Williams",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4,
      text: t("testimonials.reviews.emma"),
      date: "3 weeks ago",
      location: "Chicago",
      verified: true,
    },
    {
      id: 4,
      name: "David Rodriguez",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 5,
      text: t("testimonials.reviews.david"),
      date: "2 days ago",
      location: "Miami",
      verified: true,
    },
  ]

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const nextTestimonial = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-red-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-radial from-amber-200/30 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-radial from-red-200/30 to-transparent rounded-full blur-3xl animate-pulse" />

      <div className="container relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-amber-500 rounded-full blur-lg opacity-30 animate-pulse" />
            <Quote className="h-12 w-12 text-red-500 rotate-180 relative z-10" />
          </div>
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {t("testimonials.title")}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">{t("testimonials.subtitle")}</p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Navigation buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            onClick={nextTestimonial}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Testimonials carousel */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-8">
                  <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02]">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4">
                        {/* Google Reviews header */}
                        <div className="flex items-center gap-2 mb-4 w-full">
                          <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path
                              fill="#4285f4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34a853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#fbbc05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#ea4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          <span className="font-semibold text-gray-700">Google</span>
                          <div className="flex items-center ml-auto">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4 mr-0.5",
                                  i < testimonial.rating ? "text-amber-400 fill-amber-400" : "text-slate-300",
                                )}
                              />
                            ))}
                            <span className="text-sm text-gray-500 ml-2">{testimonial.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        {/* Avatar section */}
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-green-400 rounded-full blur-md opacity-50 animate-pulse" />
                          <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                            <Image
                              src={testimonial.avatar || "/placeholder.svg"}
                              alt={testimonial.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          {testimonial.verified && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Content section */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">{testimonial.location}</span>
                          </div>

                          <blockquote className="text-gray-700 leading-relaxed mb-3">{testimonial.text}</blockquote>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                />
                              </svg>
                              Helpful
                            </button>
                            <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                                />
                              </svg>
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-3 w-3 rounded-full transition-all duration-300",
                  activeIndex === index ? "bg-red-600 w-8 shadow-lg" : "bg-slate-300 hover:bg-slate-400",
                )}
                onClick={() => {
                  setActiveIndex(index)
                  setIsAutoPlaying(false)
                }}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play toggle */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="text-slate-500 hover:text-slate-700"
            >
              {isAutoPlaying ? "Pause" : "Play"} Auto-scroll
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
