
// import React from 'react';
import { useNavigate } from "react-router-dom";
import  {Button}  from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, DollarSign, Target, Users } from "lucide-react";
import PublicHeader from '@/components/PublicHeader';
// import Footer from '@/components/Footer';

const ProfitableProductsGuide = () => {
  const navigate = useNavigate();

  return (
    <>
      <PublicHeader />
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
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Profitable Products Guide</h1>
            </div>
          </div>

          {/* Hero Section */}
          <Card className="mb-8 bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl">💰 Maximize & Scale Your Champions</CardTitle>
              <CardDescription className="text-primary-foreground/90">
                These are your top performers with ROAS ≥ 3.0. Time to double down and dominate!
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Definition Recap */}
          <Card className="mb-8 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                Definition Recap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                These are your champions! Products with an ROAS (Return On Ad Spend) greater than 3.0, indicating excellent 
                returns for your advertising investment. They generate substantial sales with high efficiency.
              </p>
            </CardContent>
          </Card>

          {/* Strategic Approach */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6">Strategic Approach: Scale & Dominate</h2>
            
            <div className="space-y-6">
              {/* Aggressive Bidding & Budget Allocation */}
              <Card className="border-l-4 border-primary hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <DollarSign className="w-5 h-5 mr-2" />
                    💵 Aggressive Bidding & Budget Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    For these top performers, don't be afraid to increase bids (e.g., Target ROAS, Maximize Conversion Value 
                    strategies) and allocate a larger portion of your campaign budget. Your goal is to maximize their visibility 
                    across all relevant placements and search queries where they are profitable.
                  </p>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold text-primary mb-2">Example Action:</h4>
                    <p className="text-muted-foreground text-sm">
                      Increase Target ROAS by 5-10% or reallocate 20-30% of a less efficient campaign's budget to a campaign containing 
                      these profitable products.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Expand Reach & Diversify Ad Formats */}
              <Card className="border-l-4 border-emerald-500 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-emerald-600">
                    <Target className="w-5 h-5 mr-2" />
                    🎯 Expand Reach & Diversify Ad Formats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    If these products are primarily in Shopping Ads, ensure they have strong presence in Performance Max 
                    asset groups. Explore adding them to highly relevant Dynamic Search Ads or even targeted Display & 
                    YouTube remarketing campaigns.
                  </p>
                  <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-700 mb-2">Example Action:</h4>
                    <p className="text-emerald-600 text-sm">
                      Create a dedicated Performance Max asset group solely for your profitable products, featuring compelling visuals 
                      and strong calls to action.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Lifetime Value & Cross-Selling */}
              <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-600">
                    <Users className="w-5 h-5 mr-2" />
                    👥 Customer Lifetime Value (CLV) & Cross-Selling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    These products are attracting valuable customers. Use remarketing audiences built from visitors or 
                    converters of these profitable products to re-engage them. Cross-sell and up-sell related profitable 
                    products.
                  </p>
                  <div className="bg-purple-50/50 border border-purple-200/50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-700 mb-2">Example Action:</h4>
                    <p className="text-purple-600 text-sm">
                      Set up a Google Ads remarketing list for "Purchasers of Profitable Product A" and target them with ads for 
                      complementary profitable products.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Competitive Intelligence & Market Expansion */}
              <Card className="border-l-4 border-orange-500 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-orange-600">Competitive Intelligence & Market Expansion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Monitor competitor activity around these profitable products. Are they bidding higher? Are their offers 
                    different? Protect your brand terms. As performance stabilizes, consider expanding these products into 
                    new geographical markets or demographic segments.
                  </p>
                  <div className="bg-orange-50/50 border border-orange-200/50 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-700 mb-2">Example Action:</h4>
                    <p className="text-orange-600 text-sm">
                      Conduct a competitive keyword analysis for your profitable product keywords, ensuring your bids are competitive 
                      and you're capturing maximum impression share.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <Card className="text-center bg-primary/5 border border-primary/20 mb-8 hover:shadow-lg transition-all duration-300">
            <CardContent className="py-8">
              <h3 className="text-xl font-bold text-primary mb-4">Ready to Scale Your Winners?</h3>
              <p className="text-muted-foreground mb-6">
                Implement these strategies to maximize your profitable products' potential and dominate your market.
              </p>
              <Button 
                onClick={() => navigate(-1)}
                className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProfitableProductsGuide;
