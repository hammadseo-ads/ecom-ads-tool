// import React from 'react';
import { ArrowLeft, TrendingUp, Target, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import  {Button}  from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageModal } from '@/components/ui/image-modal';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';


import SEO from '@/components/SEO';
const PJBoldPortfolio = () => {
  const navigate = useNavigate();
  // ./assets/lovable-uploads/5457ce9a-bdc8-4994-9e9f-80ba6bda34c6.png";

  const beforeImage = "/lovable-uploads/pjbold-before.png";
  const afterImage = "/lovable-uploads/pjbold-after.png";

  const challenges = [
    {
      title: "Policy Violations",
      description: "A major hurdle was numerous account violations, primarily flagged due to 'drug-related products.' This was a misclassification, as PJ BOLD sells food-grade molds, not THC-containing products, despite some molds having cannabis leaf shapes.",
      solution: "Worked closely with the client to gather the necessary documentation and evidence to demonstrate that their products are solely for food applications. Through persistent communication and proper submission, I successfully resolved these policy violations."
    },
    {
      title: "Disorganized Product Structure", 
      description: "The product feed and campaign structure were scattered, leading to inefficient targeting and wasted ad spend. Key products were not being prioritized or segmented correctly.",
      solution: "Undertook a comprehensive restructuring of their campaigns and product organization. Meticulously organized products into relevant asset groups, ensuring a clear and logical hierarchy for Google's algorithms."
    },
    {
      title: "High-Value Product Underperformance",
      description: "A significant issue was the under-targeting of a high-ticket item – a specific machine product. It was lumped together with lower-value molds, preventing it from receiving the dedicated attention and bidding strategy it required.",
      solution: "Implemented a specialized strategy for this high-value product. Created dedicated Performance Max (PMax) campaigns specifically designed to target and promote this expensive item."
    }
  ];

  const strategies = [
    "Ad Campaign Setup: Comprehensive setup and restructuring of Google Ads campaigns",
    "Keyword Optimization: Refined keyword targeting to improve relevance and performance", 
    "Landing Page Optimization: Reviewed and advised on landing page improvements for better conversion rates",
    "Budget & Bidding Strategy: Developed and executed effective budget allocation and bidding strategies",
    "Ad Copy Creation: Crafted engaging and compliant ad copy and assets",
    "Data Accuracy & Conversion Tracking: Ensured precise conversion tracking and data integrity"
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <SEO
        title="PJ BOLD Case Study — 9.32x Sales, 816% ROAS Lift"
        description="PJ BOLD case study: resolving Google Ads policy violations, restructuring Performance Max, and unlocking 9.32x sales growth on food-grade silicone molds."
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
              PJ BOLD Portfolio
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Achieving 9.32x Sales Increase with Strategic Google Ads Management - A Case Study in Overcoming Challenges and Maximizing ROAS
            </p>
          </div>

          {/* Results Cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            <Card className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-primary mb-2">9.32x</h3>
              <p className="text-muted-foreground">Increase in Sales</p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
              <Target className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-emerald-600 mb-2">816%</h3>
              <p className="text-muted-foreground">Increase in ROAS (Return on Ad Spend)</p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-blue-600 mb-2">62%</h3>
              <p className="text-muted-foreground">Improvement in Impressions Efficiency</p>
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
                PJ BOLD specializes in custom silicone molds for gummies, candies, and chocolates. They approached me to optimize their Google Ads campaigns and overcome significant account challenges.
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
                  alt="PJ BOLD Google Ads performance before optimization"
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
                  alt="PJ BOLD Google Ads performance after optimization"
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
          <div className="space-y-8">
            {challenges.map((challenge, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl mb-3">{challenge.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {challenge.description}
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-2">My Solution:</h4>
                      <p className="text-green-700">{challenge.solution}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Strategies */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Strategies Implemented</h2>
          <Card className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {strategies.map((strategy, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-muted-foreground">{strategy}</span>
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
            These results were achieved by structuring the campaigns and products in a way that was easier for Performance Max to understand and optimize, ensuring data accuracy and robust conversion tracking throughout. PJ BOLD's online advertising performance has been significantly boosted, setting them up for continued success and expansion.
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

export default PJBoldPortfolio;