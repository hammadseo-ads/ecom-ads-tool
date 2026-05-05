import { useState } from 'react';
import  {Button}  from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Target, Star, ShoppingCart, TrendingUp, BarChart3, CheckCircle, Eye, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import PublicHeader from '@/components/PublicHeader';
import SEO from '@/components/SEO';
// import Footer from '@/components/Footer';
import { ImageModal } from "@/components/ui/image-modal";

export default function SimpleGoogleAdsSalesFormula() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const screenshots = [
    {
      src: "/lovable-uploads/7b5d0b34-de21-447a-805b-d3d6ea0dcf6e.png",
      alt: "Beyond Data: Get Actionable Recommendations",
      title: "Beyond Data: Get Actionable Recommendations",
      description: "Receive clear insights on your 'Profitable Budget' allocation, 'Budget Wasted' on underperforming products, and the vast potential of your 'Untapped Products.' See how 15.0% Profitable, 68.9% Wasted, 57.7% Untapped breaks down your performance."
    },
    {
      src: "/lovable-uploads/6d251a5e-5fcc-42c4-a3bd-62fc2d22ef0b.png", 
      alt: "Your Products, Categorized for Profit",
      title: "Your Products, Categorized for Profit",
      description: "Instantly see how your products are truly performing across Profitable, Costly, Zero-Conversion, and Zombie categories. Understand your budget allocation at a glance with metrics like 7.91 ROAS, $7,804.70 Spend, and 3220 Products Analyzed."
    },
    {
      src: "/lovable-uploads/318c95cd-134c-4066-a3df-da5a7296c95c.png",
      alt: "Deep Dive: Granular Product Performance Details",
      title: "Deep Dive: Granular Product Performance Details", 
      description: "Filter by campaign, sort by ROAS, and analyze individual product metrics. Every click, every cost, every conversion, laid bare with Zero-Conversion Analysis, Performance Max Campaigns, and Individual Product ROAS data."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const howToSteps = [
    {
      step: 1,
      title: "Sign Up or Sign In",
      description: "Create your account or log in to get started with our Google Ads analysis tool",
      image: "/lovable-uploads/9aaf84eb-1d5b-4f00-b938-e005fa2baef9.png"
    },
    {
      step: 2,
      title: "Connect Google Ads",
      description: "Securely connect your Google Ads account to unlock powerful insights about your product performance",
      image: "/lovable-uploads/a05ecd08-0130-4ffb-ac93-dc19fd6ebb62.png"
    },
    {
      step: 3,
      title: "Select Your Account",
      description: "Choose which Google Ads account you want to analyze from your connected accounts",
      image: "/lovable-uploads/ee41faa4-6c10-411f-901a-e621d3fbc30d.png"
    },
    {
      step: 4,
      title: "Generate Reports",
      description: "Click the Generate Reports button to fetch data and see results for the last 30, 60, and 90 days",
      image: "/lovable-uploads/f3924e2d-79de-4cee-bd0e-18f19623ce67.png"
    }
  ];

  return (
    <>
      <PublicHeader />
      <SEO
        title="Simple Google Ads Sales Formula — 5-Step Boost"
        description="A 5-step formula to lift Google Ads sales without rebuilding your account from scratch. Practical, no-fluff playbook."
        ogType="article"
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
          {/* Moving Gradient Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gray-900" />
            <div 
              className="absolute inset-0 opacity-80"
              style={{
                background: `linear-gradient(135deg, 
                  #0a0a0a 0%, 
                  #1a2e1a 15%,
                  #0d2818 35%,
                  #164223 50%,
                  #1a5c2e 65%,
                  #0f2e1a 80%,
                  #0a0a0a 100%)`,
                backgroundSize: '400% 400%',
              }}
            />
            <div 
              className="absolute inset-0 animate-gradient-shift opacity-60"
              style={{
                background: `radial-gradient(circle at center, 
                  transparent 0%,
                  rgba(34, 139, 34, 0.2) 30%,
                  rgba(14, 75, 153, 0.3) 60%,
                  rgba(26, 26, 46, 0.8) 100%)`,
                backgroundSize: '200% 200%',
              }}
            />
            <div 
              className="absolute inset-0 animate-gradient-move opacity-30"
              style={{
                background: `linear-gradient(45deg, 
                  transparent 30%, 
                  rgba(34, 139, 34, 0.4) 50%, 
                  transparent 70%)`,
                backgroundSize: '200% 200%',
              }}
            />
          </div>

          {/* Floating Orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-15 animate-orb-float blur-xl"
              style={{
                background: 'radial-gradient(circle, rgba(34, 139, 34, 0.3) 0%, transparent 70%)',
              }}
            />
            <div 
              className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 animate-orb-float blur-xl"
              style={{
                background: 'radial-gradient(circle, rgba(14, 75, 153, 0.3) 0%, transparent 70%)',
                animationDelay: '4s',
              }}
            />
            <div 
              className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full opacity-12 animate-orb-float blur-xl"
              style={{
                background: 'radial-gradient(circle, rgba(46, 139, 87, 0.4) 0%, transparent 70%)',
                animationDelay: '8s',
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <div className="mb-6">
              <span className="inline-block px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-sm font-medium hover:scale-105 transition-transform duration-200 shadow-2xl">
                Simple Google Ads Sales Formula Guide
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-8 leading-tight animate-float drop-shadow-2xl">
              Simple 5-Step Formula to
              <span className="block bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400 bg-clip-text text-transparent mt-2 drop-shadow-lg">Boost Your Google Ads Sales</span>
            </h1>
            
            <p className="text-xl text-white/95 mb-12 leading-relaxed drop-shadow-lg max-w-4xl mx-auto">
              A concise, research-backed plan anyone can apply. No fluff, just actionable steps to maximize your Google Shopping and Performance Max campaign performance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-0">
                  Start Free Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Step 1: Identify Profitable Products */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-xl animate-pulse"></div>
                <div className="relative bg-white rounded-full p-4 shadow-lg">
                  <Search className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-sm font-semibold mb-4 shadow-lg">
                Step 1
              </div>
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Identify Your Best and Worst-Performing Products
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Begin by analyzing your Google Ads data to see which products are generating sales and which are not. 
                Focus on metrics like conversion value, ROAS, or number of purchases per product. This is crucial because 
                pouring budget into products that don't sell is wasteful, and you want to double-down on the proven winners.
              </p>
            </div>

            {/* Tool Screenshots Section */}
            <div className="mb-16">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  See Your Google Ads Results - Real Screenshots After Connection
                </h3>
                <p className="text-gray-600">
                  Our tool makes finding profitable products simple. Just connect your Google Ads account and let us do the analysis for you.
                </p>
              </div>

              {/* Image Slider */}
              <div className="relative max-w-4xl mx-auto">
                <div className="relative overflow-hidden rounded-xl shadow-2xl bg-white">
                  <ImageModal
                    src={screenshots[currentSlide].src}
                    alt={screenshots[currentSlide].alt}
                    className="w-full h-auto"
                  />
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-emerald-500 text-white p-2 rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-emerald-500 text-white p-2 rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  
                  {/* Slide Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {screenshots.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentSlide ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Slide Description */}
                <div className="mt-6 text-center">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {screenshots[currentSlide].title}
                  </h4>
                  <p className="text-gray-600">
                    {screenshots[currentSlide].description}
                  </p>
                </div>
              </div>
            </div>

            {/* How To Section */}
            <div className="py-16 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl">
              <div className="max-w-6xl mx-auto px-8">
                <div className="text-center mb-12">
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    How to Get Started in 4 Simple Steps
                  </h3>
                  <p className="text-gray-600">
                    The process is simple and takes just a few minutes to complete.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {howToSteps.map((step) => (
                    <Card key={step.step} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-emerald-100">
                      <CardHeader>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                            {step.step}
                          </div>
                          <CardTitle className="text-xl text-gray-900 flex-1">{step.title}</CardTitle>
                        </div>
                        <CardDescription className="text-gray-600 text-left">
                          {step.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="aspect-[16/10] bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                          <ImageModal
                            src={step.image}
                            alt={step.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-emerald-50 rounded-xl p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Action Items:</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Use Google Ads reports or Google Analytics e-commerce data to list products with high sales and those with little to none</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Apply the 80/20 rule: find the 20% of products driving 80% of results</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Separate the "winners" from the "losers" to set the stage for optimization</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Step 2: Segment by Category */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-xl animate-pulse"></div>
                <div className="relative bg-white rounded-full p-4 shadow-lg">
                  <Target className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-sm font-semibold mb-4 shadow-lg">
                Step 2
              </div>
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Segment Profitable Products by Category
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Take your profitable products and organize them into logical categories. Create separate campaigns 
                for each category to fine-tune bids and budgets. This structure prevents high-performing groups 
                from overshadowing others and aligns with how shoppers search.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Why Segmentation Works</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Prevents budget waste on mixed performance</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Allows category-specific bid strategies</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Aligns with customer search behavior</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Example Structure</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <Badge className="bg-emerald-500 text-white mb-2">Electronics Campaign</Badge>
                    <p className="text-sm text-gray-600">Smartphones, Laptops, Headphones</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <Badge className="bg-emerald-500 text-white mb-2">Clothing Campaign</Badge>
                    <p className="text-sm text-gray-600">Men's, Women's, Shoes</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-emerald-50 rounded-xl p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Action Items:</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Create new Shopping campaigns filtering for products in each major category</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Use labels or product type/category fields for organization</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Ensure each campaign targets a homogeneous set of products</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Step 3: Optimize Product Titles */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-xl animate-pulse"></div>
                <div className="relative bg-white rounded-full p-4 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-sm font-semibold mb-4 shadow-lg">
                Step 3
              </div>
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Optimize Product Titles in Your Merchant Feed
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Your product title is one of the most important factors in Google Shopping ad relevance. 
                A well-optimized title helps your products show up for the right searches and attracts users to click.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <Card className="p-6 shadow-lg">
                <h4 className="text-xl font-bold text-red-600 mb-4">❌ Poor Title Example</h4>
                <div className="p-4 bg-red-50 rounded-lg mb-4">
                  <p className="text-gray-700 font-mono">"Wireless Earbuds Model X"</p>
                </div>
                <p className="text-gray-600 text-sm">Generic, missing key attributes, doesn't help with search relevance</p>
              </Card>

                <Card className="p-6 shadow-lg">
                <h4 className="text-xl font-bold text-emerald-600 mb-4">✅ Optimized Title Example</h4>
                <div className="p-4 bg-emerald-50 rounded-lg mb-4">
                  <p className="text-gray-700 font-mono">"Wireless Earbuds – Noise Cancelling Bluetooth Headphones Brand X"</p>
                </div>
                <p className="text-gray-600 text-sm">Includes features, searchable keywords, and brand at the end</p>
              </Card>
            </div>

            <div className="bg-emerald-50 rounded-xl p-8 mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Proven Results:</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">+18%</div>
                  <p className="text-gray-700">CTR Improvement</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">+94%</div>
                  <p className="text-gray-700">Conversion Increase</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">150</div>
                  <p className="text-gray-700">Character Limit</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-xl p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Action Items:</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Audit your feed's product titles following Google's best practices</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Put important details first, use up to 150 characters</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Include attributes like color/size if relevant</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Step 4: Product Reviews */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-xl animate-pulse"></div>
                <div className="relative bg-white rounded-full p-4 shadow-lg">
                  <Star className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-sm font-semibold mb-4 shadow-lg">
                Step 4
              </div>
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Include Product Reviews (Star Ratings)
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Enable product ratings on your Shopping ads by submitting customer reviews to Google Merchant Center. 
                Those star ratings build immediate trust and significantly boost performance.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <Card className="p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Why Reviews Matter</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Star className="h-6 w-6 text-yellow-500" />
                    <span className="text-gray-700">+17% higher click-through rates</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                    <span className="text-gray-700">Improved Quality Score</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Eye className="h-6 w-6 text-blue-600" />
                    <span className="text-gray-700">Enhanced ad visibility</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Requirements</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Minimum 50 reviews across products</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Upload reviews feed to Merchant Center</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Google approval process</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-emerald-50 rounded-xl p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Action Items:</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Set up customer review collection system</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Submit reviews to Google Merchant Center Product Reviews</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Monitor for approval and star rating display</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Step 5: Add Promotions */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-xl animate-pulse"></div>
                <div className="relative bg-white rounded-full p-4 shadow-lg">
                  <Zap className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-sm font-semibold mb-4 shadow-lg">
                Step 5
              </div>
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Add Promotions (Special Offers)
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Leverage Google Merchant Center's promotions feature to make your ads more eye-catching. 
                Show "Special offer" badges to create urgency and increase click-through rates.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <Card className="p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Promotion Impact</h4>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600 mb-2">45%</div>
                    <p className="text-gray-700">of shoppers say deals influence purchases</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600 mb-2">8-10%</div>
                    <p className="text-gray-700">CTR lift with promotions</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600 mb-2">18%</div>
                    <p className="text-gray-700">conversion rate boost</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Promotion Types</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Badge className="bg-emerald-500 text-white mb-2">Percentage Off</Badge>
                    <p className="text-sm text-gray-600">"15% off all items"</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Badge className="bg-emerald-500 text-white mb-2">Free Shipping</Badge>
                    <p className="text-sm text-gray-600">"Free shipping on orders over $50"</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Badge className="bg-emerald-500 text-white mb-2">Buy One Get One</Badge>
                    <p className="text-sm text-gray-600">"BOGO 50% off"</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-emerald-50 rounded-xl p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Action Items:</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Decide on a compelling offer you can afford to provide</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Use Merchant Center's Promotions tool to create promotion</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Monitor for approval and "Special offer" link display</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Bonus Tip */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-xl animate-pulse"></div>
                <div className="relative bg-white rounded-full p-4 shadow-lg">
                  <ShoppingCart className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-sm font-semibold mb-4 shadow-lg">
                Bonus Tip
              </div>
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Use High-Impact Images
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                The product photo is the first thing users see in a Shopping ad. Ensure your image stands out 
                among competitors with high-quality, clear images that catch the eye.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Image Requirements</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Plain white background recommended</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Minimum 800x800 pixels for optimal display</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Product should fill 75-90% of image frame</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Competitive Analysis</h4>
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2"><strong>Research:</strong> Search for your product keywords</p>
                    <p className="text-xs text-gray-600">See what images competitors use</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2"><strong>Differentiate:</strong> Stand out with unique angles</p>
                    <p className="text-xs text-gray-600">While meeting Google guidelines</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-emerald-50 rounded-xl p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Action Items:</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Audit current product images for quality and compliance</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Research competitor images for differentiation opportunities</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Update images to be bright, professional, and product-focused</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
          {/* Moving Gradient Background - Match homepage */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gray-900" />
            <div 
              className="absolute inset-0 opacity-80"
              style={{
                background: `linear-gradient(135deg, 
                  #0a0a0a 0%, 
                  #1a2e1a 15%,
                  #0d2818 35%,
                  #164223 50%,
                  #1a5c2e 65%,
                  #0f2e1a 80%,
                  #0a0a0a 100%)`,
                backgroundSize: '400% 400%',
              }}
            />
            <div 
              className="absolute inset-0 animate-gradient-shift opacity-60"
              style={{
                background: `radial-gradient(circle at center, 
                  transparent 0%,
                  rgba(34, 139, 34, 0.2) 30%,
                  rgba(14, 75, 153, 0.3) 60%,
                  rgba(26, 26, 46, 0.8) 100%)`,
                backgroundSize: '200% 200%',
              }}
            />
            <div 
              className="absolute inset-0 animate-gradient-move opacity-30"
              style={{
                background: `linear-gradient(45deg, 
                  transparent 30%, 
                  rgba(34, 139, 34, 0.4) 50%, 
                  transparent 70%)`,
                backgroundSize: '200% 200%',
              }}
            />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">
              Ready to Apply These Strategies?
            </h2>
            <p className="text-xl text-white/95 mb-8 leading-relaxed drop-shadow-lg">
              Start implementing these proven strategies today and see the difference in your Google Ads performance. 
              Our tool makes it easy to identify your profitable products and optimize accordingly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-0">
                  Start Your Free Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/google-ads-service">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/40 text-gray-900 bg-white/90 hover:bg-white hover:text-gray-900 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200">
                  Learn More About Our Service
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}