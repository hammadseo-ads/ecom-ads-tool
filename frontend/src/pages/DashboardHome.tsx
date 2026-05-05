// Main dashboard landing page after sign-in.
//
// Phase 2 redesign:
//  - Always renders (no longer blank when account isn't selected yet).
//  - Two top-level tracks: eCommerce Ads Analysis vs Lead Generation Ads
//    Analysis. User picks one; the corresponding tool grid renders below.
//  - Clicking a tool card while NO account is selected pops a center-screen
//    modal asking the user to pick an account from the dropdown above first.
//  - Lead-Gen tools that aren't backend-ready yet are marked "Coming soon"
//    and disabled (Phase 4 will wire them up).
//  - Below the grid: explainer sections so the dashboard never feels empty.
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShoppingBag,
  Search,
  ArrowRight,
  Layout,
  FileSpreadsheet,
  Calendar,
  MapPin,
  Type,
  Target,
  TrendingUp,
  AlertCircle,
  PiggyBank,
  Sparkles,
  CheckCircle2,
  ChevronUp,
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

type Track = "ecommerce" | "leadgen";

interface ToolCardSpec {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  buttonClass: string;
  ctaLabel: string;
  // Where it goes when clicked. If `requiresAccount` and no account selected,
  // we show the modal instead.
  to: string;
  requiresAccount: boolean;
  // Show "Coming soon" badge + disable the card
  comingSoon?: boolean;
}

const ECOM_TOOLS: ToolCardSpec[] = [
  {
    title: "Budget Wastage by Products",
    description:
      "Find profitable, costly, zero-conversion, and zombie products in your Shopping & Performance Max campaigns.",
    icon: ShoppingBag,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700",
    ctaLabel: "Open Product Analysis",
    to: "/dashboard/products",
    requiresAccount: true,
  },
  {
    title: "Budget Wastage by Keywords",
    description:
      "Surface Performance Max search terms that may be wasting budget — and find candidates for negative keywords.",
    icon: Search,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
    buttonClass: "bg-emerald-700 hover:bg-emerald-800",
    ctaLabel: "Open Keyword Analysis",
    to: "/dashboard/keywords",
    requiresAccount: true,
  },
  {
    title: "Heat Map (Hour × Day)",
    description:
      "See when your campaigns convert best across 24h × 7 days. Get suggested bid adjustments per hour for Manual-CPC / Max-Clicks campaigns.",
    icon: Calendar,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    buttonClass: "bg-emerald-700 hover:bg-emerald-800",
    ctaLabel: "Open Heat Map",
    to: "/dashboard/heatmap",
    requiresAccount: true,
  },
  {
    title: "N-Gram Analysis",
    description:
      "Break search terms into 1-, 2-, and 3-word n-grams to surface top performers and wasted-spend patterns hiding in your data.",
    icon: Type,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    buttonClass: "bg-emerald-700 hover:bg-emerald-800",
    ctaLabel: "Open N-Gram Tool",
    to: "/dashboard/ngrams",
    requiresAccount: true,
  },
  {
    title: "Geographic Performance",
    description:
      "Find your winning & losing zip codes, cities, regions, and metros. Action labels respect PMax's bid-adjustment limits.",
    icon: MapPin,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    buttonClass: "bg-emerald-700 hover:bg-emerald-800",
    ctaLabel: "Open Geo Analysis",
    to: "/dashboard/geo",
    requiresAccount: true,
  },
  {
    title: "Website CRO Audit",
    description:
      "Manual checklist — open your store and audit it section by section. No Google Ads connection needed.",
    icon: Layout,
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
    buttonClass: "bg-green-600 hover:bg-green-700",
    ctaLabel: "Start Manual Audit",
    to: "/guides/ecommerce-cro-audit",
    requiresAccount: false,
  },
  {
    title: "Negative Keywords & Titles",
    description:
      "Pull 30 days of search-term + product-title data, run through our Claude skill, get back a negatives list and a product-title audit.",
    icon: FileSpreadsheet,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700",
    ctaLabel: "Open Workflow",
    to: "/guides/negative-keywords-and-titles",
    requiresAccount: false,
  },
];

const LEADGEN_TOOLS: ToolCardSpec[] = [
  {
    title: "Budget Wastage by Keywords",
    description:
      "Find search terms over the last 30 / 60 / 90 days that spent budget but produced zero conversions — the cleanest list of negative-keyword candidates for lead-gen accounts.",
    icon: PiggyBank,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    buttonClass: "bg-blue-600 hover:bg-blue-700",
    ctaLabel: "Coming soon",
    to: "/dashboard/lead-gen/wasted-keywords",
    requiresAccount: true,
    comingSoon: true,
  },
  {
    title: "Heat Map (Hour × Day)",
    description:
      "When do your leads actually convert across 24h × 7 days? Suggested bid adjustments per hour are built on conversion rate (not ROAS) for lead-gen.",
    icon: Calendar,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    buttonClass: "bg-blue-600 hover:bg-blue-700",
    ctaLabel: "Coming soon",
    to: "/dashboard/lead-gen/heatmap",
    requiresAccount: true,
    comingSoon: true,
  },
  {
    title: "Geographic Performance",
    description:
      "Find which cities / regions / zip codes drive the cheapest leads — and which ones to exclude entirely. Bid recommendations use CPA, not ROAS.",
    icon: MapPin,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    buttonClass: "bg-blue-600 hover:bg-blue-700",
    ctaLabel: "Coming soon",
    to: "/dashboard/lead-gen/geo",
    requiresAccount: true,
    comingSoon: true,
  },
  {
    title: "N-Gram Analysis",
    description:
      "Break search terms into 1-, 2-, and 3-word n-grams ranked by conversions and cost-per-conversion. Surface lead-quality patterns hiding inside your queries.",
    icon: Type,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    buttonClass: "bg-blue-600 hover:bg-blue-700",
    ctaLabel: "Coming soon",
    to: "/dashboard/lead-gen/ngrams",
    requiresAccount: true,
    comingSoon: true,
  },
  {
    title: "Negative Keywords (Lead Gen)",
    description:
      "Download your last 30 days of search-term data per campaign, then run it through our lead-gen Claude skill (combined with your landing-page content) to get a negatives list tuned to your business.",
    icon: FileSpreadsheet,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    buttonClass: "bg-blue-600 hover:bg-blue-700",
    ctaLabel: "Coming soon",
    to: "/guides/lead-gen-negative-keywords",
    requiresAccount: false,
    comingSoon: true,
  },
];

const TRACK_META = {
  ecommerce: {
    label: "eCommerce Ads Analysis",
    description:
      "For online stores. Tools rank products / keywords / hours / geos by ROAS and conversion value.",
    icon: ShoppingBag,
    accent: "emerald",
    tools: ECOM_TOOLS,
  },
  leadgen: {
    label: "Lead Generation Ads Analysis",
    description:
      "For service businesses, B2B, agencies, and any account where success means leads (not revenue). Tools rank by conversions and cost-per-conversion (no ROAS required).",
    icon: Target,
    accent: "blue",
    tools: LEADGEN_TOOLS,
  },
} as const;

const DashboardHome = () => {
  const navigate = useNavigate();
  const [track, setTrack] = useState<Track>("ecommerce");
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);

  return (
    <DashboardShell>
      {({ selectedAccountId, selectedAccountName }) => {
        const tools = TRACK_META[track].tools;

        const handleToolClick = (tool: ToolCardSpec) => {
          if (tool.comingSoon) return;
          if (tool.requiresAccount && !selectedAccountId) {
            setShowAccountPrompt(true);
            return;
          }
          navigate(tool.to);
        };

        return (
          <div className="space-y-10 pb-20">
            {/* Hero */}
            <div className="text-center pt-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                What kind of analysis are you running today?
              </h1>
              {selectedAccountId ? (
                <p className="text-gray-600 mt-2">
                  Account selected:{" "}
                  <span className="font-semibold">{selectedAccountName}</span>{" "}
                  <span className="text-gray-400">({selectedAccountId})</span>
                </p>
              ) : (
                <p className="text-gray-500 mt-2 text-sm">
                  Browse the tools below — pick a Google Ads account from the
                  top-right dropdown when you're ready to run one.
                </p>
              )}
            </div>

            {/* Track selector — two big cards */}
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {(["ecommerce", "leadgen"] as const).map((t) => {
                const meta = TRACK_META[t];
                const Icon = meta.icon;
                const active = track === t;
                const ringClass =
                  t === "ecommerce"
                    ? "ring-emerald-500 border-emerald-400"
                    : "ring-blue-500 border-blue-400";
                const iconBg =
                  t === "ecommerce" ? "bg-emerald-100" : "bg-blue-100";
                const iconColor =
                  t === "ecommerce" ? "text-emerald-700" : "text-blue-700";
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTrack(t)}
                    className={`text-left rounded-xl border-2 bg-white p-5 transition-all hover:shadow-md ${
                      active
                        ? `${ringClass} shadow-md ring-2 ring-offset-2`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`${iconBg} rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {meta.label}
                          </h3>
                          {active && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 leading-snug">
                          {meta.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tool grid for the selected track */}
            <div>
              <div className="flex items-center justify-between max-w-6xl mx-auto mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {TRACK_META[track].label} — Tools
                </h2>
                <span className="text-xs text-gray-500">
                  {tools.length} tools
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const disabled = !!tool.comingSoon;
                  return (
                    <Card
                      key={tool.title}
                      className={`border-2 transition-shadow ${
                        disabled
                          ? "opacity-70 cursor-not-allowed border-gray-200"
                          : "cursor-pointer hover:shadow-lg hover:border-emerald-400"
                      }`}
                      onClick={() => handleToolClick(tool)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className={`${tool.iconBg} rounded-full w-14 h-14 flex items-center justify-center mb-4`}
                          >
                            <Icon className={`w-7 h-7 ${tool.iconColor}`} />
                          </div>
                          {disabled && (
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 bg-blue-100 rounded-full px-2 py-0.5">
                              Coming soon
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-2xl">{tool.title}</CardTitle>
                        <CardDescription className="text-base mt-2">
                          {tool.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          className={`w-full ${tool.buttonClass}`}
                          disabled={disabled}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToolClick(tool);
                          }}
                        >
                          {tool.ctaLabel}{" "}
                          {!disabled && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Explainer section: what to do with these tools */}
            <section className="max-w-6xl mx-auto pt-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                How to get the most out of these tools
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Most accounts are wasting 30–60% of ad spend before any tool can
                find it. Here's the order we recommend.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-100 text-emerald-700 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      1
                    </span>
                    <h3 className="font-semibold">Find the bleed</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Run <strong>Budget Wastage by Products</strong> or{" "}
                    <strong>by Keywords</strong> first. Identify the line items
                    that have spent real money with no conversions — they're
                    almost always 20–40% of total spend.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-100 text-emerald-700 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      2
                    </span>
                    <h3 className="font-semibold">Pattern-match</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Use <strong>N-Gram Analysis</strong> +{" "}
                    <strong>Negative Keywords workflow</strong> to find the word
                    patterns that explain the wasted spend. One good negative
                    keyword can save what 50 product-level pauses would.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-100 text-emerald-700 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      3
                    </span>
                    <h3 className="font-semibold">Bid where it works</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Use <strong>Heat Map</strong> +{" "}
                    <strong>Geographic Performance</strong> to find the hours
                    and locations doing the heavy lifting. Apply the bid
                    multipliers and exclusions surfaced in each tool.
                  </p>
                </div>
              </div>
            </section>

            {/* What's the difference between tracks */}
            <section className="max-w-6xl mx-auto pt-4">
              <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 border border-gray-200 rounded-xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    eCommerce vs Lead Gen — what changes?
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h3 className="font-semibold text-emerald-700 mb-2">
                      eCommerce track
                    </h3>
                    <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
                      <li>
                        Ranks by <strong>ROAS</strong> + conversion value
                      </li>
                      <li>
                        Pulls from <code>shopping_performance_view</code> →
                        per-product data
                      </li>
                      <li>
                        Suggested bid adjustments use revenue / cost
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-700 mb-2">
                      Lead Generation track
                    </h3>
                    <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
                      <li>
                        Ranks by <strong>conversions</strong> +
                        cost-per-conversion (CPA)
                      </li>
                      <li>
                        Pulls from <code>search_term_view</code> +{" "}
                        <code>geographic_view</code> → per-keyword / per-geo
                        data, no product feed required
                      </li>
                      <li>
                        Suggested bid adjustments use conversion rate
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* "Back to top" hint when scrolled — purely visual */}
            <div className="text-center text-xs text-gray-400 pt-2">
              <ChevronUp className="w-4 h-4 inline" /> Scroll up to switch
              tracks anytime
            </div>

            {/* Modal: select an account first */}
            <Dialog
              open={showAccountPrompt}
              onOpenChange={setShowAccountPrompt}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    Pick a Google Ads account first
                  </DialogTitle>
                  <DialogDescription className="pt-2">
                    This tool needs to know which Google Ads account to
                    analyze. Open the account dropdown at the top of the page
                    and choose one — then click the tool again.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    onClick={() => setShowAccountPrompt(false)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Got it
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      }}
    </DashboardShell>
  );
};

export default DashboardHome;
