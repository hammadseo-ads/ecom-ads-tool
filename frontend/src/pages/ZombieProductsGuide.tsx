
// import React from 'react';
import { useNavigate } from "react-router-dom";
import  {Button}  from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, CheckCircle, Target, AlertTriangle } from "lucide-react";
import PublicHeader from '@/components/PublicHeader';
import SEO from '@/components/SEO';
// import Footer from '@/components/Footer';

const ZombieProductsGuide = () => {
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/signup', { state: { from: '/dashboard' } });
    }
  };

  return (
    <>
      <PublicHeader />
      <SEO
        title="Zombie Products — Reactivate Low-Visibility Items"
        description="How to find and revive zombie products (low impressions, no sales) hiding in your Google Shopping and Performance Max feeds."
        ogType="article"
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4 hover:bg-muted transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3 shadow-lg">
              <Eye className="w-4 h-4 text-primary-foreground" />
            </div>
              <h1 className="text-3xl font-bold text-foreground">Zombie Products Guide</h1>
            </div>
          </div>

          {/* Hero Section */}
          <Card className="mb-8 bg-gradient-to-r from-primary/80 to-emerald-500/80 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl">🧟 Discover & Reactivate Hidden Gems</CardTitle>
              <CardDescription className="text-primary-foreground/90">
                Products with zero spend but present in campaigns. Time to wake up the sleeping giants.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Definition Recap */}
          <Card className="mb-8 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2 text-primary" />
                Definition Recap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Products with zero total cost (and typically very low impressions/clicks). These are products that Google Ads is 
                simply not spending on or showing. These could be hidden gems that just need a nudge.
              </p>
            </CardContent>
          </Card>

        {/* Strategic Approach */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Strategic Approach: Activation & Discovery</h2>
          
          <div className="space-y-6">
            {/* Unlocking Hidden Gems */}
            <Card className="border-l-4 border-primary hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Target className="w-5 h-5 mr-2" />
                  🔓 Unlocking Hidden Gems & Proactive Activation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The core idea is to allocate a small, dedicated budget to force spend on these products. They often 
                  represent neglected inventory. This strategy aligns with finding new "20% effort" items that could become 
                  your next "80% sales."
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Example Action:</h4>
                  <p className="text-muted-foreground text-sm">
                    Create a "Zombie Revival Campaign" or a specific asset group in Performance Max dedicated to these products, 
                    giving them minimum bids or specific asset groups to force visibility and see if they can generate any clicks or 
                    conversions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Product Feed Health Check */}
            <Card className="border-l-4 border-emerald-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  📋 Product Feed & Listing Health Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Zero spend often indicates issues in the Google Merchant Center feed. Check for disapproval statuses, 
                  missing attributes (e.g., GTIN, product type), or poor image quality.
                </p>
                <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-700 mb-2">Example Action:</h4>
                  <p className="text-emerald-600 text-sm">
                    Audit the Google Merchant Center feed health for all Zombie products; address any warnings or errors that limit 
                    their visibility.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Bidding Strategy Review */}
            <Card className="border-l-4 border-primary/70 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  🎯 Bidding Strategy & Structure Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Are these products stuck in an overly broad campaign with a budget being consumed by other items? Or 
                  are their bids too low to compete? Consider isolating them into dedicated ad groups.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Example Action:</h4>
                  <p className="text-muted-foreground text-sm">
                    If currently in a broad auto-bid campaign, move a sample set of Zombie products into a new, separate Standard 
                    Shopping campaign with manual CPC bids set at a slightly competitive level to test their initial engagement.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* External Demand Generation */}
            <Card className="border-l-4 border-emerald-600 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-emerald-700">External Demand Generation & Nurturing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If Google Ads isn't finding an audience, consider driving demand from other sources. Promote these 
                  products through social media, email marketing, or organic SEO efforts.
                </p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-700 mb-2">Example Action:</h4>
                  <p className="text-emerald-600 text-sm">
                    Feature a few Zombie products in your next email newsletter or social media post; monitor if this generates any 
                    organic search or direct traffic that then triggers Google Ads impressions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Zombie Revival Action Plan */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Zombie Revival Action Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Immediate Actions</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Check Merchant Center feed health
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Create dedicated revival campaign
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Set minimum competitive bids
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Allocate small test budget
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Long-term Strategy</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Monitor performance closely
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Promote via other channels
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Scale successful revivals
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Pause persistent non-performers
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center bg-primary/5 border border-primary/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="py-8">
            <h3 className="text-xl font-bold text-primary mb-4">Wake Up Your Sleeping Giants</h3>
            <p className="text-muted-foreground mb-6">
              Use these activation strategies to discover hidden profitable products that just need the right push.
            </p>
            <Button 
              onClick={handleDashboardClick}
              className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
};

export default ZombieProductsGuide;
