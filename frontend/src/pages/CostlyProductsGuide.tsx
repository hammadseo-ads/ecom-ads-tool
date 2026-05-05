
import { useNavigate } from "react-router-dom";
import  {Button}  from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle, Search, FileText, Globe, BarChart3 } from "lucide-react";
import PublicHeader from '@/components/PublicHeader';
import SEO from '@/components/SEO';
// import Footer from '@/components/Footer';

const CostlyProductsGuide = () => {
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    // Check if user is authenticated
    const token = localStorage.getItem("accessToken");
    if (token) {
      // User is authenticated, go directly to dashboard
      navigate('/dashboard');
    } else {
      // User not authenticated, redirect to signup first
      // After signup, they'll be redirected to dashboard automatically
      navigate('/signup', { state: { from: '/dashboard' } });
    }
  };

  return (
    <>
      <PublicHeader />
      <SEO
        title="Costly Products — Stop Budget-Drain in Google Ads"
        description="Identify products eating your Google Ads budget without delivering ROAS — and the exact fixes to apply for each pattern."
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
              <AlertTriangle className="w-4 h-4 text-primary-foreground" />
            </div>
              <h1 className="text-3xl font-bold text-foreground">Costly Products Guide</h1>
            </div>
          </div>

          {/* Hero Section */}
          <Card className="mb-8 bg-gradient-to-r from-primary/70 to-emerald-500/70 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl">Optimize or Prune Your Underperformers</CardTitle>
              <CardDescription className="text-primary-foreground/90">
                Products with ROAS between 0.0-3.0. Time to fix what's broken or cut your losses.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Definition Recap */}
          <Card className="mb-8 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
                Definition Recap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Products with an ROAS between 0 and 3.0 (but greater than 0) and a Total Cost over a certain threshold (e.g., {'>'}
                $20), indicating they're spending money but not delivering sufficient returns.
              </p>
            </CardContent>
          </Card>

        {/* Strategic Approach */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Strategic Approach: Efficiency & Quality Control</h2>
          
          <div className="space-y-6">
            {/* Deep Dive into Audience & Targeting */}
            <Card className="border-l-4 border-primary hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Search className="w-5 h-5 mr-2" />
                  Deep Dive into Audience & Targeting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Are you reaching the right people? Examine the demographics, interests, and locations of users who click 
                  on these ads but don't convert. Implement negative keywords to filter out irrelevant searches.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Example Action:</h4>
                  <p className="text-muted-foreground text-sm">
                    Review search terms for relevant campaigns and add broad negative keywords (e.g., "free," "review," "jobs") if they're 
                    triggering irrelevant clicks on costly products.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Optimize Product Listing */}
            <Card className="border-l-4 border-emerald-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-600">
                  <FileText className="w-5 h-5 mr-2" />
                  Optimize Product Listing & Feed Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Often, high cost with low ROAS points to an issue with the product itself or how it's presented. Review your 
                  Google Merchant Center feed for these specific products.
                </p>
                <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-700 mb-2">Example Action:</h4>
                  <p className="text-emerald-600 text-sm">
                    Rewrite product titles for costly items to be more specific, include keywords, and highlight unique selling 
                    propositions (USPs).
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Landing Page & User Experience Audit */}
            <Card className="border-l-4 border-primary/70 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Globe className="w-5 h-5 mr-2" />
                  Landing Page & User Experience Audit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Users are clicking, but not converting. This strongly indicates a problem after the click. Conduct a thorough 
                  audit of the product's landing page.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">Example Action:</h4>
                  <p className="text-muted-foreground text-sm">
                    Use Google PageSpeed Insights for the landing pages of costly products; if speed is poor, prioritize optimization. Test 
                    the checkout process.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Bid Adjustment or Strategic Pause */}
            <Card className="border-l-4 border-emerald-600 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-700">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Bid Adjustment or Strategic Pause
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If optimization efforts don't yield results, you need to reduce wasted spend. Lower bids significantly for 
                  these products. Consider moving them to campaigns with manual bidding strategies for more control.
                </p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-700 mb-2">Example Action:</h4>
                  <p className="text-emerald-600 text-sm">
                    Decrease max CPC bids by 20-30% for specific costly products, or place them into a separate campaign with a much 
                    lower daily budget for continued monitoring.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Optimization Checklist */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Quick Optimization Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Review and add negative keywords
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Audit product titles and descriptions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Check landing page speed and mobile experience
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Review pricing competitiveness
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  Lower bids or pause if no improvement
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center bg-primary/5 border border-primary/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="py-8">
            <h3 className="text-xl font-bold text-primary mb-4">Time to Optimize or Cut Losses</h3>
            <p className="text-muted-foreground mb-6">
              Use these strategies to turn your costly products into profitable ones, or reallocate budget to better performers.
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

export default CostlyProductsGuide;
