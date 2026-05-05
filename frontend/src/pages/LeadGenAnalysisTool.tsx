// /lead-gen-tool, public landing page for the Lead Generation track.
// Mirrors /ads-tool structurally but: (1) lead-gen positioning, (2) NO
// product-image-heavy sections, (3) every metric framed around leads,
// form-fills, and cost-per-conversion (not ROAS or revenue).

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Target,
  TrendingDown,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Search,
  Calendar,
  MapPin,
  Type,
  Sparkles,
  PiggyBank,
  Phone,
  ClipboardList,
  Briefcase,
} from "lucide-react";

import PublicHeader from "@/components/PublicHeader";
import SEO from "@/components/SEO";

const LeadGenAnalysisTool = () => {
  const { user } = useAuth();
  const { toast: _toast } = useToast();
  const navigate = useNavigate();

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
          <p className="text-gray-600 mb-6">You're already logged in.</p>
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tools = [
    {
      icon: PiggyBank,
      title: "Budget Wastage by Keywords",
      description:
        "Find keywords and search terms over the last 30 / 60 / 90 days that spent budget but produced zero conversions. The fastest way to find negative-keyword candidates.",
    },
    {
      icon: Calendar,
      title: "Heat Map (Hour × Day)",
      description:
        "See which hours and days actually convert. Suggested bid adjustments are built on conversion rate, so they work for any lead-gen account regardless of how revenue is tracked.",
    },
    {
      icon: MapPin,
      title: "Geographic Performance",
      description:
        "Find which cities, regions, and zip codes produce the cheapest leads, and which ones to exclude. Action labels respect each campaign type's bid-modifier rules.",
    },
    {
      icon: Type,
      title: "N-Gram Analysis",
      description:
        "Break search terms into 1-, 2-, and 3-word patterns ranked by conversions and cost-per-conversion. One good n-gram negative can save what 50 individual keyword pauses would.",
    },
  ];

  const idealFor = [
    { icon: Briefcase, label: "Service businesses", detail: "lawyers, dentists, plumbers, contractors, clinics" },
    { icon: Phone, label: "Lead-gen B2B", detail: "SaaS demos, agency consultations, enterprise sales" },
    { icon: ClipboardList, label: "Form-fill funnels", detail: "insurance quotes, mortgage leads, real-estate enquiries" },
  ];

  return (
    <>
      <PublicHeader />
      <SEO
        title="Lead Generation Google Ads Analysis Tool, Free"
        description="Free Google Ads analysis tool built for lead-generation businesses. Find wasted spend on non-converting keywords, the best hours and geos for leads, and the search-term patterns to add as negatives, all measured by conversions and cost-per-lead."
        ogType="website"
      />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gray-900" />
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background: `linear-gradient(135deg,
                  #0a0a0a 0%,
                  #0d2818 15%,
                  #0d2818 35%,
                  #164223 50%,
                  #1a5c2e 65%,
                  #0d2818 80%,
                  #0a0a0a 100%)`,
              }}
            />
          </div>

          <div className="relative max-w-5xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 text-xs font-semibold text-emerald-100 mb-6">
              <Target className="w-3.5 h-3.5" />
              Built for Lead Gen, not eCommerce
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Stop paying Google for clicks that{" "}
              <span className="text-emerald-300">don't become leads.</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-50/90 max-w-3xl mx-auto mb-8">
              Most lead-gen accounts waste 30–60% of their Google Ads spend on
              keywords, hours, and geos that never produce a single form-fill
              or call. This free tool surfaces every one of them, ranked by
              conversions and cost-per-lead.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                onClick={() => navigate("/signup")}
              >
                Start free analysis <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white bg-white/10 hover:bg-white/20"
                onClick={() => navigate("/contact")}
              >
                Talk to a specialist
              </Button>
            </div>
            <p className="text-xs text-emerald-100/70 mt-6">
              Free. Read-only Google Ads connection. No credit card.
            </p>
          </div>
        </section>

        {/* What the tool does for service businesses */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-emerald-50/40 to-emerald-100/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Built for the way service businesses count success
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Every report measures what your business actually depends on:
                form-fills, phone calls, and qualified leads. Run any tool,
                read the result, and apply the fix inside Google Ads. No
                rebuild, no agency contract, no spreadsheets.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-emerald-300 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">
                    What every analysis answers
                  </h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
                  <li>Which keywords burned budget without producing a single lead</li>
                  <li>Which hours of the week your phone actually rings</li>
                  <li>Which cities, regions and zip codes deliver the cheapest leads</li>
                  <li>Which word patterns in the search-term report are the strongest negative-keyword candidates</li>
                </ul>
              </div>
              <div className="bg-white border-2 border-emerald-300 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">
                    What you do with the answers
                  </h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
                  <li>Add the wasted keywords to your shared negative list</li>
                  <li>Set hour-of-day bid adjustments where leads convert best</li>
                  <li>Exclude the geographies that consistently waste budget</li>
                  <li>Apply the n-gram patterns once and stop dozens of bad searches at the same time</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* The 4 tools */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 mb-3">
                What you get
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Four free analyses, built around real leads
              </h2>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                Connect your Google Ads (read-only) and run any of these
                whenever you want. Nothing is ever changed in your account -
                we surface the data, you apply the fix.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {tools.map((t) => {
                const Icon = t.icon;
                return (
                  <div
                    key={t.title}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="bg-emerald-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-emerald-700" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50/40 via-white to-emerald-50/40">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Built for businesses that count leads, not orders
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {idealFor.map((g) => {
                const Icon = g.icon;
                return (
                  <div
                    key={g.label}
                    className="bg-white border border-gray-200 rounded-xl p-6 text-center"
                  >
                    <div className="bg-emerald-100 rounded-full w-14 h-14 flex items-center justify-center mb-4 mx-auto">
                      <Icon className="w-7 h-7 text-emerald-700" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {g.label}
                    </h3>
                    <p className="text-sm text-gray-600">{g.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* The 80/20 reality */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-2xl p-8 md:p-12 text-center shadow-xl">
              <TrendingDown className="w-12 h-12 mx-auto mb-4 text-emerald-200" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The 80/20 of lead-gen ad spend
              </h2>
              <p className="text-lg text-emerald-50/90 max-w-2xl mx-auto leading-relaxed">
                On almost every lead-gen account we audit,{" "}
                <strong className="text-white">
                  20% of the keywords drive 80% of the leads
                </strong>{" "}
               , and the other 80% of keywords burn 30–60% of the budget on
                clicks that never convert.
              </p>
              <p className="text-sm text-emerald-100/80 mt-4 max-w-xl mx-auto">
                Identifying that bleed is the single highest-leverage fix in
                your account. This tool finds it for you in 60 seconds.
              </p>
              <div className="mt-8">
                <Button
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-emerald-50"
                  onClick={() => navigate("/signup")}
                >
                  Find my wasted spend <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                How it works
              </h2>
              <p className="text-gray-600 mt-3">
                Three steps. No spreadsheets. No code.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  n: "1",
                  title: "Connect Google Ads",
                  desc: "Read-only OAuth. Takes 30 seconds. We never modify your campaigns or run a single mutation.",
                  icon: Search,
                },
                {
                  n: "2",
                  title: "Pick a tool + an account",
                  desc: "From your dashboard, select Lead Generation Ads Analysis, then pick the Google Ads account to analyze.",
                  icon: Sparkles,
                },
                {
                  n: "3",
                  title: "Apply the fixes",
                  desc: "Every report tells you exactly what to do, add these negatives, exclude these locations, raise/lower these hour bids. You apply them inside Google Ads UI.",
                  icon: CheckCircle,
                },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.n}
                    className="bg-white border border-gray-200 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-emerald-600 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold">
                        {s.n}
                      </span>
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {s.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to find the leaks?
            </h2>
            <p className="text-emerald-50/95 text-lg mb-8">
              Sign up free, connect your Google Ads, and run your first
              analysis in under 5 minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50"
                onClick={() => navigate("/signup")}
              >
                Start free analysis <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white bg-white/10 hover:bg-white/20"
                onClick={() => navigate("/ads-tool")}
              >
                See the eCommerce version
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default LeadGenAnalysisTool;
