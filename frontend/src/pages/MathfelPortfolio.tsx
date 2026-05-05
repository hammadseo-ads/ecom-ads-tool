// import React from 'react';
import { ArrowLeft, TrendingUp, Target, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import  {Button}  from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageModal } from '@/components/ui/image-modal';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';

import SEO from '@/components/SEO';
const MathfelPortfolio = () => {
  const navigate = useNavigate();

  const beforeImage = "/lovable-uploads/f98890e1-3214-4382-9212-ecf6f2a2f131.png";
  const afterImage = "/lovable-uploads/8c4028f7-578f-4074-a480-7bc2da933083.png";

  const challenges = [
    {
      title: "Scattered & Redundant Campaigns",
      description: "The account suffered from a large number of campaigns with significant product overlap. A single product was frequently being sold across multiple, disparate campaigns, leading to internal competition and wasted ad spend."
    },
    {
      title: "Lack of Product Categorization", 
      description: "There was no proper categorization of products, and the custom label setup was either absent or ineffective. This made it difficult to manage bids, track performance, and optimize for profitability."
    },
    {
      title: "Extensive Data & Complexity",
      description: "The sheer volume of data and the intricate, fragmented campaign structure presented a considerable challenge, requiring a systematic and cautious approach to avoid negatively impacting live campaigns."
    }
  ];

  const solutions = [
    {
      title: "Deep Product Analysis & Profitability Identification",
      description: "My first step was a comprehensive analysis of all products within the account. I focused on identifying profitable products that generated the highest return and 'Zombie Products' with zero conversions or extremely low performance that were consuming budget without yielding results.",
      action: "This analysis allowed me to reallocate budget effectively, ensuring that ad spend was primarily directed towards the most profitable items, leading to an immediate improvement in ROAS."
    },
    {
      title: "Systematic Campaign Structure Optimization", 
      description: "Recognizing the sensitivity of Performance Max campaigns, I avoided sweeping changes. Instead, I implemented modifications incrementally over several months.",
      action: "I established a robust product categorization system, configured custom labels within the Merchant Center, systematically refined and optimized the campaign structure, consolidating overlapping efforts and ensuring each product was targeted efficiently without internal competition."
    }
  ];

  const services = [
    "Campaign Management & Optimization",
    "Audience Segmentation", 
    "Keyword Refinement",
    "Ad Copy Creation",
    "Budget & Bidding Optimization",
    "Detailed Product Analysis (Profitable vs. Zombie Products)",
    "Product Categorization & Custom Label Setup",
    "Merchant Center Campaigns Optimization",
    "Campaign Structure Optimization",
    "Conversion Setup & Verification"
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <SEO
        title="Mathfel Case Study, 114% Sales Increase"
        description="Mathfel video door-intercom case study: untangling scattered campaigns and confused product categorization to drive 114% sales growth on Google Ads."
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
              Mathfel Portfolio
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Driving 114% Sales Increase with Strategic Google Ads Optimization - A Case Study in Overcoming Challenges and Maximizing ROAS
            </p>
          </div>

          {/* Results Cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            <Card className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-primary mb-2">114%</h3>
              <p className="text-muted-foreground">Increase in Total Conversion Value</p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
              <Target className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-emerald-600 mb-2">109%</h3>
              <p className="text-muted-foreground">Rise in ROAS (Return on Ad Spend)</p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-blue-600 mb-2">13.7%</h3>
              <p className="text-muted-foreground">Improvement in CTR (Click-Through Rate)</p>
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
                Mathfel specializes in high-quality video door intercom systems. They sought to enhance their online advertising performance and expand their market reach through Google Ads.
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
                  alt="Mathfel Google Ads performance before optimization"
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
                  alt="Mathfel Google Ads performance after optimization"
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
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl mb-3">{challenge.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {challenge.description}
                    </p>
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
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl mb-3">{solution.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {solution.description}
                    </p>
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <strong>My Action:</strong> {solution.action}
                    </div>
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
            The methodical approach to product analysis, campaign restructuring, and continuous optimization proved instrumental in transforming Mathfel's Google Ads performance and setting them up for continued market expansion.
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

export default MathfelPortfolio;