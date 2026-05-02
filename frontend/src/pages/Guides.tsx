// import React from 'react';
import  {Button}  from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Search, Target, TrendingUp, FileText, DollarSign, AlertTriangle, XCircle, Eye, Layout } from "lucide-react";
import PublicHeader from '@/components/PublicHeader';

const guides = [
  {
    title: "Google Ads Audit Guide",
    description: "Comprehensive guide to auditing your Google Ads campaigns for optimal performance and identifying areas of improvement.",
    icon: Search,
    path: "/google-ads-audit-guide",
    color: "from-blue-500/10 to-blue-600/10",
    iconColor: "text-blue-500",
    borderColor: "border-blue-500/20 hover:border-blue-500/50"
  },
  {
    title: "Campaign Structure Guide",
    description: "Master the art of building high-performing Google Ads campaigns using our proven 9-step framework for e-commerce success.",
    icon: Target,
    path: "/campaign-structure-guide",
    color: "from-emerald-500/10 to-emerald-600/10",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/50"
  },
  {
    title: "Product Title Optimization Guide",
    description: "Learn how to craft compelling product titles that improve visibility, click-through rates, and conversion rates in Google Shopping.",
    icon: FileText,
    path: "/product-title-optimization-guide",
    color: "from-purple-500/10 to-purple-600/10",
    iconColor: "text-purple-500",
    borderColor: "border-purple-500/20 hover:border-purple-500/50"
  },
  {
    title: "Strategic Negative Keywords Guide",
    description: "Discover how to use negative keywords strategically to eliminate wasted ad spend and improve campaign efficiency.",
    icon: TrendingUp,
    path: "/strategic-negative-keywords-guide",
    color: "from-orange-500/10 to-orange-600/10",
    iconColor: "text-orange-500",
    borderColor: "border-orange-500/20 hover:border-orange-500/50"
  },
  {
    title: "Simple Google Ads Sales Formula",
    description: "Unlock the straightforward formula for driving consistent sales through Google Ads with actionable strategies and proven tactics.",
    icon: DollarSign,
    path: "/simple-google-ads-sales-formula",
    color: "from-green-500/10 to-green-600/10",
    iconColor: "text-green-500",
    borderColor: "border-green-500/20 hover:border-green-500/50"
  },
  {
    title: "Ecommerce Website CRO Audit",
    description: "A 7-section manual audit of your store from a real visitor's perspective — banners, search, pop ups, mobile menu, reviews, product gallery, and Instagram.",
    icon: Layout,
    path: "/guides/ecommerce-cro-audit",
    color: "from-emerald-500/10 to-emerald-600/10",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/50"
  },
  {
    title: "Negative Keywords & Product Titles Analysis",
    description: "3-part workflow: pull 30 days of search-term + product-title data from Google Ads, run them through our Claude skill, get back a negatives list and a title audit.",
    icon: TrendingUp,
    path: "/guides/negative-keywords-and-titles",
    color: "from-emerald-500/10 to-green-500/10",
    iconColor: "text-emerald-700",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/50"
  }
];

const productGuides = [
  {
    title: "Profitable Products",
    description: "Learn how to identify, scale, and maximize returns from your star-performing products with proven strategies.",
    icon: TrendingUp,
    path: "/guides/profitable-products",
    color: "from-emerald-500/10 to-emerald-600/10",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/50"
  },
  {
    title: "Costly Products",
    description: "Identify and optimize products draining your budget without sufficient returns to improve your ROAS.",
    icon: AlertTriangle,
    path: "/guides/costly-products",
    color: "from-yellow-500/10 to-yellow-600/10",
    iconColor: "text-yellow-500",
    borderColor: "border-yellow-500/20 hover:border-yellow-500/50"
  },
  {
    title: "Zero-Conversion Products",
    description: "Diagnose and fix products generating clicks but no conversions to stop wasting your ad budget.",
    icon: XCircle,
    path: "/guides/zero-conversion",
    color: "from-red-500/10 to-red-600/10",
    iconColor: "text-red-500",
    borderColor: "border-red-500/20 hover:border-red-500/50"
  },
  {
    title: "Zombie Products",
    description: "Discover hidden potential in low-visibility products and reactivate them for profitable performance.",
    icon: Eye,
    path: "/guides/zombie-products",
    color: "from-gray-500/10 to-gray-600/10",
    iconColor: "text-gray-500",
    borderColor: "border-gray-500/20 hover:border-gray-500/50"
  }
];

function Guides() {
  return (
    <>
      <PublicHeader />
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
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="max-w-6xl mx-auto text-center">
              <div className="mb-6">
                <span className="inline-block px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-sm font-medium hover:scale-105 transition-transform duration-200 shadow-2xl">
                  Expert Google Ads Resources
                </span>
              </div>
              
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mb-6 shadow-2xl hover:scale-105 transition-transform duration-200">
                <BookOpen className="h-10 w-10 text-emerald-300" />
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-8 leading-tight animate-float drop-shadow-2xl">
                Google Ads Guides
                <span className="block bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400 bg-clip-text text-transparent mt-2 drop-shadow-lg">Master Your E-commerce Advertising</span>
              </h1>
              
              <p className="text-xl text-white/95 mb-12 leading-relaxed drop-shadow-lg max-w-3xl mx-auto">
                Comprehensive guides and strategies to help you optimize your Google Ads campaigns, 
                eliminate wasted spend, and maximize your return on ad spend.
              </p>
            </div>
          </div>
        </section>

        {/* Campaign & Strategy Guides */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-primary/5 to-emerald-500/5">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-3">Campaign & Strategy Guides</h2>
              <p className="text-muted-foreground text-lg">Master the fundamentals of Google Ads campaign optimization and strategic planning.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guides.map((guide, index) => (
                <Link key={index} to={guide.path}>
                  <Card className={`h-full border-2 ${guide.borderColor} hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer bg-gradient-to-br ${guide.color}`}>
                    <CardHeader className="pb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${guide.color} border border-current/20 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                        <guide.icon className={`h-8 w-8 ${guide.iconColor}`} />
                      </div>
                      <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors duration-200">
                        {guide.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-muted-foreground mb-4 leading-relaxed">
                        {guide.description}
                      </CardDescription>
                      <Button 
                        variant="ghost" 
                        className="w-full group-hover:bg-primary/10 transition-colors duration-200"
                      >
                        Read Guide
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Product Performance Guides */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-500/5 via-background to-primary/5">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-3">Product Performance Guides</h2>
              <p className="text-muted-foreground text-lg">Optimize and manage products across different performance categories to maximize your ROI.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {productGuides.map((guide, index) => (
                <Link key={index} to={guide.path}>
                  <Card className={`h-full border-2 ${guide.borderColor} hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer bg-gradient-to-br ${guide.color}`}>
                    <CardHeader className="pb-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${guide.color} border border-current/20 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                        <guide.icon className={`h-7 w-7 ${guide.iconColor}`} />
                      </div>
                      <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors duration-200">
                        {guide.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {guide.description}
                      </CardDescription>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full group-hover:bg-primary/10 transition-colors duration-200"
                      >
                        Read Guide
                        <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 via-emerald-500/5 to-primary/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to Transform Your Google Ads Performance?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Start analyzing your campaigns today and discover which products are driving results 
              and which ones are wasting your budget.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Start Free Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

export default Guides;