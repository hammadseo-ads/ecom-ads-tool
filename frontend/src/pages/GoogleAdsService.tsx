import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent,  CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PublicHeader from '@/components/PublicHeader';
import SEO from '@/components/SEO';
// import Footer from '@/components/Footer';
import {
  Target,
  TrendingUp,
  Shield,
  BarChart3,
  Search,
  Zap,
  CheckCircle,
  ArrowRight,
  
  Quote,
  Calendar,
  ExternalLink,
  
  X,
  Eye,
  AlertTriangle,
  DollarSign,
  PieChart,
  Users
} from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useNavigate } from 'react-router-dom';


const GoogleAdsService = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Sticky header scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const calendlyUrl = "https://calendly.com/managingseo-hammad/client-management-and-meetings";
  const toolSignInUrl = "#tool-signin"; // Placeholder for tool sign-in

  // Analytics tracking function
  const trackEvent = (eventName: string, label: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        cta_label: label
      });
    }
  };

  const trustMetrics = [
    { metric: "7× sales", detail: "in a 60-day window (PJ BOLD)" },
    { metric: "ROAS up to 4.5× – 6×", detail: "after rebuilds (case studies below)" },
    { metric: "35–60% waste reduced", detail: "by fixing search terms, feed & structure" },
    { metric: "Tracking cleaned", detail: "server-side + GA4/Ads parity, no more blind spend" }
  ];

  const systemSteps = [
    {
      number: "1",
      title: "Wasted Budget Finder",
      subtitle: "(Quick Scan – your tool)",
      icon: AlertTriangle,
      description: "A fast, plain-English overview that shows where spend is being wasted, which products already earn profit, and which 'zombie' products deserve structured tests.",
      purpose: "Start the conversation with clear, easy wins. Not a full audit."
    },
    {
      number: "2",
      title: "Deep Product & Profit Analysis",
      subtitle: "(Real Audit)",
      icon: PieChart,
      description: "Segment by margin, AOV, LTV, stock velocity. Map products to custom labels: Hero / Probe / Protect / Seasonal / High-ticket. Build a ruleset for bids, budgets, and tests tied to contribution margin (not vanity ROAS)."
    },
    {
      number: "3",
      title: "Account Rebuild & Growth Loop",
      icon: TrendingUp,
      description: "Feed & GMC: attributes, titles, GTIN, rules, policy fixes. Structure: PMax by product cluster, Search for high-intent queries, DSA for catalog gaps. Queries & Negatives: query mining, n-gram analysis, shared negative libs. Bidding: tROAS/tCPA by lifecycle, seasonality + budget pacing.",
      outcome: "Lower CPA, higher CVR, higher profitable spend, predictable month-over-month revenue."
    }
  ];

  const processSteps = [
    { step: "Quick Scan", description: "fast pulse on waste & easy wins" },
    { step: "Full Audit", description: "feed, structure, queries, tracking, profit model" },
    { step: "Rebuild", description: "PMax + Search + DSA aligned to product clusters" },
    { step: "Scale", description: "push proven items, probe new ones, cap waste" },
    { step: "Ongoing", description: "weekly trims, monthly strategy, quarterly expansions" }
  ];

  const first30DaysPlan = [
    {
      week: "Week 1",
      title: "Triage & Setup",
      description: "Tracking parity (Ads ↔ GA4), feed quick fixes, brand-safety lists, immediate negatives, cap outliers, confirm profit model."
    },
    {
      week: "Week 2",
      title: "Cost-Cut Rollout",
      description: "Query mining + shared negatives, budget reallocation to winners, label taxonomy (Hero / Probe / Protect / Seasonal / High-ticket), restructure core campaigns."
    },
    {
      week: "Week 3",
      title: "Rebuild & Tests",
      description: "PMax by product clusters, Search for high-intent groups, DSA for gaps, new assets/copy per cluster, guardrails on bids/targets."
    },
    {
      week: "Week 4",
      title: "Scale & Plan",
      description: "Verify lift vs baseline, scale winners, lock next-month tests and promos."
    }
  ];

  const winMetrics = [
    {
      title: "Wasted spend down",
      description: "vs baseline by the agreed %",
      icon: TrendingUp
    },
    {
      title: "CPA down or ROAS up",
      description: "on top products at equal or higher spend",
      icon: DollarSign
    },
    {
      title: "More budget on winners",
      description: "share of spend shifts to proven items",
      icon: Target
    }
  ];

  const caseStudies = [
    {
      company: "PJ BOLD",
      industry: "Food-grade molds",
      challenge: "Policy flags, messy product structure, high-value item buried.",
      work: "Policy clean-up, custom labels, PMax by cluster, high-ticket isolation, tracking fix.",
      results: ["7× sales", "ROAS +694%", "Impression efficiency +62%"],
      beforeImage: "/lovable-uploads/5457ce9a-bdc8-4994-9e9f-80ba6bda34c6.png",
      afterImage: "/lovable-uploads/6a11b21e-8290-4f79-8859-e72052619447.png"
    },
    {
      company: "MyGreenScape",
      industry: "Indoor plants",
      challenge: "Tiny budgets, similar products confusing matching, underperforming Shopping.",
      work: "Profitable product focus, PMax asset groups, DSA for category demand, daily trims.",
      results: ["+195% conversion value", "ROAS up to 4.53×", "CTR efficiency +46.3%"],
      beforeImage: "/lovable-uploads/fa263e24-7677-43ef-9c35-78ce9b2e3828.png",
      afterImage: "/lovable-uploads/bb5d5eb8-7e46-4dba-923b-1e752d194567.png"
    },
    {
      company: "Mathfel",
      industry: "Video door intercoms",
      challenge: "Scattered campaigns, overlap, weak categorization, tracking gaps.",
      work: "Product taxonomy, consolidation, Merchant Center clean-up, conversion verification.",
      results: ["+114% conversion value", "ROAS +109%", "CTR +13.7%"],
      beforeImage: "/lovable-uploads/f98890e1-3214-4382-9212-ecf6f2a2f131.png",
      afterImage: "/lovable-uploads/8c4028f7-578f-4074-a480-7bc2da933083.png"
    }
  ];

  const deliverables = [
    "Google Ads account & feed rebuild (PMax, Search, DSA)",
    "Custom labels & product taxonomy tied to profit tiers",
    "Bid & budget rules by lifecycle and margin",
    "Search term controls + negative structure at scale",
    "Creative & copy sets per product cluster (compliant)",
    "Tracking repair & verification (Ads ↔ GA4 parity, enhanced conversions)",
    "Reporting on revenue, ROAS, MER, CPA, CVR, wasted spend",
    "Testing plan (offer angles, price cards, promos, landing tweaks)"
  ];

  const targetCustomers = [
    "Shopify/Woo/BigCommerce stores spending $3k–$100k+ / mo on ads",
    "Brands with 10–5,000 SKUs wanting product-level control",
    "Teams that want clear numbers and no guesswork",
    "Owners tired of paying for clicks that don't turn into orders"
  ];

  const pillars = [
    { icon: Target, title: "Product first", description: "We don't treat every SKU the same. Margin decides spend." },
    { icon: Search, title: "Query control", description: "We mine, cluster, and block the terms that waste money." },
    { icon: Shield, title: "Feed quality", description: "Titles/attributes fixed = better matching and cheaper conversions." },
    { icon: BarChart3, title: "Clear roles", description: "PMax for scale by cluster, Search for high intent, DSA for gaps." },
    { icon: TrendingUp, title: "Tight tracking", description: "No scaling until numbers line up across Ads and GA4." },
    { icon: Zap, title: "Test with rules", description: "Offers, price cards, and promos tested with guardrails." }
  ];

  const reviews = [
    {
      name: "Ian W.",
      title: "Ecommerce Founder",
      review: "We cut waste by 38% in the first month and finally saw which products actually pay. The weekly trims and monthly pushes keep us growing without surprises."
    },
    {
      name: "Anna S.",
      title: "DTC Lead",
      review: "They rebuilt our account around product margin. ROAS rose from 1.8× to 4.2×, and we're spending more only where it returns."
    },
    {
      name: "Robert S.",
      title: "Ops Director",
      review: "Our feed looked fine to us. It wasn't. Fixing attributes and titles changed everything. CPA dropped 31% with the same budget."
    },
    {
      name: "Szilvia V.",
      title: "Head of Growth",
      review: "Clear reports, clear actions. We know exactly what was trimmed, what was scaled, and why. No noise—just orders."
    },
    {
      name: "Alister M.",
      title: "Co-Owner",
      review: "High-ticket item was hidden in mixed campaigns. Once isolated, it became our top revenue line within two weeks."
    }
  ];

  const faqs = [
    {
      question: "Is the free tool the 'audit'?",
      answer: "No. It's a quick scan to spot waste and profit pockets. The real audit covers feed, structure, queries, and tracking."
    },
    {
      question: "How fast do results show?",
      answer: "You'll feel the waste reduction early. Larger gains come from the rebuild + steady testing."
    },
    {
      question: "Do you handle creative?",
      answer: "Yes—assets and copy for PMax/Search tied to each product cluster. We'll also guide landing tweaks where needed."
    },
    {
      question: "What do you report?",
      answer: "Revenue, ROAS, MER, CPA, CVR, wasted spend, and product-level winners/losers—plus the exact trims and tests running."
    },
    {
      question: "Budgets you work with?",
      answer: "From $3k/mo and up. The system scales cleanly."
    }
  ];

  return (
    <>
      <PublicHeader />
      <SEO
        title="Ecom Ads by ManagingSEO — Maximize Your Google Ads ROAS"
        description="Free Google Ads analytics tool for eCommerce. Find products wasting your budget, surface negative-keyword candidates, and bucket PMax products into Heroes / Costly / Zombies — without leaving your dashboard."
        ogType="website"
      />
      <div className="min-h-screen bg-background">

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/90 text-white p-4 z-40 shadow-lg mb-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm sm:text-base font-medium text-center sm:text-left">
              Spending $3k+/mo on ads? See where budget leaks.
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                trackEvent('cta_click', 'sticky_bottom_connect');
                document.getElementById('tool-signin')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-primary hover:bg-gray-50 hover:shadow-md transition-all duration-200"
            >
              Connect Google Ads →
            </Button>
          </div>
        </div>

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
            <div className="relative max-w-4xl max-h-full">
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-12 right-0 text-white hover:bg-white/20"
                onClick={() => setLightboxImage(null)}
              >
                <X className="w-5 h-5" />
              </Button>
              <img
                src={lightboxImage}
                alt="Case study screenshot"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Scroll Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-200"
            style={{
              width: `${Math.min(100, (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)}%`
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Hero Section */}
          <section className="relative overflow-hidden py-16 lg:py-24">
            {/* Moving Gradient Background - Inspired by Big Tech */}
            <div className="absolute inset-0 rounded-3xl">
              {/* Base dark background */}
              <div className="absolute inset-0 bg-gray-900 rounded-3xl" />

              {/* Primary moving gradient */}
              <div
                className="absolute inset-0 opacity-80 rounded-3xl"
                style={{
                  background: `linear-gradient(135deg, 
                  #0a0a0a 0%, 
                  #1a2e1a 15%,
                  #0d2818 35%,
                  #164223 50%,
                  #1a5c2e 65%,
                  #0f2e1a 80%,
                  #0a0a0a 100%)`,
                  backgroundSize: '400% 400%',
                }}
              />

              {/* Secondary overlay gradient with animation */}
              <div
                className="absolute inset-0 animate-gradient-shift opacity-60 rounded-3xl"
                style={{
                  background: `radial-gradient(circle at center, 
                  transparent 0%,
                  rgba(34, 139, 34, 0.2) 30%,
                  rgba(14, 75, 153, 0.3) 60%,
                  rgba(26, 26, 46, 0.8) 100%)`,
                  backgroundSize: '200% 200%',
                }}
              />

              {/* Moving light effect */}
              <div
                className="absolute inset-0 animate-gradient-move opacity-30 rounded-3xl"
                style={{
                  background: `linear-gradient(45deg, 
                  transparent 30%, 
                  rgba(34, 139, 34, 0.4) 50%, 
                  transparent 70%)`,
                  backgroundSize: '200% 200%',
                }}
              />
            </div>

            {/* Floating Orbs */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-15 animate-orb-float blur-xl"
                style={{
                  background: 'radial-gradient(circle, rgba(34, 139, 34, 0.3) 0%, transparent 70%)',
                }}
              />
              <div
                className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 animate-orb-float blur-xl"
                style={{
                  background: 'radial-gradient(circle, rgba(14, 75, 153, 0.3) 0%, transparent 70%)',
                  animationDelay: '4s',
                }}
              />
              <div
                className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full opacity-12 animate-orb-float blur-xl"
                style={{
                  background: 'radial-gradient(circle, rgba(46, 139, 87, 0.4) 0%, transparent 70%)',
                  animationDelay: '8s',
                }}
              />
            </div>

            <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
              <Badge variant="secondary" className="mb-6 px-4 bg-gray-200 py-2 text-sm font-medium hover:scale-105 transition-transform duration-200">
                For Ecommerce Stores Spending $3,000+/mo
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-2xl px-2">
                Stop letting Google Ads{" "}
                <span className="text-red-400">burn cash</span>.{" "}
                <br className="hidden sm:block" />
                Start buying{" "}
                <span className="bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400 bg-clip-text text-transparent">
                  profitable customers
                </span>.
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white/95 mb-8 max-w-4xl mx-auto leading-relaxed drop-shadow-lg px-2">
                For ecommerce stores spending $3,000+/mo, we cut wasted spend, scale winning products,
                and create steady revenue with Google Ads that pay back.
              </p>
              <p className="text-sm sm:text-base lg:text-lg mb-10 font-medium text-white/90 drop-shadow-sm px-2">
                Get a senior ads team + a clear plan to raise ROAS and lower CPA.
              </p>
              <Button
                size="lg"
                onClick={() => {
                  trackEvent('cta_click', 'hero_book_call');
                  window.open(calendlyUrl, '_blank');
                }}
              className="bg-gradient-to-r bg-emerald-400 to-emerald-600 hover:from-primary/90 hover:to-emerald-500 text-white px-4 sm:px-8 py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 whitespace-normal text-center leading-tight max-w-xs sm:max-w-none mx-auto"
              >
                <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <span>Claim your FREE</span>
                  <span className="flex items-center gap-2">
                    <span>30-minute strategy session</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                </span>
              </Button>
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      trackEvent('cta_click', 'hero_see_waste');
                      document.getElementById('tool-signin')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    See where budget leaks →
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      trackEvent('cta_click', 'hero_audit_guide');
                      navigate('/google-ads-audit-guide');
                    }}
                    className="bg-yellow/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    📊 Complete Audit Guide
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Trust/Proof Strip */}
          <section className="py-12 sm:py-16">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {trustMetrics.map((item, index) => (
                <Card
                  key={index}
                  className="text-center p-4 sm:p-6 border-2 hover:border-primary/30 hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer bg-gradient-to-br from-background to-muted/20 hover:from-primary/5 hover:to-emerald-500/5"
                >
                  <CardContent className="p-0">
                    <div className="text-xl sm:text-2xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-200">
                      {item.metric}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.detail}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Tool Sign-In Section */}
          <section id="tool-signin" className="py-16 sm:py-20">
            <Card className="p-6 sm:p-8 lg:p-12 border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 hover:border-primary/40 hover:shadow-2xl transition-all duration-300">
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">See Your Wasted Spend in Minutes</h2>
                <p className="text-lg sm:text-xl text-muted-foreground mb-8">
                  Connect your account and get a plain-English view of waste, profit drivers, and "zombie" products.
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-left">
                  {["Sign in with Google (read-only access)", "Select your Ads account", "Get the Wasted Budget | Profit Drivers | Zombie Products view", "Book a call if you want us to turn the findings into a full plan"].map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-white/50 hover:bg-white/80 transition-colors duration-200">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => {
                      trackEvent('tool_connect_start', 'tool_signin_connect');
                      // Redirect users to signup so they create an account first
                      navigate('/signup');
                    }}
                    className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-500 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Connect Google Ads →
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      trackEvent('cta_click', 'tool_book_call');
                      window.open(calendlyUrl, '_blank');
                    }}
                    className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-200"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book a free strategy call
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-6">
                  We request the minimum access needed. No edits are made without your approval.
                </p>
              </div>
            </Card>
          </section>

          {/* Why Waste Happens Section */}
          <section className="py-16 sm:py-20">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6 sm:p-8 border-l-4 border-l-destructive bg-gradient-to-r from-destructive/5 to-transparent hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl sm:text-3xl text-destructive mb-4">
                    Why Many Ecommerce Accounts Waste Budget
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <p>• Search term visibility has been reduced in recent years, so many accounts still pay for queries they can't see.</p>
                  <p>• Shopping/PMax can group products and hide where spend goes.</p>
                  <p>• Invalid clicks and weak placements also add up.</p>
                  <p className="font-semibold text-foreground">This is why we often trim or re-route 15–35% of monthly spend in the first month.</p>
                  <p className="text-sm italic">We share links and details during the audit.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Open Letter */}
          <section className="py-16 sm:py-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">Dear Ecommerce Owner,</h2>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  If your ads feel like a slot machine—some days good, most days noisy—you're not alone.
                </p>
              </div>

              <Card className="p-6 sm:p-8 mb-8 border-l-4 border-l-destructive hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-destructive group-hover:scale-105 transition-transform duration-200">
                    Common account patterns we see:
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Money leaking through irrelevant queries and broad matches.",
                    "Mixed product groups hiding the real profit drivers.",
                    "Merchant Center/feed issues limiting visibility without you noticing.",
                    "PMax running \"mystery\" traffic with no product-level control.",
                    "Tracking gaps that make decisions guesswork."
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0"></div>
                      <p className="leading-relaxed">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="p-6 sm:p-8 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent hover:shadow-xl transition-all duration-300">
                <CardContent>
                  <p className="text-lg mb-4">
                    The fix isn't "more budget" or "another hack." It's a clean product-first account:
                  </p>
                  <p className="text-primary font-semibold text-lg mb-4">
                    identify waste → protect margin → push proven items → test new ones with rules.
                  </p>
                  <p className="text-lg font-medium">That's exactly what we build.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 3-Part System */}
          <section className="py-16 sm:py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our 3-Part Ecommerce Ads System</h2>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {systemSteps.map((step, index) => (
                <Card
                  key={index}
                  className="p-6 sm:p-8 border-l-4 border-l-primary hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group bg-gradient-to-r from-background to-muted/10 hover:from-primary/5 hover:to-emerald-500/5"
                >
                  <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="flex-shrink-0 flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        {step.number}
                      </div>
                      {step.icon && (
                        <step.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-xl sm:text-2xl">
                          {step.title}
                          {step.subtitle && <span className="text-base sm:text-lg text-muted-foreground ml-2">{step.subtitle}</span>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-muted-foreground leading-relaxed mb-4">{step.description}</p>
                        {step.purpose && (
                          <div className="bg-primary/10 p-4 rounded-lg group-hover:bg-primary/20 transition-colors duration-300">
                            <p className="text-primary font-medium">Purpose: {step.purpose}</p>
                          </div>
                        )}
                        {step.outcome && (
                          <div className="bg-primary/10 p-4 rounded-lg group-hover:bg-primary/20 transition-colors duration-300">
                            <p className="text-primary font-medium">Outcome: {step.outcome}</p>
                          </div>
                        )}
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Process Timeline */}
          <section className="py-16 sm:py-20">
            <div className="text-center mb-16 px-4">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How We Work</h2>
              <p className="text-lg sm:text-xl text-muted-foreground">Simple timeline without fluff</p>
            </div>

            <div className="flex flex-col space-y-8 lg:flex-row lg:justify-between lg:items-center lg:space-y-0 lg:space-x-4 px-4">
              {processSteps.map((step, index) => (
                <div key={index} className="flex-1 text-center relative group">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-lg group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
                    {index + 1}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-200 px-2">{step.step}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed px-2">{step.description}</p>
                  {index < processSteps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-8 -right-6 w-6 h-6 text-primary group-hover:scale-125 transition-transform duration-300" />
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                size="lg"
                onClick={() => {
                  trackEvent('cta_click', 'process_book_call');
                  window.open(calendlyUrl, '_blank');
                }}
                className="bg-linear-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-500 hover:text-white text-black px-4 sm:px-8 py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 whitespace-normal text-center leading-tight max-w-xs sm:max-w-none mx-auto"
              >
                <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Book your FREE</span>
                  <span className="flex items-center gap-2">
                    <span>strategy session</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                </span>
              </Button>
            </div>
          </section>

          {/* 30-Day Guarantee */}
          <section className="py-16 sm:py-20">
            <Card className="p-6 sm:p-8 lg:p-12 border-2 border-primary bg-gradient-to-br from-primary/5 to-emerald-500/5 hover:shadow-2xl transition-all duration-300">
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  Cut Wasted Ad Spend in 30 Days — or Your First Month Is Free
                </h2>
                <div className="space-y-4 text-left max-w-3xl mx-auto mb-8">
                  <p>• We agree on a target against your last 30 days.</p>
                  <p>• Wasted spend = cost on search terms/placements/products with zero conversions, or running above target CPA / below target ROAS for 7+ days with no upward trend.</p>
                  <p>• If we miss the target, you don't pay the first month's fee.</p>
                  <p className="font-semibold">Requirements: Admin access to Google Ads, GA4, Merchant Center; working conversion tracking; $3k+/mo budget. Site or stock issues pause the clock.</p>
                </div>
                <Button
                  size="lg"
                  onClick={() => {
                    trackEvent('cta_click', 'guarantee_book_call');
                    window.open(calendlyUrl, '_blank');
                  }}
                  className="bg-linear-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-500 hover:text-white text-black px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book a free strategy call
                </Button>
              </div>
            </Card>
          </section>

          {/* First 30 Days Plan */}
          <section className="py-16 sm:py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">First-30-Days Plan</h2>
              <p className="text-lg sm:text-xl text-muted-foreground">Cost-cut changes land in Week 2</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {first30DaysPlan.map((week, index) => (
                <Card
                  key={index}
                  className="p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group border-2 hover:border-primary/30 bg-gradient-to-br from-background to-muted/10 hover:from-primary/5 hover:to-emerald-500/5"
                >
                  <CardHeader className="p-0 mb-4">
                    <Badge variant="outline" className="w-fit mb-2 group-hover:bg-primary group-hover:text-white transition-all duration-200">
                      {week.week}
                    </Badge>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200">
                      {week.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">{week.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* What Counts as a Win */}
          <section className="py-16 sm:py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Counts as a Win</h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {winMetrics.map((metric, index) => (
                <Card
                  key={index}
                  className="p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 group border-2 hover:border-emerald-500/30 bg-gradient-to-br from-background to-emerald-500/5 hover:from-emerald-500/10 hover:to-emerald-500/20"
                >
                  <metric.icon className="w-12 h-12 text-emerald-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle className="text-lg mb-2 group-hover:text-emerald-600 transition-colors duration-200">
                    {metric.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{metric.description}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Case Studies */}
          <section className="py-16 sm:py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Case Studies</h2>
              <p className="text-lg sm:text-xl text-muted-foreground">Real results from real clients</p>
            </div>

            <div className="space-y-12">
              {caseStudies.map((study, index) => (
                <Card
                  key={index}
                  className="p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-br from-background to-muted/10 hover:from-primary/5 hover:to-emerald-500/5"
                >
                  <div className="flex flex-col space-y-8">
                    {/* Company Details Section */}
                    <div>
                      <CardHeader className="p-0 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                          <CardTitle className="text-2xl">{study.company}</CardTitle>
                          <Badge variant="secondary" className="w-fit">{study.industry}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 space-y-4">
                        <div>
                          <h4 className="font-semibold text-destructive mb-2">Challenges:</h4>
                          <p className="text-muted-foreground leading-relaxed">{study.challenge}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Work:</h4>
                          <p className="text-muted-foreground leading-relaxed">{study.work}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-emerald-600 mb-2">Results:</h4>
                          <div className="flex flex-wrap gap-2">
                            {study.results.map((result, resultIndex) => (
                              <Badge key={resultIndex} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors duration-200">
                                {result}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="pt-4 flex flex-col sm:flex-row gap-3">
                          <Button
                            variant="outline"
                            onClick={() => {
                              trackEvent('cta_click', `case_apply_${study.company.toLowerCase()}`);
                              window.open(calendlyUrl, '_blank');
                            }}
                            className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
                          >
                            Apply this to my store →
                          </Button>
                          <Button
                            onClick={() => {
                              const portfolioPath = study.company === 'MyGreenScape' ? '/portfolio/mygreen-scape' :
                                study.company === 'PJ BOLD' ? '/portfolio/pj-bold' :
                                  study.company === 'Mathfel' ? '/portfolio/mathfel' : '/portfolio';
                              navigate(portfolioPath);
                            }}
                            className="bg-linear-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 hover:text-white text-black"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            More Details
                          </Button>
                        </div>
                      </CardContent>
                    </div>

                    {/* Image Slider Section */}
                    <div className="max-w-2xl mx-auto w-full">
                      <Carousel className="w-full">
                        <CarouselContent>
                          <CarouselItem>
                            <div className="relative group cursor-pointer">
                              <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-muted hover:border-primary transition-colors duration-200">
                                <img
                                  src={study.beforeImage}
                                  alt={`${study.company} Google Ads before performance dashboard`}
                                  className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                  onClick={() => setLightboxImage(study.beforeImage)}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </div>
                              </div>
                              <div className="mt-3 text-center">
                                <Badge variant="destructive" className="px-4 py-2 text-sm font-medium">
                                  Before
                                </Badge>
                              </div>
                            </div>
                          </CarouselItem>
                          <CarouselItem>
                            <div className="relative group cursor-pointer">
                              <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-muted hover:border-emerald-500 transition-colors duration-200">
                                <img
                                  src={study.afterImage}
                                  alt={`${study.company} Google Ads after performance dashboard`}
                                  className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                  onClick={() => setLightboxImage(study.afterImage)}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </div>
                              </div>
                              <div className="mt-3 text-center">
                                <Badge className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-medium">
                                  After
                                </Badge>
                              </div>
                            </div>
                          </CarouselItem>
                        </CarouselContent>
                        <CarouselPrevious className="left-4" />
                        <CarouselNext className="right-4" />
                      </Carousel>
                      <p className="text-xs text-muted-foreground text-center mt-4">
                        Click images to view full size • Use arrows to navigate
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                size="lg"
                onClick={() => {
                  trackEvent('cta_click', 'case_studies_book_call');
                  window.open(calendlyUrl, '_blank');
                }}
                className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-500 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Calendar className="w-5 h-5 mr-2" />
                See full breakdowns on the call
              </Button>
            </div>
          </section>

          {/* What You Get */}
          <section className="py-16 sm:py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">What You Get</h2>
              <p className="text-lg sm:text-xl text-muted-foreground">Deliverables</p>
            </div>

            <Card className="p-6 sm:p-8 border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 hover:shadow-xl transition-all duration-300">
              <div className="grid sm:grid-cols-2 gap-4">
                {deliverables.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors duration-200">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Who This Is For */}
          <section className="py-16 sm:py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Who This Is For</h2>
            </div>

            <Card className="p-6 sm:p-8 border-2 border-emerald-500/20 bg-gradient-to-br from-background to-emerald-500/5 hover:shadow-xl transition-all duration-300">
              <div className="space-y-4">
                {targetCustomers.map((customer, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors duration-200">
                    <Users className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{customer}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Why This Works */}
          <section className="py-16 sm:py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why This Works</h2>
              <p className="text-lg sm:text-xl text-muted-foreground">Practical pillars</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pillars.map((pillar, index) => (
                <Card
                  key={index}
                  className="p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 group border-2 hover:border-primary/30 bg-gradient-to-br from-background to-muted/10 hover:from-primary/5 hover:to-emerald-500/5"
                >
                  <pillar.icon className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors duration-200">
                    {pillar.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Plain Talk Block */}
          <section className="py-16 sm:py-20">
            <Card className="p-6 sm:p-8 lg:p-12 border-2 border-foreground/20 bg-gradient-to-br from-background to-muted/20 hover:shadow-xl transition-all duration-300">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">Straight Talk</h2>
                <div className="space-y-4 text-lg leading-relaxed mb-8">
                  <p>If you spend $3k+/mo, you don't need tricks.</p>
                  <p>You need clean tracking, a product-first account, and steady trims and tests.</p>
                  <p className="font-semibold">That's what we do. No noise—just orders.</p>
                </div>
                <Button
                  size="lg"
                  onClick={() => {
                    trackEvent('cta_click', 'plain_talk_book_call');
                    window.open(calendlyUrl, '_blank');
                  }}
                  className="bg-gradient-to-r from-foreground to-muted-foreground hover:from-foreground/90 hover:to-muted-foreground/90 text-background px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book a free strategy call
                </Button>
              </div>
            </Card>
          </section>

          {/* Social Proof Reviews */}
          <section className="py-16 sm:py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Clients Say</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <Card
                  key={index}
                  className="p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group border-2 hover:border-primary/30 bg-gradient-to-br from-background to-muted/10 hover:from-primary/5 hover:to-emerald-500/5"
                >
                  <Quote className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-muted-foreground mb-4 leading-relaxed italic">"{review.review}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">{review.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{review.name}</p>
                      <p className="text-sm text-muted-foreground">{review.title}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16 sm:py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border rounded-lg px-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-background to-muted/10 hover:from-primary/5 hover:to-emerald-500/5"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors duration-200">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="text-center mt-8">
                <p className="text-muted-foreground mb-4">Still unsure?</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    trackEvent('cta_click', 'faq_footer_connect');
                    document.getElementById('tool-signin')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
                >
                  Connect and see your waste →
                </Button>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-16 sm:py-20">
            <Card className="p-6 sm:p-8 lg:p-12 border-2 border-primary bg-gradient-to-br from-primary/10 to-emerald-500/10 hover:shadow-2xl transition-all duration-300">
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  If your Google Ads feel random, it's not you—it's the setup.
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground mb-8">
                  Let's build a product-first account that buys customers at the right price.
                </p>
                <Button
                  size="lg"
                  onClick={() => {
                    trackEvent('cta_click', 'final_cta_book_call');
                    window.open(calendlyUrl, '_blank');
                  }}
              className="bg-gradient-to-r  from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-500 text-white px-4 sm:px-8 py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 whitespace-normal text-center leading-tight max-w-xs sm:max-w-none mx-auto"
                >
                  <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Claim your FREE</span>
                    <span className="flex items-center gap-2">
                      <span>30-minute strategy session</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                  </span>
                </Button>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
};

export default GoogleAdsService;