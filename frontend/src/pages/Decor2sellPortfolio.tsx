// Lead-Gen case study: Decor2sell (Australian home staging service)
// Cost-per-conversion reduced from $256 to $25.11 (90% drop) via PMax
// optimisation, full website redesign, and security hardening.

import { ArrowLeft, TrendingUp, Target, Zap, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageModal } from "@/components/ui/image-modal";
import { useNavigate } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import SEO from "@/components/SEO";

const Decor2sellPortfolio = () => {
  const navigate = useNavigate();

  // Screenshots: drop the two PNGs the user provided into
  // /lovable-uploads/portfolio/ with these exact filenames.
  const beforeImage = "/lovable-uploads/portfolio/decor2sell-before.png";
  const afterImage = "/lovable-uploads/portfolio/decor2sell-after.png";

  const challenges = [
    {
      title: "High Initial Cost Per Conversion",
      description:
        "At the outset, Decor2sell faced a significantly high cost per conversion of $256, indicating that ad spend was generating leads inefficiently.",
      solution:
        "Diagnosed the campaign as still in its learning phase. Rather than reactive changes, I held a steady configuration so Performance Max could accumulate enough conversion data to self-optimise toward profitable lead patterns.",
    },
    {
      title: "Performance Max Learning Curve",
      description:
        "The PMax campaign needed time and precise input to understand the target audience and optimal conversion paths for home-staging services.",
      solution:
        "Simplified the data going into PMax (clean conversion events, focused asset groups) and made only judicious adjustments. The goal was a clear signal for Google's AI so it could mature without being thrown off by frequent changes.",
    },
    {
      title: "Suboptimal Website Design",
      description:
        "The previous website was not conducive to conversions, failing to give visitors an experience that led to inquiries or bookings.",
      solution:
        "Oversaw a complete redesign of the website into a user-friendly, conversion-optimised platform. Calls-to-action and trust signals were repositioned around the booking moment.",
    },
    {
      title: "Persistent Hacker Attacks",
      description:
        "A critical recurring issue: the website's hosting kept falling victim to hacker attacks, causing downtime that disrupted ad campaigns and broke conversion tracking.",
      solution:
        "Worked with the hosting provider and security tooling to harden the site, restore stability, and prevent future intrusions. Continuous uptime became the foundation everything else relied on.",
    },
  ];

  const strategies = [
    "Performance Max (PMax) Optimisation: Patient, data-driven steering through the learning phase",
    "Full Website Redesign: Conversion-optimised pages, clearer CTAs, refined trust signals",
    "Conversion Tracking Reliability: Clean implementation across the new website for accurate measurement",
    "Proactive Website Security: Coordinated hosting safeguards to prevent recurring downtime",
    "Continuous Account Monitoring: Daily checks on spend, clicks, and conversion quality",
    "Ad Copy & Asset Refresh: Aligned messaging to the booking moment for home staging",
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <SEO
        title="Decor2sell Case Study, Cost-Per-Conversion from $256 to $25.11"
        description="How an Australian home-staging business cut cost per conversion by 90% and grew conversions by 767% through Performance Max optimisation, a full website redesign, and security hardening."
        ogType="article"
      />

      <section className="relative py-20 px-4 bg-gradient-to-br from-background via-muted/30 to-primary/10">
        <div className="max-w-6xl mx-auto">
          <Button variant="outline" onClick={() => navigate("/portfolio")} className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Case Studies
          </Button>
          <div className="text-center mb-12">
            <Badge className="mb-3 text-sm px-3 py-1">Lead Generation Case Study</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Decor2sell</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Dramatically reducing cost per conversion from $256 to $25.11 for an Australian home-staging service.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            <Card className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-primary mb-2">90%</h3>
              <p className="text-muted-foreground">Cost-Per-Conversion Reduction</p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
              <Target className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-emerald-600 mb-2">767%</h3>
              <p className="text-muted-foreground">Conversion Increase</p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
              <Zap className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-emerald-600 mb-2">15%</h3>
              <p className="text-muted-foreground">Total Cost Reduction</p>
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
                Decor2sell is an Australian client providing home decor and staging services. Their offering includes preparing homes for sale by cleaning, setting up furniture, staging, and professional photography to enhance buyer appeal. The brief was to optimise their Google Ads for better performance.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">Before &amp; After Performance</h2>
          <p className="text-center text-muted-foreground mb-12">
            Google Ads performance dashboards captured before and after optimisation.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-xl text-center mb-2">Before, Oct 31, 2023 to Mar 31, 2024</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageModal
                  src={beforeImage}
                  alt="Decor2sell Google Ads performance before optimisation, $256 cost per conversion"
                  className="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
                <ul className="mt-4 text-sm text-muted-foreground space-y-1">
                  <li><strong>Clicks:</strong> 8.9K</li>
                  <li><strong>Conversions:</strong> 18</li>
                  <li><strong>Cost / Conv:</strong> $256</li>
                  <li><strong>Total Cost:</strong> $4.61K</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-xl text-center mb-2">After, Feb 1 to Jul 3, 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageModal
                  src={afterImage}
                  alt="Decor2sell Google Ads performance after optimisation, $25.11 cost per conversion"
                  className="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
                <ul className="mt-4 text-sm text-muted-foreground space-y-1">
                  <li><strong>Clicks:</strong> 4.12K</li>
                  <li><strong>Conversions:</strong> 156</li>
                  <li><strong>Cost / Conv:</strong> $25.11</li>
                  <li><strong>Total Cost:</strong> $3.92K</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Initial Challenges &amp; Strategic Approach</h2>
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
          <h2 className="text-3xl font-bold mb-8">Conclusion</h2>
          <p className="text-lg leading-relaxed mb-8">
            By combining strategic Google Ads optimisation with a full website redesign and proactive security hardening, Decor2sell's cost per conversion fell 90% (from $256 to $25.11) while conversions rose 767% (from 18 to 156). Patient PMax management plus conversion-focused design plus uptime stability delivered a transformed lead-generation engine on a slightly smaller budget.
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

export default Decor2sellPortfolio;
