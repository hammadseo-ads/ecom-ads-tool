// import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Target, Zap, CheckCircle } from 'lucide-react';
import  {Button}  from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageModal } from "@/components/ui/image-modal";
import { useNavigate } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';

import SEO from '@/components/SEO';
const MyGreenScapePortfolio = () => {
  const navigate = useNavigate();

  const beforeImage = "/lovable-uploads/mygreenscape-before.png";
  const afterImage = "/lovable-uploads/mygreenscape-after.png";

  const challenges = [
    "Small Ad Spend with Diverse Products",
    "Product Similarity & AI Understanding", 
    "Underperforming Shopping Campaigns",
    "Broad Keyword Targeting"
  ];

  const solutions = [
    "Prioritizing Profitable Products (Small Budget Optimization)",
    "Leveraging Performance Max (PMax) for Targeted Product Groups",
    "Optimizing Dynamic Search Ads (DSA) for Category-Level Demand",
    "Data-Driven Optimization & Continuous Improvement"
  ];

  const services = [
    "Ad Campaign Setup (Performance Max, Search, DSA)",
    "Budget & Bidding Strategy (optimized for small ad spend)",
    "Retargeting Strategy",
    "Keyword Optimization (focused on converting terms)",
    "Audience Segmentation",
    "In-depth Product Demand Analysis",
    "Strategic Use of Performance Max Asset Groups",
    "Dynamic Search Ad Optimization"
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <SEO
        title="MyGreenScape Case Study, 368% Conv Value, 56% ROAS Lift"
        description="How a small-budget indoor-plants brand went from underperforming Shopping campaigns to 368% conversion-value growth and a 56% ROAS lift via Performance Max + DSA."
        ogType="article"
      />
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-background via-muted/30 to-primary/10">
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate('/google-ads-service')}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Google Ads Service
          </Button>
          
          <div className="text-center mb-12">
            <Badge className="mb-4 text-sm px-3 py-1">Case Study</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              MyGreenScape Portfolio
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Achieving 368% Increase in Conversion Value with Focused Google Ads - A Case Study in Overcoming Challenges and Maximizing ROAS
            </p>
          </div>

          {/* Results Cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            <Card className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-primary mb-2">368%</h3>
              <p className="text-muted-foreground">Increase in Total Conversion Value</p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
              <Target className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-emerald-600 mb-2">56%</h3>
              <p className="text-muted-foreground">Increase in ROAS (Return on Ad Spend)</p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-blue-600 mb-2">213%</h3>
              <p className="text-muted-foreground">Increase in Impressions</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Client Background */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-2xl mb-4">Client Background</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">
                MyGreenScape is a brand specializing in indoor plants. They aimed to grow their sales and online presence through Google Ads, facing unique challenges due to their product nature and budget constraints.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Before/After Results */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Before & After Results</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-xl text-center mb-4">Before Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageModal 
                  src={beforeImage}
                  alt="MyGreenScape Google Ads performance before optimization"
                  className="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-xl text-center mb-4">After Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageModal 
                  src={afterImage}
                  alt="MyGreenScape Google Ads performance after optimization"
                  className="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Initial Challenges */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Initial Challenges & My Approach</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {challenges.map((challenge, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{challenge}</h3>
                    {index === 0 && (
                      <p className="text-muted-foreground">
                        The ad budget was very small, making it challenging to effectively test and scale campaigns across a vast catalog of indoor plants.
                      </p>
                    )}
                    {index === 1 && (
                      <p className="text-muted-foreground">
                        Plants, while distinct, often appear very similar to Google's AI. This made it difficult for shopping campaigns to accurately match user queries to the most relevant products.
                      </p>
                    )}
                    {index === 2 && (
                      <p className="text-muted-foreground">
                        Due to the product similarity and budget constraints, existing shopping campaigns were not performing effectively, often going "out of the way" and failing to deliver conversions.
                      </p>
                    )}
                    {index === 3 && (
                      <p className="text-muted-foreground">
                        While there were broad category keywords (e.g., "online plants Canada"), it was challenging to connect these general searches to specific, high-converting products within a limited budget.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Solutions */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">My Strategic Solutions & Implementation</h2>
          <div className="space-y-8">
            {solutions.map((solution, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-4">{solution}</h3>
                    {index === 0 && (
                      <div>
                        <p className="text-muted-foreground mb-3">
                          Instead of spreading the small budget thin across all products via shopping campaigns, my first step was to identify the specific plants that were already in demand and showing conversion potential.
                        </p>
                        <div className="bg-primary/5 p-4 rounded-lg">
                          <strong>My Action:</strong> This involved an in-depth analysis to pinpoint these "in-demand" products. Once identified, I shifted the focus to allocate the majority of the limited budget to these proven performers.
                        </div>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="bg-primary/5 p-4 rounded-lg">
                        <strong>My Action:</strong> I strategically utilized Performance Max campaigns. Instead of relying on traditional shopping campaigns that struggled with product similarity, I created specific asset groups within PMax campaigns. Each asset group was meticulously built around a select cluster of these high-demand, profitable products.
                      </div>
                    )}
                    {index === 2 && (
                      <div className="bg-primary/5 p-4 rounded-lg">
                        <strong>My Action:</strong> For broad, category-level keywords that were not product-specific (e.g., "online plants Canada"), I implemented and refined Dynamic Search Ads (DSA). This allowed us to capture relevant search traffic without manually managing an exhaustive list of individual plant keywords.
                      </div>
                    )}
                    {index === 3 && (
                      <div className="bg-primary/5 p-4 rounded-lg">
                        <strong>My Action:</strong> I continuously monitored performance, ensuring that both Search and Performance Max campaigns focused exclusively on keywords and products that were actively generating sales. This data-driven approach allowed for daily, weekly, and monthly adjustments.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Provided */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Services Provided</h2>
          <Card className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-muted-foreground">{service}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Impact Summary */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-emerald-500/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Results & Impact</h2>
          <p className="text-lg leading-relaxed mb-8">
            My strategic approach enabled MyGreenScape to significantly improve its online presence, drive consistent sales growth, and is now positioned for even greater success.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/contact')}
            className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
          >
            Get Similar Results for Your Business
          </Button>
        </div>
      </section>
    </div>
  );
};

export default MyGreenScapePortfolio;