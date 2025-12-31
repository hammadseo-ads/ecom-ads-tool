// src/components/InsightsShowcase.tsx
// import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Eye } from "lucide-react";
import { ImageModal } from "@/components/ui/image-modal";

const InsightsShowcase = () => {
  const showcaseData = [
    {
      id: 1,
      headline: "Beyond Data: Get Actionable Recommendations",
      image: "/lovable-uploads/7b5d0b34-de21-447a-805b-d3d6ea0dcf6e.png", // Place your image in public/insights/
      callout: "Receive clear insights on your 'Profitable Budget' allocation, 'Budget Wasted' on underperforming products, and the vast potential of your 'Untapped Products.'",
      highlights: ["15.0% Profitable", "68.9% Wasted", "57.7% Untapped"],
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      id: 2,
      headline: "Your Products, Categorized for Profit",
      image: "/lovable-uploads/6d251a5e-5fcc-42c4-a3bd-62fc2d22ef0b.png",
      callout: "Instantly see how your products are truly performing across Profitable, Costly, Zero-Conversion, and Zombie categories. Understand your budget allocation at a glance.",
      highlights: ["Profitable: 7.91 ROAS", "Total: $7,804.70 Spend", "3220 Products Analyzed"],
      icon: <AlertTriangle className="w-6 h-6" />,
    },
    {
      id: 3,
      headline: "Deep Dive: Granular Product Performance Details",
      image: "/lovable-uploads/318c95cd-134c-4066-a3df-da5a7296c95c.png",
      callout: "Filter by campaign, sort by ROAS, and analyze individual product metrics. Every click, every cost, every conversion, laid bare.",
      highlights: ["Zero-Conversion Analysis", "Performance Max Campaigns", "Individual Product ROAS"],
      icon: <Eye className="w-6 h-6" />,
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-emerald-50/20 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            See Your Google Ads Results: Real Screenshots After Connection Below
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Go beyond vanity metrics. We turn your Google Ads data into clear visual reports that show wasted spend, 
              profit drivers, and test-ready products. Connect your account and compare results with screenshots below.
            </p>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Carousel
            className="w-full max-w-5xl mx-auto"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {showcaseData.map((slide) => (
                <CarouselItem key={slide.id}>
                  <Card className="border-gray-200 shadow-xl overflow-hidden bg-gradient-to-br from-white to-gray-50/30">
                    <CardContent className="p-0">
                      <div className="grid lg:grid-cols-2 gap-8 items-center">
                        {/* Text Content */}
                        <div className="p-8 lg:p-12">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center shadow-md">
                              {slide.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">
                              {slide.headline}
                            </h3>
                          </div>

                          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                            {slide.callout}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {slide.highlights.map((highlight, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 shadow-sm"
                              >
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Image Content */}
                        <div className="p-4 lg:p-8">
                          <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                            <ImageModal
                              src={slide.image}
                              alt={slide.headline}
                              className="w-full h-auto object-contain"
                              style={{ maxHeight: "400px" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="hidden lg:flex -left-12 shadow-lg" />
            <CarouselNext className="hidden lg:flex -right-12 shadow-lg" />
          </Carousel>

          {/* Mobile Dots */}
          <div className="flex justify-center mt-6 lg:hidden">
            <div className="flex space-x-2">
              {showcaseData.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-gray-300"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-lg">
            <p className="text-lg text-gray-800 font-medium mb-4">
              Ready to see your own Google Ads data transformed into actionable insights?
            </p>
            <p className="text-gray-600">
              Connect your Google Ads account and discover opportunities you never knew existed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsightsShowcase;