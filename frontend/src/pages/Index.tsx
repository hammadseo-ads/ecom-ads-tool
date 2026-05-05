// src/pages/Index.tsx
// import React from "react";
import  {Button}  from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext"; // YourMERN JWT auth
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Target,
  Eye,
  Zap,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Search,
  TrendingDown,
  Sparkles,
} from "lucide-react";

import PublicHeader from "@/components/PublicHeader";
import SEO from '@/components/SEO';
import Footer from "@/components/Footer";
import InsightsShowcase from "@/components/InsightsShowcase";

const Index = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been signed out of your account.",
    });
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
          <p className="text-gray-600 mb-6">You're already logged in.</p>
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PublicHeader />
      <SEO
        title="Google Ads Analysis Tool, Free"
        description="Free Google Ads analysis tool, connect your account and surface wasted spend, hidden winners, and PMax product performance."
        ogType="website"
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
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
                backgroundSize: "400% 400%",
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
                backgroundSize: "200% 200%",
              }}
            />
            <div
              className="absolute inset-0 animate-gradient-move opacity-30"
              style={{
                background: `linear-gradient(45deg, 
                  transparent 30%, 
                  rgba(34, 139, 34, 0.4) 50%, 
                  transparent 70%)`,
                backgroundSize: "200% 200%",
              }}
            />
          </div>

          {/* Floating Orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-15 animate-orb-float blur-xl"
              style={{
                background: "radial-gradient(circle, rgba(34, 139, 34, 0.3) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 animate-orb-float blur-xl"
              style={{
                background: "radial-gradient(circle, rgba(14, 75, 153, 0.3) 0%, transparent 70%)",
                animationDelay: "4s",
              }}
            />
          </div>

          <div className="relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="relative text-center mb-16">
                <div className="mb-6">
                  <span className="inline-block px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-sm font-medium hover:scale-105 transition-transform duration-200 shadow-2xl">
                    An E-commerce Ads Analysis Tool built by ManagingSEO
                  </span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-8 leading-tight animate-float drop-shadow-2xl">
                  Achieve 5 to 7+ ROAS with Google Ads:
                  <span className="block bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400 bg-clip-text text-transparent mt-2 drop-shadow-lg">
                    Stop Budget Waste & Invest in Profitable Products
                  </span>
                  <span className="block text-white mt-2 drop-shadow-2xl">for Your E-commerce Store</span>
                </h1>

                <div className="max-w-4xl mx-auto mb-12">
                  <p className="text-xl text-white/95 mb-8 leading-relaxed drop-shadow-lg">
                    Reveal the full potential of your Google Shopping and Performance Max campaigns.
                    Our insights tool helps you precisely identify:
                  </p>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 sm:p-6 border-2 hover:border-emerald-400/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15">
                      <div className="w-12 h-12 bg-emerald-400/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-3 mx-auto shadow-md group-hover:scale-110 transition-transform duration-200">
                        <Sparkles className="h-6 w-6 text-emerald-300" />
                      </div>
                      <h3 className="text-lg text-emerald-300 text-center">Your Profitable Products</h3>
                      <p className="text-base text-white/80 text-center mt-2">
                        Reveal which products are generating high sales and strong Return on Ad Spend (ROAS)
                      </p>
                    </div>

                    <div className="text-center p-4 sm:p-6 border-2 hover:border-red-400/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15">
                      <div className="w-12 h-12 bg-red-400/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-3 mx-auto shadow-md group-hover:scale-110 transition-transform duration-200">
                        <TrendingDown className="h-6 w-6 text-red-300" />
                      </div>
                      <h3 className="text-lg text-red-300 text-center">Your Wasted Spend</h3>
                      <p className="text-base text-white/80 text-center mt-2">
                        Pinpoint costly products consuming your budget without results (last 30, 60, or 90 days)
                      </p>
                    </div>

                    <div className="text-center p-4 sm:p-6 border-2 hover:border-blue-400/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15">
                      <div className="w-12 h-12 bg-blue-400/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-3 mx-auto shadow-md group-hover:scale-110 transition-transform duration-200">
                        <Eye className="h-6 w-6 text-blue-300" />
                      </div>
                      <h3 className="text-lg text-blue-300 text-center">Hidden Opportunities</h3>
                      <p className="text-base text-white/80 text-center mt-2">
                        Uncover 'Zombie' products, those with untapped potential where you're under-spending
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/30">
                    <p className="text-lg text-white font-medium leading-relaxed drop-shadow-sm">
                      By guiding you to stop wasting budget on underperforming items and strategically invest more in your high-impact products, 
                      we help you significantly boost your overall ad performance.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Link to="/signup">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    >
                      Start Free Analysis
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-4 border-white/40 text-black hover:bg-white/15 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Insights Showcase */}
        <InsightsShowcase />

        {/* Ad Type Focus */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-primary/5 to-emerald-500/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 shadow-lg hover:scale-105 transition-transform duration-200">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Laser-Focused Analysis for Maximum Impact
              </h2>
              <div className="max-w-4xl mx-auto">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Analyze granular data specifically within your <strong>Performance Max</strong> and <strong>Shopping ads</strong>.
                  Our ManagingSEO tool focuses on these two powerful campaign types to deliver the most relevant insights for your e-commerce strategy.
                </p>
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-primary/20 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                  <p className="text-primary font-medium">
                    <strong>Note:</strong> We do not calculate data for search ads - our specialization ensures deeper, more actionable insights for your product-based campaigns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 80/20 Rule */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 via-emerald-500/5 to-primary/5">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 shadow-lg hover:scale-105 transition-transform duration-200">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Embrace the 80/20 Rule in Marketing
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  <strong>80% of your sales often come from just 20% of your efforts.</strong> If your e-commerce store is generating sales from Shopping placements in Google Ads, this tool empowers you to find products that are generating profitable sales.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <p className="text-muted-foreground">Products with significantly higher ROAS, often exceeding <strong>4.0 ROAS</strong></p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <p className="text-muted-foreground">Strategic insights to invest more in high-performing products</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <p className="text-muted-foreground">Campaign optimization strategies to drive even greater sales</p>
                  </div>
                </div>
              </div>
              <div className="lg:pl-8">
                <div className="border-primary/20 shadow-xl bg-gradient-to-br from-background to-primary/5 hover:shadow-2xl transition-shadow duration-300 p-6 rounded-lg">
                  <h3 className="text-primary font-bold text-xl mb-4">High-Performance Example</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Product A ROAS:</span>
                      <span className="font-bold text-primary text-xl">5.2x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Revenue Generated:</span>
                      <span className="font-bold text-foreground">$15,600</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Ad Spend:</span>
                      <span className="font-bold text-foreground">$3,000</span>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-primary font-medium">
                        This is exactly the type of profitable product our tool helps you identify and scale.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Zombie Products Strategy */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-primary/5 to-emerald-500/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 shadow-lg hover:scale-105 transition-transform duration-200">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Reveal Hidden Potential: The "Zombie" Product Strategy
              </h2>
            </div>

            <div className="bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-2xl p-8 mb-8 shadow-lg border border-primary/10 hover:shadow-xl transition-shadow duration-300">
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                <strong>Don't overlook your 'Zombie' products!</strong> It's a critical point: if you have numerous products categorized as 'Zombie' within your campaigns (products where you're currently unable to spend effectively), you might be sitting on hidden gems.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group p-6 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform duration-200">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg text-primary font-semibold mb-2">Identify Hidden Gems</h3>
                  <p className="text-base text-muted-foreground">
                    Our tool helps you identify these diamonds in the rough within your Zombie product category.
                  </p>
                </div>

                <div className="border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group p-6 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform duration-200">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg text-primary font-semibold mb-2">Strategic Adjustments</h3>
                  <p className="text-base text-muted-foreground">
                    Strategically adjust your campaigns to increase spend on these underutilized products.
                  </p>
                </div>

                <div className="border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group p-6 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform duration-200">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg text-primary font-semibold mb-2">Boost Overall Sales</h3>
                  <p className="text-base text-muted-foreground">
                    Uncover new opportunities and significantly boost your store's overall sales performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Categories */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-emerald-50/20 to-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Understanding Your Product Performance Categories
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our tool categorizes your products into five distinct performance categories, each providing unique insights for optimization.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-xl transition-all duration-300 shadow-lg p-6 rounded-lg">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3 shadow-md">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl text-emerald-800 font-bold mb-2">Profitable Products</h3>
                <p className="text-base text-gray-700 mb-4">
                  Products generating high ROAS (e.g., ROAS &gt; 3), indicating excellent return on ad spend. These are your star performers.
                </p>
                <Link to="/guides/profitable-products">
                  <Button variant="outline" className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 w-full">
                    Learn How to Scale →
                  </Button>
                </Link>
              </div>

              <div className="border-red-200 bg-gradient-to-br from-white to-red-50/30 hover:shadow-xl transition-all duration-300 shadow-lg p-6 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3 shadow-md">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl text-red-800 font-bold mb-2">Costly Products</h3>
                <p className="text-base text-gray-700 mb-4">
                  Products with ROAS &lt; 1 and high cost (e.g., cost &gt; $20), consuming budget without sufficient returns. Immediate attention needed.
                </p>
                <Link to="/guides/costly-products">
                  <Button variant="outline" className="border-yellow-500 text-yellow-700 hover:bg-yellow-50 w-full">
                    Optimization Guide →
                  </Button>
                </Link>
              </div>

              <div className="border-orange-200 bg-gradient-to-br from-white to-orange-50/30 hover:shadow-xl transition-all duration-300 shadow-lg p-6 rounded-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 shadow-md">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl text-orange-800 font-bold mb-2">Zero-Conversion</h3>
                <p className="text-base text-gray-700 mb-4">
                  Products with clicks &gt; 0 but zero conversions, indicating engagement without desired action. Optimization opportunity.
                </p>
                <Link to="/guides/zero-conversion">
                  <Button variant="outline" className="border-red-500 text-red-700 hover:bg-red-50 w-full">
                    Diagnostic Guide →
                  </Button>
                </Link>
              </div>

              <div className="border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-xl transition-all duration-300 shadow-lg p-6 rounded-lg">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3 shadow-md">
                  <Eye className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl text-emerald-800 font-bold mb-2">Zombie Products</h3>
                <p className="text-base text-gray-700 mb-4">
                  Products with low clicks (&lt; 10) and low impressions (&lt; 50), suggesting minimal visibility or spend. Hidden potential awaits.
                </p>
                <Link to="/guides/zombie-products">
                  <Button variant="outline" className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 w-full">
                    Reactivation Guide →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-emerald-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Maximize Your Store's Full Potential?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of e-commerce entrepreneurs who are already optimizing their Google Ads campaigns with data-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/95 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  Start Your Free Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-black bg-white hover:bg-white/90 text-lg px-8 py-4 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Sign In to Your Account
                </Button>
              </Link>
            </div>
            <p className="text-white/80 mt-6 text-sm">
              No credit card required • Instant setup • Real-time insights
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Index;