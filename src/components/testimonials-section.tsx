"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Quote, Star } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

export function EnhancedTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const { t } = useLanguage()

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 5,
      text: t("testimonials.reviews.sarah"),
      date: "2 weeks ago",
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 5,
      text: t("testimonials.reviews.michael"),
      date: "1 month ago",
    },
    {
      id: 3,
      name: "Emma Williams",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4,
      text: t("testimonials.reviews.emma"),
      date: "3 weeks ago",
    },
    {
      id: 4,
      name: "David Rodriguez",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 5,
      text: t("testimonials.reviews.david"),
      date: "2 days ago",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 bg-slate-50 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-radial from-amber-200/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-radial from-red-200/20 to-transparent rounded-full blur-3xl"></div>

      <div className="container relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <Quote className="h-8 w-8 text-red-500 rotate-180" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{t("testimonials.title")}</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">{t("testimonials.subtitle")}</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <Card className="border-none shadow-lg shadow-slate-200/50 bg-white">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-amber-300 mr-4">
                          <Image
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{testimonial.name}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4 mr-0.5",
                                  i < testimonial.rating ? "text-amber-400 fill-amber-400" : "text-slate-300",
                                )}
                              />
                            ))}
                            <span className="text-slate-500 text-sm ml-2">{testimonial.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-700 italic">"{testimonial.text}"</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2 w-2 mx-1 rounded-full transition-all",
                  activeIndex === index ? "bg-red-600 w-6" : "bg-slate-300 hover:bg-slate-400",
                )}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
