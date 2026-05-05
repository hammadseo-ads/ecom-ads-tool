// Lead-Gen case study: CPA MOMS (US franchise of virtual CPAs)
// 9-month / 3-quarter compounding optimisation, 145 consultation leads,
// 67% CPL reduction.

import { ArrowLeft, TrendingUp, Target, Zap, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageModal } from "@/components/ui/image-modal";
import { useNavigate } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import SEO from "@/components/SEO";

const CPAMomsPortfolio = () => {
  const navigate = useNavigate();

  const q1 = "/lovable-uploads/portfolio/cpamoms-1.png";
  const q2 = "/lovable-uploads/portfolio/cpamoms-2.png";
  const q3 = "/lovable-uploads/portfolio/cpamoms-3.png";

  const challenges = [
    {
      title: "Generic Search Drain",
      description:
        '"Accountant near me" and similar broad searches were burning budget on job seekers, salary checkers, and DIY hobbyists. The account was bleeding spend on traffic that would never book a paid CPA consultation.',
      solution:
        "Built and maintained an aggressive negative-keyword library. Every day, the search-term report got reviewed and queries containing job, salary, exam, free, course, certification, and similar low-intent themes were excluded at the source.",
    },
    {
      title: "Consultation Booking as a Secondary CTA",
      description:
        "The free 30-minute phone consultation, the actual revenue-driving conversion event, was buried as a secondary CTA on the site, while less-meaningful actions stole the visual hierarchy.",
      solution:
        "Repositioned the free consultation as the hero CTA in every ad, every landing page, and every conversion action. Conversion tracking was rebuilt to count consultations, calls, and form submissions as distinct, high-priority events.",
    },
    {
      title: "Flat Audience Targeting",
      description:
        "Real-estate investors, eCommerce sellers, franchise owners, and general entrepreneurs were all being shown the same generic CPA messaging, even though their pain points and language differ significantly.",
      solution:
        "Created vertical-specific ad groups with copy and landing pages tuned to each audience. Trust signals (average 25 years CPA experience, ~15 clients per CPA, free consultation) were surfaced consistently across the funnel.",
    },
    {
      title: "Spend Distributed Without Time Logic",
      description:
        "Bids were flat across all hours of the day and days of the week, even though small-business owners book consultations heavily during weekday business hours.",
      solution:
        "Implemented hour-of-day and day-of-week bid multipliers. Spend got concentrated on B2B working hours where consultation bookings actually happen, throttled aggressively on weekends and overnight.",
    },
  ];

  const strategies = [
    "Account Structure Audit & Rebuild: Full restructure into intent-based campaign clusters (service line × industry vertical)",
    "Aggressive Negative-Keyword Library: Daily search-term review blocking job, exam, salary, and DIY queries at the source",
    "Commercial-Intent Keyword Sculpting: Prioritised \"hire a CPA,\" \"virtual CPA for entrepreneurs,\" \"outsourced bookkeeping,\" \"small business tax CPA\"",
    "Vertical-Specific Ad Copy: Distinct ads for real-estate investors, eCommerce sellers, franchise owners, and general entrepreneurs",
    "Free Consultation as Hero CTA: Repositioned the 30-minute phone consult as the primary conversion event in every ad and landing page",
    "Trust Signal Layering: Average 25 years CPA experience, ~15 clients per CPA, free for business owners, surfaced in ads and on landing page",
    "Bid Schedule Optimisation: Hour-of-day and day-of-week multipliers concentrating spend on B2B working hours",
    "Landing Page Message-Match: Headline, sub-copy, and form fields aligned to the ad the visitor clicked",
    "Conversion Tracking Hardening: Form submissions, phone calls, and consultation bookings tracked as separate conversion actions",
    "Geo-Performance Layer: Bid adjustments toward US states with the highest historical conversion-to-engagement rates",
    "Monthly Performance Reporting: Branded reports with optimisation logs and forward action plans",
    "Continuous Account Monitoring: Daily tracking of spend, clicks, and conversion quality",
  ];

  const quarters = [
    {
      label: "Q1, Before",
      period: "May 1 to Jul 31, 2024",
      img: q1,
      caption: "Pre-optimisation baseline",
      stats: [
        ["Clicks", "783"],
        ["Leads", "35"],
        ["Conv. Rate", "4.47%"],
        ["Cost Per Lead", "$174"],
        ["Spend", "$6,110"],
      ],
    },
    {
      label: "Q2, Initial Wins",
      period: "Aug 1 to Oct 31, 2024",
      img: q2,
      caption: "First optimisation cycle",
      stats: [
        ["Clicks", "586"],
        ["Leads", "53 (+51.4%)"],
        ["Conv. Rate", "9.04% (+102%)"],
        ["Cost Per Lead", "$109 (−37%)"],
        ["Spend", "$5,770"],
      ],
    },
    {
      label: "Q3, Latest",
      period: "Jan 1 to Mar 31, 2025",
      img: q3,
      caption: "Compounding gains",
      stats: [
        ["Clicks", "363"],
        ["Leads", "57 (+62.9%)"],
        ["Conv. Rate", "15.70% (+251%)"],
        ["Cost Per Lead", "$57.49 (−67%)"],
        ["Spend", "$3,280 (−46%)"],
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <SEO
        title="CPA MOMS Case Study, 67% Lower Cost-Per-Consultation in 9 Months"
        description="How a US national CPA franchise scaled to 145 consultation bookings while cutting cost-per-lead from $174 to $57.49 across three reporting quarters."
        ogType="article"
      />

      <section className="relative py-20 px-4 bg-gradient-to-br from-background via-muted/30 to-primary/10">
        <div className="max-w-6xl mx-auto">
          <Button variant="outline" onClick={() => navigate("/portfolio")} className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Case Studies
          </Button>
          <div className="text-center mb-12">
            <Badge className="mb-3 text-sm px-3 py-1">Lead Generation Case Study</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">CPA MOMS</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Generating 145 free-consultation leads in 9 months through strategic Google Ads optimisation. A case study in compounding performance wins across three reporting quarters for a US national virtual-CPA franchise.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            <Card className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-primary mb-2">+62.9%</h3>
              <p className="text-muted-foreground">Increase in Qualified Leads</p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
              <Target className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-emerald-600 mb-2">&minus;67%</h3>
              <p className="text-muted-foreground">Reduction in Cost Per Lead</p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
              <Zap className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-emerald-600 mb-2">3.51x</h3>
              <p className="text-muted-foreground">Conversion Rate Lift</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-2xl mb-4">Client Background</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">
                CPA MOMS&reg; is a US national franchise network that matches entrepreneurs and small-business owners with carefully screened virtual CPAs across bookkeeping, tax planning, financial reporting, and CFO advisory. The business model is consultation-led, every paying client starts with a free 30-minute phone consultation booked through the website. They approached me to scale lead volume through Google Ads while bringing the cost per consultation booking under control in a competitive, broad-match-heavy category where generic searches like "accountant near me" can drain budget fast without producing fit-for-purpose leads.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">Quarter-by-Quarter Snapshot</h2>
          <p className="text-center text-muted-foreground mb-12">
            Three consecutive 3-month windows showing how disciplined optimisation compounded results from baseline to latest.
          </p>
          <div className="grid lg:grid-cols-3 gap-6">
            {quarters.map((q) => (
              <Card key={q.label} className="p-5">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg">{q.label}</CardTitle>
                  <p className="text-xs text-muted-foreground">{q.period}</p>
                </CardHeader>
                <CardContent className="px-0">
                  <ImageModal
                    src={q.img}
                    alt={`CPA MOMS Google Ads ${q.label}`}
                    className="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  />
                  <p className="text-xs text-muted-foreground mt-2 italic">{q.caption}</p>
                  <ul className="mt-4 text-sm text-muted-foreground space-y-1">
                    {q.stats.map(([k, v]) => (
                      <li key={k}>
                        <strong>{k}:</strong> {v}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-r-lg">
            <h3 className="font-semibold text-emerald-900 mb-1">The Compounding Story</h3>
            <p className="text-sm text-emerald-900/90">
              By Q3 the account was generating 57 consultation bookings on $3.28K of spend, versus 35 bookings on $6.11K in Q1. That is 63% more leads on roughly half the budget. Cost per lead fell from $174 to $57.49 (a 67% drop), and conversion rate climbed from 4.47% to 15.70% (a 251% lift). Each quarter built on the last rather than plateauing.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Initial Challenges &amp; My Approach</h2>
          <div className="space-y-8">
            {challenges.map((c, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl mb-3">{c.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{c.description}</p>
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-2">My Solution:</h4>
                      <p className="text-green-700">{c.solution}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Strategies Implemented</h2>
          <Card className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {strategies.map((s, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-muted-foreground">{s}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-emerald-500/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Results &amp; Impact</h2>
          <p className="text-lg leading-relaxed mb-8">
            Through disciplined ongoing optimisation across negative-keyword sculpting, account restructuring, vertical-specific ad copy, and landing-page alignment, CPA MOMS&reg; Google Ads account became a measurably more efficient lead-generation engine. By Q3, consultation bookings had risen 62.9% versus the Q1 baseline while total ad spend had been cut by 46.3%. Conversion rate climbed from 4.47% to 15.70%, a 3.51x lift, and cost per lead fell from $174 to $57.49, a 67% reduction.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/contact")}
            className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
          >
            Get Similar Results for Your Business <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CPAMomsPortfolio;
