// import React from 'react';
import { TrendingUp, Target, Zap, ArrowRight, Building2 } from 'lucide-react';
import  {Button}  from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';

import SEO from '@/components/SEO';
const Portfolio = () => {
  const navigate = useNavigate();

  const portfolios = [
    {
      id: 'mygreen-scape',
      company: 'MyGreenScape',
      industry: 'Indoor Plants',
      slug: '/portfolio/mygreen-scape',
      description: 'Achieving 368% increase in conversion value with focused Google Ads optimization for a specialized indoor plants brand.',
      challenge: 'Small budgets, similar products confusing AI matching, underperforming Shopping campaigns.',
      results: [
        { metric: '368%', label: 'Increase in Conversion Value', icon: TrendingUp },
        { metric: '56%', label: 'Increase in ROAS', icon: Target },
        { metric: '213%', label: 'Increase in Impressions', icon: Zap }
      ],
      gradientFrom: 'from-green-500/10',
      gradientTo: 'to-emerald-500/5',
      borderColor: 'border-green-500/20',
      buttonColor: 'from-green-600 to-emerald-600'
    },
    {
      id: 'pj-bold',
      company: 'PJ BOLD',
      industry: 'Food-Grade Silicone Molds',
      slug: '/portfolio/pj-bold',
      description: 'Achieving 9.32x sales increase through strategic campaign restructuring and policy violation resolution.',
      challenge: 'Policy violations flagging products as drug-related, scattered product structure, high-value items underperforming.',
      results: [
        { metric: '9.32x', label: 'Increase in Sales', icon: TrendingUp },
        { metric: '816%', label: 'Increase in ROAS', icon: Target },
        { metric: '62%', label: 'Impressions Efficiency', icon: Zap }
      ],
      gradientFrom: 'from-green-500/10',
      gradientTo: 'to-emerald-500/5',
      borderColor: 'border-green-500/20',
      buttonColor: 'from-green-600 to-emerald-600'
    },
    {
      id: 'mathfel',
      company: 'Mathfel',
      industry: 'Video Door Intercom Systems',
      slug: '/portfolio/mathfel',
      description: 'Driving 114% sales increase through systematic campaign optimization and product categorization.',
      challenge: 'Scattered campaigns with product overlap, poor categorization, complex fragmented structure.',
      results: [
        { metric: '114%', label: 'Increase in Conversion Value', icon: TrendingUp },
        { metric: '109%', label: 'Rise in ROAS', icon: Target },
        { metric: '13.7%', label: 'CTR Improvement', icon: Zap }
      ],
      gradientFrom: 'from-green-500/10',
      gradientTo: 'to-emerald-500/5',
      borderColor: 'border-green-500/20',
      buttonColor: 'from-green-600 to-emerald-600'
    },
    {
      id: 'toptiny',
      company: 'TopTiny',
      industry: 'E-commerce',
      slug: '/portfolio/toptiny',
      description: 'Scaling sales to $67k/month & 9x ROAS from a new Google Ads account through data-driven growth and strategic optimization.',
      challenge: 'Poor performance despite 4 months of ad spend, almost no sales, unfocused campaigns, website structure hurdles.',
      results: [
        { metric: '$67k', label: 'Monthly Sales', icon: TrendingUp },
        { metric: '9x', label: 'ROAS Achievement', icon: Target },
        { metric: '150%', label: 'Conversion Rate Improvement', icon: Zap }
      ],
      gradientFrom: 'from-green-500/10',
      gradientTo: 'to-emerald-500/5',
      borderColor: 'border-green-500/20',
      buttonColor: 'from-green-600 to-emerald-600'
    }
  ];

  const leadGenPortfolios = [
    {
      id: 'tyretick',
      company: 'Tyretick',
      industry: '24/7 Mobile Tyre Fitting (UK)',
      slug: '/portfolio/tyretick',
      description: '392 qualified leads in 2 months for a 24/7 mobile tyre fitting service in London and the wider UK, with cost per lead cut by 39.9%.',
      challenge: 'Single ad-group bottleneck, irrelevant search traffic eating budget, flat 24-hour bid distribution, geo targeting bleeding outside service zones.',
      results: [
        { metric: '392', label: 'Qualified Leads in 2 Months', icon: TrendingUp },
        { metric: '3.40x', label: 'Return on Ad Spend', icon: Target },
        { metric: '39.9%', label: 'Reduction in Cost Per Lead', icon: Zap },
      ],
      gradientFrom: 'from-emerald-500/10',
      gradientTo: 'to-green-500/5',
      borderColor: 'border-emerald-500/20',
      buttonColor: 'from-emerald-600 to-green-600',
    },
    {
      id: 'cpa-moms',
      company: 'CPA MOMS',
      industry: 'US Virtual CPA Network',
      slug: '/portfolio/cpa-moms',
      description: '145 free-consultation leads in 9 months for a US national CPA franchise, with cost per lead cut from $174 to $57.49 across three reporting quarters.',
      challenge: 'Generic search drain, free consultation buried as a secondary CTA, flat audience targeting, spend distributed without time logic.',
      results: [
        { metric: '+62.9%', label: 'Increase in Qualified Leads', icon: TrendingUp },
        { metric: '67%', label: 'Reduction in Cost Per Lead', icon: Target },
        { metric: '3.51x', label: 'Conversion Rate Lift', icon: Zap },
      ],
      gradientFrom: 'from-emerald-500/10',
      gradientTo: 'to-green-500/5',
      borderColor: 'border-emerald-500/20',
      buttonColor: 'from-emerald-600 to-green-600',
    },
    {
      id: 'decor2sell',
      company: 'Decor2sell',
      industry: 'AU Home Staging & Decor',
      slug: '/portfolio/decor2sell',
      description: 'Cost per conversion cut 90% (from $256 to $25.11) for an Australian home-staging service through Performance Max optimisation and a full website redesign.',
      challenge: 'High initial CPL, PMax learning curve, suboptimal website design, persistent hacker attacks taking the site offline.',
      results: [
        { metric: '90%', label: 'Cost-Per-Conversion Reduction', icon: TrendingUp },
        { metric: '767%', label: 'Conversion Increase', icon: Target },
        { metric: '15%', label: 'Total Cost Reduction', icon: Zap },
      ],
      gradientFrom: 'from-emerald-500/10',
      gradientTo: 'to-green-500/5',
      borderColor: 'border-emerald-500/20',
      buttonColor: 'from-emerald-600 to-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <SEO
        title="Case Studies, eCommerce Google Ads Results"
        description="Real eCommerce case studies, MyGreenScape, PJ BOLD, Mathfel, TopTiny, with before/after Google Ads results, ROAS lifts, and the strategies used."
        ogType="website"
      />
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-background via-muted/30 to-primary/10">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 text-sm px-4 py-2">Client Success Stories</Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Case Studies
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Explore real case studies showing how strategic Google Ads management transformed businesses across different industries.
          </p>
        </div>
      </section>

      {/* Portfolio Grid, eCommerce */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
              eCommerce
            </span>
            <h2 className="text-2xl font-semibold text-gray-900">eCommerce Case Studies</h2>
          </div>
          <div className="grid gap-8">
            {portfolios.map((portfolio) => (
              <Card 
                key={portfolio.id}
                className={`p-8 hover:shadow-2xl transition-all duration-300 border-2 ${portfolio.borderColor} bg-gradient-to-br ${portfolio.gradientFrom} ${portfolio.gradientTo} hover:scale-[1.02] group`}
              >
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                  {/* Company Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <Building2 className="w-6 h-6 text-primary" />
                      <div>
                        <h2 className="text-2xl font-bold">{portfolio.company}</h2>
                        <p className="text-muted-foreground">{portfolio.industry}</p>
                      </div>
                    </div>
                    
                    <p className="text-lg mb-4 leading-relaxed">
                      {portfolio.description}
                    </p>
                    
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2 text-muted-foreground">Challenge:</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {portfolio.challenge}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={() => navigate(portfolio.slug)}
                      className={`bg-gradient-to-r ${portfolio.buttonColor} hover:opacity-90 group-hover:scale-105 transition-all duration-300`}
                    >
                      View Full Case Study
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  
                  {/* Results */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Results Achieved:</h3>
                    {portfolio.results.map((result, resultIndex) => (
                      <div 
                        key={resultIndex}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm"
                      >
                        <div className="p-2 rounded-full bg-primary/10">
                          <result.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-primary">{result.metric}</div>
                          <div className="text-sm text-muted-foreground">{result.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid, Lead Generation */}
      <section className="py-16 px-4 bg-emerald-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
              Lead Generation
            </span>
            <h2 className="text-2xl font-semibold text-gray-900">Lead Generation Case Studies</h2>
          </div>
          <div className="grid gap-8">
            {leadGenPortfolios.map((portfolio) => (
              <Card
                key={portfolio.id}
                className={`p-8 hover:shadow-2xl transition-all duration-300 border-2 ${portfolio.borderColor} bg-gradient-to-br ${portfolio.gradientFrom} ${portfolio.gradientTo} hover:scale-[1.02] group`}
              >
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <Building2 className="w-6 h-6 text-primary" />
                      <div>
                        <h2 className="text-2xl font-bold">{portfolio.company}</h2>
                        <p className="text-muted-foreground">{portfolio.industry}</p>
                      </div>
                    </div>
                    <p className="text-lg mb-4 leading-relaxed">{portfolio.description}</p>
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2 text-muted-foreground">Challenge:</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{portfolio.challenge}</p>
                    </div>
                    <Button
                      onClick={() => navigate(portfolio.slug)}
                      className={`bg-gradient-to-r ${portfolio.buttonColor} hover:opacity-90 group-hover:scale-105 transition-all duration-300`}
                    >
                      View Full Case Study
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Results Achieved:</h3>
                    {portfolio.results.map((result, resultIndex) => (
                      <div
                        key={resultIndex}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm"
                      >
                        <div className="p-2 rounded-full bg-primary/10">
                          <result.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-primary">{result.metric}</div>
                          <div className="text-sm text-muted-foreground">{result.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-emerald-500/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Achieve Similar Results?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            These success stories show what's possible with strategic Google Ads management. 
            Let's discuss how we can transform your business too.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
            >
              Start Your Success Story
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/google-ads-service')}
            >
              Learn About Our Service
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;