// Lead-Gen case study: Tyretick (UK mobile tyre fitting service)
// 2-month optimisation window, 392 qualified leads, 39.9% CPL reduction.

import { ArrowLeft, TrendingUp, Target, Zap, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageModal } from "@/components/ui/image-modal";
import { useNavigate } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import SEO from "@/components/SEO";

const TyretickPortfolio = () => {
  const navigate = useNavigate();

  const beforeImage = "/lovable-uploads/portfolio/tyretick-1.png";
  const afterImage = "/lovable-uploads/portfolio/tyretick-2.png";

  const challenges = [
    {
      title: "Single Ad Group Bottleneck",
      description:
        "Campaigns were running on one ad group with limited creative variation, meaning no learning loop, no statistical signal on what messaging worked, and no path to systematically lower the cost per lead.",
      solution:
        "Restructured the account into multiple ad groups, each built around a distinct USP (emergency response time, mobile convenience, premium tyre brands). This created a clear A/B testing framework and gave each message its own conversion data to optimise against.",
    },
    {
      title: "Irrelevant Search Traffic Eating Budget",
      description:
        'Generic informational queries like "tyre prices," "tyre brands list," and "tyre size guide" were burning a meaningful portion of monthly spend without converting to bookings. Quality Score was suffering as a result.',
      solution:
        "Implemented a daily search-term review process and built a continuously expanding negative-keyword library to block low-intent queries at the source. Spend got progressively locked onto commercial-intent searches with clear booking signals.",
    },
    {
      title: "Flat 24-Hour Bid Distribution",
      description:
        "Spend was being distributed evenly across all hours regardless of conversion patterns. Peak conversion windows were starved of budget while low-intent overnight hours consumed disproportionate spend.",
      solution:
        "Analysed historical conversion patterns hour-by-hour and implemented bid multipliers to push higher bids during peak conversion windows while throttling spend in low-performing time slots. Budget became a precision tool rather than a flat distribution.",
    },
    {
      title: "Geo Targeting Bleeding Outside Service Zones",
      description:
        "Areas the team couldn't reach within their 30-minute response promise were still triggering ads, generating leads they couldn't fulfil. This wasted ad budget and damaged customer trust.",
      solution:
        "Mapped reachable service zones precisely against the 30-minute response radius, excluded out-of-area triggers entirely, and applied postcode-level bid adjustments to weight spend toward the highest-performing service areas.",
    },
  ];

  const strategies = [
    "Account Structure Audit: Full Google Ads account audit and rebuild into intent-based campaign clusters",
    "Search Term Optimisation: Daily review and aggressive negative-keyword expansion",
    "High-Intent Search Campaign Launch: Dedicated campaign targeting commercial-intent keywords",
    "Ad Group Diversification: Multiple ad groups built around distinct USPs for systematic testing",
    "Bid Schedule Optimisation: Hour-of-day and day-of-week bid multipliers based on conversion data",
    "Geo-Targeting Refinement: Service-area mapping with postcode-level bid adjustments",
    "Landing Page Alignment: Updates to mirror ad copy for better message-match scoring",
    "Multi-Channel Conversion Tracking: Phone, WhatsApp, Form, and Website call attribution",
    "Monthly Performance Reporting: Branded reports with optimisation logs and forward action plans",
    "Continuous Account Monitoring: Daily tracking of spend, clicks, and conversion quality",
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <SEO
        title="Tyretick Case Study, 392 Qualified Leads in 2 Months at 39.9% Lower CPL"
        description="How a UK mobile tyre fitting service scaled to 264 monthly leads at £14.53 cost-per-lead through Google Ads restructuring, hour-of-day bid scheduling, and geo-precision."
        ogType="article"
      />
      {/* Hero */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-background via-muted/30 to-primary/10">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate("/portfolio")}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Case Studies
          </Button>
          <div className="text-center mb-12">
            <Badge className="mb-3 text-sm px-3 py-1">Lead Generation Case Study</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Tyretick</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Generating 392 Qualified Leads in 2 Months Through Strategic Google Ads Optimisation. A case study in scaling lead volume while cutting cost per acquisition for a 24/7 UK mobile tyre fitting service.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            <Card className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-primary mb-2">392</h3>
              <p className="text-muted-foreground">Qualified Leads Generated</p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
              <Target className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-emerald-600 mb-2">3.40x</h3>
              <p className="text-muted-foreground">Return on Ad Spend</p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
              <Zap className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-emerald-600 mb-2">39.9%</h3>
              <p className="text-muted-foreground">Reduction in Cost Per Lead</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Background */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-2xl mb-4">Client Background</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">
                Tyretick Ltd is a 24/7 mobile tyre fitting service operating across London and the wider UK, providing same-day mobile tyre fitting, puncture repair, locking wheel nut removal, and emergency roadside callouts. They approached me to scale their lead generation through Google Ads while keeping cost per acquisition under tight control in a high-intent, time-sensitive category where drivers make fast decisions during stressful moments.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Before / After */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">2-Month Performance Snapshot</h2>
          <p className="text-center text-muted-foreground mb-12">
            Google Ads dashboards captured at the start of the engagement and at the most recent reporting period.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-xl text-center mb-2">Before, Sep 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageModal
                  src={beforeImage}
                  alt="Tyretick Google Ads performance before optimisation"
                  className="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
                <ul className="mt-4 text-sm text-muted-foreground space-y-1">
                  <li><strong>Monthly Leads:</strong> 128</li>
                  <li><strong>Cost Per Lead:</strong> &pound;24.16</li>
                  <li><strong>Active Ad Groups:</strong> 1</li>
                  <li><strong>Bid Schedule:</strong> Flat 24/7</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-xl text-center mb-2">After, Oct 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageModal
                  src={afterImage}
                  alt="Tyretick Google Ads performance after optimisation"
                  className="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
                <ul className="mt-4 text-sm text-muted-foreground space-y-1">
                  <li><strong>Monthly Leads:</strong> 264 (+106.8%)</li>
                  <li><strong>Cost Per Lead:</strong> &pound;14.53 (&minus;39.9%)</li>
                  <li><strong>Active Ad Groups:</strong> 3 campaigns optimised</li>
                  <li><strong>Bid Schedule:</strong> Hour-of-day multipliers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Headline movement */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Month 1 vs Month 2, Headline Movement</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { metric: "Avg. CPC", v: "£3.93 → £2.86", delta: "−27.2%", color: "text-emerald-600" },
              { metric: "Conversions", v: "128 → 264", delta: "+106.8%", color: "text-emerald-600" },
              { metric: "Cost", v: "£3.08K → £3.83K", delta: "Strategic scale-up", color: "text-gray-600" },
              { metric: "Cost Per Lead", v: "£24.16 → £14.53", delta: "−39.9%", color: "text-emerald-600" },
            ].map((m) => (
              <Card key={m.metric} className="p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{m.metric}</div>
                <div className="text-lg font-semibold mt-1 text-gray-900">{m.v}</div>
                <div className={`text-sm mt-1 ${m.color}`}>{m.delta}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="py-16 px-4 bg-muted/20">
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

      {/* Strategies */}
      <section className="py-16 px-4">
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

      {/* Closing */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-emerald-500/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Results &amp; Impact</h2>
          <p className="text-lg leading-relaxed mb-8">
            Through disciplined daily optimisation across negative-keyword sculpting, campaign restructuring, bid scheduling, and geo-targeting refinement, Tyretick's Google Ads account became a measurably more efficient lead-generation engine. Conversion volume scaled 106.8% while cost per lead dropped 39.9%, delivering predictable, profitable growth in a high-intent service category where every fulfilled emergency call builds long-term brand trust.
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

export default TyretickPortfolio;
