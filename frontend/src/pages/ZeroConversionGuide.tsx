
// import React from 'react';
import { useNavigate } from "react-router-dom";
import  {Button}  from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, XCircle, Search, FileText, Target, Zap } from "lucide-react";
import PublicHeader from '@/components/PublicHeader';
// import Footer from '@/components/Footer';

const ZeroConversionGuide = () => {
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
              <XCircle className="w-4 h-4 text-primary-foreground" />
            </div>
              <h1 className="text-3xl font-bold text-foreground">Zero-Conversion Products Guide</h1>
            </div>
          </div>

          {/* Hero Section */}
          <Card className="mb-8 bg-gradient-to-r from-primary/60 to-emerald-500/60 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl">Stop the Bleeding: Fix or Pause</CardTitle>
              <CardDescription className="text-primary-foreground/90">
                Products spending money with 0 conversions. Time for immediate action.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Definition Recap */}
          <Card className="mb-8 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <XCircle className="w-5 h-5 mr-2 text-primary" />
                Definition Recap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Products with Total Cost {'>'}= $20 and 0 conversions, indicating they're spending money but delivering 
                no sales. These require immediate attention.
              </p>
            </CardContent>
          </Card>

        {/* Strategic Approach */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Strategic Approach: Immediate Damage Control</h2>
          
          <div className="space-y-6">
            {/* Immediate Pause or Dramatic Bid Reduction */}
            <Card className="border-l-4 border-primary hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Zap className="w-5 h-5 mr-2" />
                  Immediate Pause or Dramatic Bid Reduction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  These products are bleeding money with no return. Consider pausing them entirely or reducing bids by 
                  50-70% to minimize losses while you investigate.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Immediate Action:</h4>
                  <p className="text-muted-foreground text-sm">
                    Pause the worst performers immediately or reduce their max CPC by 70% to stop hemorrhaging budget 
                    while you analyze the issues.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Search Query Analysis */}
            <Card className="border-l-4 border-emerald-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-600">
                  <Search className="w-5 h-5 mr-2" />
                  Search Query Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Review what search terms are triggering your ads for these products. Are they relevant? Are people 
                  searching for something completely different than what you're selling?
                </p>
                <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-700 mb-2">Analysis Action:</h4>
                  <p className="text-emerald-600 text-sm">
                    Export search terms report for zero-conversion products and identify irrelevant queries to add as 
                    negative keywords.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Product Feed & Listing Quality Check */}
            <Card className="border-l-4 border-primary/70 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <FileText className="w-5 h-5 mr-2" />
                  Product Feed & Listing Quality Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Zero conversions often indicate fundamental issues with the product listing. Check for missing 
                  information, poor images, incorrect pricing, or policy violations.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Quality Check:</h4>
                  <p className="text-muted-foreground text-sm">
                    Review product titles, descriptions, images, and pricing in Google Merchant Center for zero-conversion 
                    products. Ensure all required fields are complete.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Competitive Analysis */}
            <Card className="border-l-4 border-emerald-600 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-700">
                  <Target className="w-5 h-5 mr-2" />
                  Competitive Analysis & Market Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Is there demand for this product? Are competitors advertising similar products successfully? Sometimes 
                  zero conversions indicate there's simply no market demand.
                </p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-700 mb-2">Market Check:</h4>
                  <p className="text-emerald-600 text-sm">
                    Research if competitors are advertising similar products and at what price points. Use Google Trends 
                    to validate search demand.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Emergency Checklist */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Emergency Action Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Pause or reduce bids by 70% immediately
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Review search terms and add negative keywords
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Check product feed quality and completeness
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Analyze competitor pricing and positioning
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Consider discontinuing if no viable fixes exist
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center bg-primary/5 border border-primary/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="py-8">
            <h3 className="text-xl font-bold text-primary mb-4">Act Fast to Stop the Bleeding</h3>
            <p className="text-muted-foreground mb-6">
              Zero-conversion products require immediate action. Don't let them drain your budget any longer.
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

export default ZeroConversionGuide;
