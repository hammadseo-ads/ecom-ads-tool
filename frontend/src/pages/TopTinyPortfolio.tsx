// import React from 'react';
import { ArrowLeft, TrendingUp, Target, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import  {Button}  from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageModal } from '@/components/ui/image-modal';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';

import SEO from '@/components/SEO';
const TopTinyPortfolio = () => {
  const navigate = useNavigate();

  const beforeImage = "/lovable-uploads/cc006e3d-826d-4336-b314-c72725d9246a.png";
  const afterImage = "/lovable-uploads/46e6f842-7aa8-4445-8cdb-31157bc0cb2c.png";

  const challenges = [
    {
      title: "Product & Website Issues",
      description: "Products were listed separately even if they were just size/color variants, which confused shoppers. Titles were not optimized, making it harder for products to rank well in shopping placements. Navigation was cluttered, which limited conversions.",
      solution: "Consolidated all variants (size, color, style) into single product pages. Improved titles and product presentation. Streamlined collection pages to make browsing easier. This improved both user experience and Google Ads product feed quality, directly boosting conversion rates."
    },
    {
      title: "Advertising Inefficiency", 
      description: "Campaigns were spread thinly across too many categories. No clear testing system was in place to identify winning products. The account had almost no conversion history, which slowed Google Ads' learning process.",
      solution: "Launched a testing framework to identify winning products and placements. Set up multiple campaigns with asset groups focused on different placements including shopping, display, and search themes to see which products sold and which placements generated the best return."
    },
    {
      title: "Poor Performance Despite Ad Spend",
      description: "After four months of ad spend, the brand was struggling with poor performance. There were almost no sales, campaigns lacked focus, and the website structure created unnecessary hurdles for customers.",
      solution: "Built a foundation of reliable data for Google Ads to learn from. Restructured both the website and campaigns so that users could find products easily and the account could scale profitably."
    }
  ];

  const strategies = [
    "Product feed & catalog restructuring (variant consolidation, title optimization)",
    "Data-driven campaign testing (placements + product categories)",
    "Performance Max campaign structuring & training",
    "Conversion-focused budget allocation",
    "Gradual scaling across multiple product categories",
    "Continuous monitoring and optimization"
  ];

  const steps = [
    {
      title: "Step 1: Website & Product Page Organization",
      description: "The first move was to clean up the product catalog: Consolidated all variants (size, color, style) into single product pages. Improved titles and product presentation. Streamlined collection pages to make browsing easier."
    },
    {
      title: "Step 2: Initial Testing Phase (First 1.5 Months)",
      description: "I launched a testing framework to identify winning products and placements with campaigns focused on different placements like shopping, display, and search themes to see which products sold and which placements generated the best return."
    },
    {
      title: "Step 3: Focused Scaling on Winning Products",
      description: "Once testing identified a strong-performing product, I built a new campaign structure around it. Trained the campaign on that product until conversions became stable. Scaled the budget specifically into shopping placement and the winning product category."
    },
    {
      title: "Step 4: Category Expansion",
      description: "After the account had strong history and consistent sales in one category, gradually introduced additional categories using the same structured testing approach. Avoided spreading budget too thin; each new category was tested and trained before scaling."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <SEO
        title="TopTiny Case Study, Scaled to $67k/mo at 9x ROAS"
        description="TopTiny went from 4 months of zero sales to $67k/month at 9x ROAS through data-driven Google Ads restructuring. Full case study."
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
              TopTiny Portfolio
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Scaling Sales to $67k/month & 9x ROAS from a New Google Ads Account - A Case Study in Data-Driven Growth and Strategic Optimization
            </p>
          </div>

          {/* Results Cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            <Card className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-primary mb-2">$67k</h3>
              <p className="text-muted-foreground">Monthly Sales (August 2025)</p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
              <Target className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-emerald-600 mb-2">9x</h3>
              <p className="text-muted-foreground">ROAS (Return on Ad Spend)</p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-blue-600 mb-2">150%</h3>
              <p className="text-muted-foreground">Conversion Rate Improvement</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Project Overview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-2xl mb-4">Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed mb-6">
                When I took over the Google Ads account for TopTiny, the brand was struggling with poor performance despite four months of ad spend. There were almost no sales, campaigns lacked focus, and the website structure created unnecessary hurdles for customers.
              </p>
              <p className="text-lg leading-relaxed">
                The challenge was twofold: Build a foundation of reliable data for Google Ads to learn from, and restructure both the website and campaigns so that users could find products easily and the account could scale profitably.
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
                <CardTitle className="text-xl text-center mb-4">Before Results (February 2025)</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageModal 
                  src={beforeImage}
                  alt="TopTiny Google Ads performance before optimization - February 2025"
                  className="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-xl text-center mb-4">After Results (August 2025)</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageModal 
                  src={afterImage}
                  alt="TopTiny Google Ads performance after optimization - August 2025"
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

      {/* Strategy & Execution */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">My Strategy & Step-by-Step Execution</h2>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <Card key={index} className="p-6">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Current Results */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Current Results (August 2025)</h2>
          <Card className="p-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <h3 className="text-3xl font-bold text-primary mb-2">$67,809.39</h3>
                <p className="text-muted-foreground">Monthly Sales</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-emerald-600 mb-2">178</h3>
                <p className="text-muted-foreground">Orders</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-blue-600 mb-2">0.88%</h3>
                <p className="text-muted-foreground">Conversion Rate (up 150% vs July)</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-purple-600 mb-2">9x</h3>
                <p className="text-muted-foreground">ROAS</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Key Services */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Services Provided</h2>
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
          <div className="space-y-4 mb-8 text-lg leading-relaxed">
            <p>✓ Transformed a stagnant account into a profitable e-commerce engine.</p>
            <p>✓ Achieved $67k+ monthly sales within 6 months of account takeover.</p>
            <p>✓ Delivered a 9x ROAS, compared to the account's earlier ~1x ROAS.</p>
            <p>✓ Improved conversion rate by more than 150% after UX and campaign restructuring.</p>
            <p>✓ Built a system that allows sustainable scaling without wasted ad spend.</p>
          </div>
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

export default TopTinyPortfolio;