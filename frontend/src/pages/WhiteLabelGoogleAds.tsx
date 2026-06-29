// White Label Google Ads Services, private pitch landing page.
//
// Audience: agencies / freelancers who have eCommerce clients but do NOT
// offer Google Ads themselves. Goal: convince them to upsell Google Ads
// (white-label, commission-based) through ManagingSEO.
//
// IMPORTANT: noindex. This page is shared by direct link only.
//
// Reuses the site's existing emerald theme + the /google-ads-service hero
// structure. Footer is rendered globally by App.tsx, so this page does NOT
// render its own (avoids the double-footer the user reported).

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageModal } from "@/components/ui/image-modal";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PublicHeader from "@/components/PublicHeader";
import SEO from "@/components/SEO";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  PlayCircle,
  Search,
  ShoppingBag,
  MapPin,
  Clock,
  FileSpreadsheet,
  Sparkles,
  TrendingUp,
  Handshake,
  DollarSign,
  XCircle,
  ZoomIn,
} from "lucide-react";

const CALENDLY_URL =
  "https://calendly.com/managingseo-hammad/client-management-and-meetings";

// Main video-sales-letter at the top. Set the YouTube ID once recorded.
// Leave null to render the "coming soon" placeholder.
const MAIN_VSL_YOUTUBE_ID: string | null = null;

// Three sample explainer videos (the first-step CRO walkthroughs we send
// to a prospect's end client).
const SAMPLE_VIDEOS = [
  { id: "z0l5mKyJb2k", label: "Sample 1, CRO walkthrough" },
  { id: "DVGogrban_s", label: "Sample 2, CRO walkthrough" },
  { id: "XLVb_zvIZLY", label: "Sample 3, CRO walkthrough" },
];

// Tool screenshots reused from the /ads-tool InsightsShowcase.
const TOOL_SHOTS = [
  {
    src: "/lovable-uploads/7b5d0b34-de21-447a-805b-d3d6ea0dcf6e.png",
    caption: "Profitable vs wasted vs untapped budget, at a glance",
  },
  {
    src: "/lovable-uploads/6d251a5e-5fcc-42c4-a3bd-62fc2d22ef0b.png",
    caption: "Every product bucketed: Profitable / Costly / Zero-Conv / Zombie",
  },
  {
    src: "/lovable-uploads/318c95cd-134c-4066-a3df-da5a7296c95c.png",
    caption: "Granular per-product performance, filterable by campaign",
  },
];

// CRO improvements we visually show the end client (their site, redesigned).
const CRO_POINTS = [
  "Entry discount pop-up for first-time visitors",
  "Mobile mega-menu for fast catalog navigation",
  "Advanced, suggestion-driven site search",
  "Moving homepage banner highlighting unique selling points",
  "Sticky Add-to-Cart button on the product page (appears on scroll)",
  "Instagram / user-generated content embedded on the homepage",
  "Video and photo reviews on homepage and collection pages",
  "Lifestyle images (and video where possible) on collection pages",
  "Advanced: product-page bundles and upsells",
  "Advanced: related-product recommendations on product pages",
];

// The 4 Google Ads analyses we pitch inside the video.
const ADS_ANALYSES = [
  {
    icon: ShoppingBag,
    title: "Budget Wastage by Products",
    body: "Our tool analyzes every product and shows exactly which ones are draining Google Ads budget with no return, so spend moves to what actually sells.",
  },
  {
    icon: FileSpreadsheet,
    title: "Negative Keywords & Titles",
    body: "A Claude-powered analysis of the search-term report that surfaces the negative keywords to add, cutting spend on searches that never convert.",
  },
  {
    icon: MapPin,
    title: "Geographic Performance",
    body: "Find the zip codes and regions where sales are strongest, so budget gets concentrated where it produces the most revenue.",
  },
  {
    icon: Clock,
    title: "Heat Map Analysis",
    body: "Particularly for Search campaigns: see the hours and days that convert best and weight bids toward them.",
  },
];

// Clean YouTube embed: shows just the video thumbnail with our own red play
// button (no profile, no "Watch on YouTube" bar, no related chrome).
// Loads the actual iframe only when the user clicks — also a perf win.
const LiteYouTube = ({ id, title }: { id: string; title: string }) => {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        frameBorder={0}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title}`}
      className="group absolute inset-0 w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
    >
      <img
        src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
        alt={title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.src.endsWith("/hqdefault.jpg")) {
            img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
          }
        }}
      />
      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/15 transition-colors" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[68px] h-[48px] rounded-[14px] bg-[#cc0000] group-hover:bg-[#ff0000] flex items-center justify-center shadow-lg transition-all group-hover:scale-110">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-7 h-7 text-white ml-1"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  );
};

const WhiteLabelGoogleAds = () => {
  const navigate = useNavigate();
  const bookCall = () => window.open(CALENDLY_URL, "_blank");

  return (
    <>
      <PublicHeader />
      <SEO
        title="White Label Google Ads Services for Agencies | ManagingSEO"
        description="Upsell Google Ads to your eCommerce clients without doing the work yourself. We deliver white-label Google Ads under your brand or ours, you earn commission."
        ogType="website"
        noindex
      />

      <div className="min-h-screen bg-background">
        {/* ===================== HERO ===================== */}
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
              <Handshake className="w-3.5 h-3.5" />
              White Label Partnership
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Upsell Google Ads to your eCommerce clients,{" "}
              <span className="text-emerald-300">without doing the work.</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-50/90 max-w-3xl mx-auto mb-8">
              You already have eCommerce clients. We deliver the Google Ads,
              under your brand or ours, while you earn commission. Every step
              gives the end client real value before they ever pay anything.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                onClick={bookCall}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book a partnership call
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white bg-white/10 hover:bg-white/20"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See how it works
              </Button>
            </div>
          </div>
        </section>

        {/* ===================== MAIN VIDEO ===================== */}
        <section className="py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-emerald-50/40 to-emerald-100/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Watch this first
              </h2>
              <p className="text-gray-600 mt-2">
                The full partnership model in a few minutes.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-xl border border-emerald-100 bg-black aspect-video">
              {MAIN_VSL_YOUTUBE_ID ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${MAIN_VSL_YOUTUBE_ID}?autoplay=1&mute=1&rel=0`}
                  title="White Label Partnership Overview"
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-emerald-100/80 gap-3">
                  <PlayCircle className="w-14 h-14" />
                  <p className="text-sm">Overview video coming soon</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===================== HOW IT WORKS ===================== */}
        <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 mb-3">
                The Process
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Three steps, value at every one
              </h2>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                We never walk into the end client empty-handed. Each step
                delivers something useful before any commitment.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 border-emerald-100">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-emerald-600 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold">
                      1
                    </span>
                    <CardTitle className="text-xl">Free CRO analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 leading-relaxed space-y-2">
                  <p>
                    We analyze the end client's store and record a video that
                    visually redesigns their pages, showing exactly how to
                    convert more of their current visitors into sales.
                  </p>
                  <p>
                    In the same video we preview four Google Ads analyses our
                    software can run to find wasted budget.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-100">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-emerald-600 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold">
                      2
                    </span>
                    <CardTitle className="text-xl">Deep Ads analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 leading-relaxed space-y-2">
                  <p>
                    Once they're interested, we take read-only Google Ads
                    access and do a full account analysis, finding exactly
                    where budget is being wasted and where the opportunity is.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-100">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-emerald-600 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold">
                      3
                    </span>
                    <CardTitle className="text-xl">The growth plan</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 leading-relaxed space-y-2">
                  <p>
                    We hand them a clear plan that will actually generate
                    sales. They can have us execute it, or implement it
                    themselves. Either way they win, and you earn commission
                    on the ones we run.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-r-lg max-w-4xl mx-auto">
              <p className="text-sm text-emerald-900/90 leading-relaxed">
                <strong>Why this works:</strong> the end client receives
                genuine value at every step, a CRO redesign, a detailed Google
                Ads audit, and a concrete growth plan, before any money
                changes hands. By the time we propose execution, trust is
                already built. You introduce the client; we close and deliver;
                you earn.
              </p>
            </div>
          </div>
        </section>

        {/* ===================== STEP 1 DETAIL: CRO ===================== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50/40 via-white to-emerald-50/40">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Step 1, the free CRO analysis
              </h2>
              <p className="text-gray-600 mt-3 max-w-3xl mx-auto">
                We keep the client's current traffic exactly as it is, and show
                them how to convert more of it. Visually, on their own pages,
                not just described in words.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    What we redesign on their site
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {CRO_POINTS.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    The 4 Google Ads analyses we preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ADS_ANALYSES.map((a) => {
                    const Icon = a.icon;
                    return (
                      <div key={a.title} className="flex items-start gap-3">
                        <div className="bg-emerald-100 rounded-lg w-9 h-9 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900">{a.title}</h4>
                          <p className="text-sm text-gray-600 leading-snug">{a.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* CRO redesign screenshots, embedded showcase */}
            <div className="mt-14">
              <div className="text-center mb-8">
                <div className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">
                  See it on a real client
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  10 CRO upgrades we ship on the store before the ads run
                </h3>
                <p className="text-gray-600 mt-3 max-w-3xl mx-auto">
                  Real before/after from a SleekPro Fitness redesign. Hover any tile
                  to see the after, click to enlarge. Together these typically{" "}
                  <strong>double mobile conversion</strong>, raise{" "}
                  <strong>AOV 20–30%</strong>, and lift{" "}
                  <strong>Google Ads ROAS 30–50%</strong> — without spending one
                  extra dollar on ads.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    n: "01",
                    title: "Entry discount pop-up",
                    before: "No pop-up on the live site. First-time visitors leave with no incentive to come back.",
                    after: "Premium popup auto-shows in 2 seconds: 15% off + email capture + trust strip. Builds the remarketing list.",
                    beforeImg: "",
                    afterImg: "/lovable-uploads/sleekpro-cro/01-popup-after.webp",
                    noBefore: true,
                    noBeforeHeading: "No pop-up on the live site",
                    noBeforeSub: "First-time visitors left with no incentive to return",
                  },
                  {
                    n: "02",
                    title: "Mobile mega-menu",
                    before: "Text-only hamburger. Customer reads every link to find what they want.",
                    after: "Image-tile drawer with featured banner + visual category cards + quick CTAs.",
                    beforeImg: "/lovable-uploads/sleekpro-cro/02-mobile-menu-before.webp",
                    afterImg: "/lovable-uploads/sleekpro-cro/02-mobile-menu-after.webp",
                  },
                  {
                    n: "03",
                    title: "Suggestion-driven search",
                    before: "Basic search input — no suggestions, no product preview, no category shortcuts.",
                    after: "Category dropdown + autocomplete with trending searches, top products with images & prices, category links.",
                    beforeImg: "/lovable-uploads/sleekpro-cro/03-search-before.webp",
                    afterImg: "/lovable-uploads/sleekpro-cro/03-search-after.webp",
                  },
                  {
                    n: "04",
                    title: "Moving USP banner",
                    before: "Static announcement bar with a single message. No USPs visible above the fold.",
                    after: "Animated USP marquee: shipping · returns · squat-proof guarantee · 4-way stretch · 12,000 reviews.",
                    beforeImg: "/lovable-uploads/sleekpro-cro/04-usp-banner-before.webp",
                    afterImg: "/lovable-uploads/sleekpro-cro/04-usp-banner-after.webp",
                  },
                  {
                    n: "05",
                    title: "Sticky add-to-cart (mobile)",
                    before: "No sticky add-to-cart on mobile. Buyers had to scroll all the way back up every time they wanted to add.",
                    after: "Sticky bottom bar with image + price + ATC, pinned no matter how far the buyer scrolls.",
                    beforeImg: "",
                    afterImg: "/lovable-uploads/sleekpro-cro/05-sticky-atc-after.webp",
                    noBefore: true,
                    noBeforeHeading: "No sticky add-to-cart on mobile",
                    noBeforeSub: "Buyers had to scroll back up to add — most never bothered",
                  },
                  {
                    n: "06",
                    title: "Instagram / UGC on homepage",
                    before: "No Instagram or customer-photo section on the homepage. Real-people social proof was missing.",
                    after: "#SleekProArmy 6-photo Instagram grid with @handles + 'Shop the look' overlay. Real customers in your gear.",
                    beforeImg: "",
                    afterImg: "/lovable-uploads/sleekpro-cro/06-instagram-after.webp",
                    noBefore: true,
                    noBeforeHeading: "No Instagram or customer-photo section",
                    noBeforeSub: "Homepage had zero real-people social proof",
                  },
                  {
                    n: "07",
                    title: "Video + photo reviews",
                    before: "No video or photo reviews on the homepage. Trust-building was entirely text-based.",
                    after: "'See it in action' video + photo review grid — verified buyers with star ratings and caption snippets.",
                    beforeImg: "",
                    afterImg: "/lovable-uploads/sleekpro-cro/07-reviews-after.webp",
                    noBefore: true,
                    noBeforeHeading: "No video or photo reviews",
                    noBeforeSub: "Trust-building was entirely text-based",
                  },
                  {
                    n: "08",
                    title: "Lifestyle on collection pages",
                    before: "Collection page is a plain product grid. No visual context for how the product looks in use.",
                    after: "Lifestyle banner + filter sidebar (color swatches & sizes) + product cards with color options and reviews.",
                    beforeImg: "/lovable-uploads/sleekpro-cro/08-lifestyle-before.webp",
                    afterImg: "/lovable-uploads/sleekpro-cro/08-lifestyle-after.webp",
                  },
                  {
                    n: "09",
                    title: "PDP bundles & upsells",
                    before: "Standard PDP — no bundle suggestion. Customer buys 1 item and leaves.",
                    after: "'Frequently bought together' bundle: 3 products + Save 15% CTA. Pushes AOV up immediately.",
                    beforeImg: "/lovable-uploads/sleekpro-cro/09-bundles-before.webp",
                    afterImg: "/lovable-uploads/sleekpro-cro/09-bundles-after.webp",
                  },
                  {
                    n: "10",
                    title: "Related-product recommendations",
                    before: "PDP ends at the product description. No cross-sell, no recently-viewed, no 'complete the look'.",
                    after: "Three rails: 'Perfect with this set' (stylist picks) + 'Recommended for you' + 'Recently viewed'.",
                    beforeImg: "/lovable-uploads/sleekpro-cro/10-related-before.webp",
                    afterImg: "/lovable-uploads/sleekpro-cro/10-related-after.webp",
                  },
                ].map((s) => (
                  <Dialog key={s.n}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
                          {s.noBefore ? (
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-300 group-hover:opacity-0">
                              <XCircle className="w-10 h-10 text-gray-400 mb-2" />
                              <div className="text-sm font-bold text-gray-700">
                                {s.noBeforeHeading}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {s.noBeforeSub}
                              </div>
                            </div>
                          ) : (
                            <img
                              src={s.beforeImg}
                              alt={`${s.title} before`}
                              loading="lazy"
                              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                            />
                          )}
                          <img
                            src={s.afterImg}
                            alt={`${s.title} after`}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          />
                          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-white/95 text-gray-700 px-2 py-0.5 rounded-full shadow-sm group-hover:hidden">
                            Before
                          </span>
                          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-sm hidden group-hover:inline-block">
                            After
                          </span>
                          <span className="absolute top-2 right-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            {s.n} / 10
                          </span>
                          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIn className="w-3 h-3" />
                            Click to enlarge
                          </span>
                        </div>
                        <div className="p-5">
                          <h4 className="font-semibold text-gray-900 mb-2">{s.title}</h4>
                          <p className="text-sm text-gray-500 mb-2">
                            <span className="font-semibold text-gray-700">Before:</span>{" "}
                            {s.before}
                          </p>
                          <p className="text-sm text-emerald-800 flex gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                            <span>
                              <span className="font-semibold">After:</span> {s.after}
                            </span>
                          </p>
                        </div>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl w-[95vw] p-0 bg-white max-h-[92vh] overflow-y-auto">
                      <DialogTitle className="sr-only">
                        {s.title} — before and after
                      </DialogTitle>
                      <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-1">
                          {s.n} / 10
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                          {s.title}
                        </h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-px bg-gray-200">
                        <div className="bg-white p-5">
                          <div className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                            Before
                          </div>
                          {s.noBefore ? (
                            <div className="aspect-[16/10] w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex flex-col items-center justify-center px-6 text-center">
                              <XCircle className="w-14 h-14 text-gray-400 mb-3" />
                              <div className="text-base font-bold text-gray-700">
                                {s.noBeforeHeading}
                              </div>
                              <div className="text-sm text-gray-500 mt-1 max-w-sm">
                                {s.noBeforeSub}
                              </div>
                            </div>
                          ) : (
                            <img
                              src={s.beforeImg}
                              alt={`${s.title} before`}
                              className="w-full h-auto rounded-md border border-gray-100"
                            />
                          )}
                          <p className="text-sm text-gray-600 mt-3">{s.before}</p>
                        </div>
                        <div className="bg-white p-5">
                          <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-3">
                            After
                          </div>
                          <img
                            src={s.afterImg}
                            alt={`${s.title} after`}
                            className="w-full h-auto rounded-md border border-emerald-100"
                          />
                          <p className="text-sm text-emerald-900 mt-3 flex gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                            <span>{s.after}</span>
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
              <p className="text-center text-xs text-gray-500 mt-8">
                Hover any tile to see the after — click to enlarge the full comparison.
              </p>
            </div>
          </div>
        </section>

        {/* ===================== TOOL SCREENSHOTS ===================== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                The software behind the audit
              </h2>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                Our own analytics platform turns a client's Google Ads data
                into a clear picture of where budget is wasted, in minutes.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {TOOL_SHOTS.map((shot) => (
                <Card key={shot.src} className="overflow-hidden">
                  <div className="bg-white border-b">
                    <ImageModal
                      src={shot.src}
                      alt={shot.caption}
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: "260px" }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">{shot.caption}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== SAMPLE VIDEOS ===================== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50/40 via-white to-emerald-50/40">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Real Step-1 walkthroughs we've sent
              </h2>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                Three actual CRO analysis videos we recorded for prospects'
                end clients. This is the value they get before paying anything.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {SAMPLE_VIDEOS.map((v) => (
                <div
                  key={v.id}
                  className="rounded-xl overflow-hidden shadow-lg border border-emerald-100 bg-black"
                >
                  <div className="relative aspect-video">
                    <LiteYouTube id={v.id} title={v.label} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== CASE STUDIES ===================== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Proof: eCommerce results we've delivered
              </h2>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                Real client outcomes. Open any case study for the full story.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "MyGreenScape",
                  result: "+386% Conv Value",
                  slug: "/portfolio/mygreen-scape",
                  before: "/lovable-uploads/mygreenscape-before.png",
                  after: "/lovable-uploads/mygreenscape-after.png",
                },
                {
                  name: "PJ BOLD",
                  result: "+187% Conv Value",
                  slug: "/portfolio/pj-bold",
                  before: "/lovable-uploads/pjbold-before.png",
                  after: "/lovable-uploads/pjbold-after.png",
                },
                {
                  name: "Mathfel",
                  result: "+114% Sales",
                  slug: "/portfolio/mathfel",
                  before: "/lovable-uploads/f98890e1-3214-4382-9212-ecf6f2a2f131.png",
                  after: "/lovable-uploads/8c4028f7-578f-4074-a480-7bc2da933083.png",
                },
                {
                  name: "TopTiny",
                  result: "$67k/mo at 9x ROAS",
                  slug: "/portfolio/toptiny",
                  before: "/lovable-uploads/cc006e3d-826d-4336-b314-c72725d9246a.png",
                  after: "/lovable-uploads/46e6f842-7aa8-4445-8cdb-31157bc0cb2c.png",
                },
              ].map((c) => (
                <Card
                  key={c.slug}
                  className="group cursor-pointer hover:shadow-lg hover:border-emerald-400 border-2 transition-all overflow-hidden"
                  onClick={() => navigate(c.slug)}
                >
                  {/* Before / After swap on hover */}
                  <div className="relative w-full aspect-[16/10] bg-gray-50 overflow-hidden">
                    <img
                      src={c.before}
                      alt={`${c.name} before`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                    />
                    <img
                      src={c.after}
                      alt={`${c.name} after`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide bg-white/90 text-gray-700 px-2 py-0.5 rounded-full shadow-sm group-hover:hidden">
                      Before
                    </span>
                    <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-sm hidden group-hover:inline-block">
                      After
                    </span>
                  </div>
                  <CardContent className="p-6 text-center">
                    <Badge className="mb-3">{c.name}</Badge>
                    <div className="text-xl font-bold text-emerald-700 mb-1">
                      {c.result}
                    </div>
                    <div className="text-xs text-emerald-700 flex items-center justify-center gap-1 mt-3">
                      View case study <ArrowRight className="w-3 h-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== COMMISSION / CTA ===================== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-emerald-200" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              You introduce. We deliver. You earn.
            </h2>
            <p className="text-emerald-50/95 text-lg mb-8">
              Run it under your brand or ours, your choice. Book a call and
              we'll walk through the partnership, the commission structure, and
              how the first client onboarding works.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50"
                onClick={bookCall}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book a partnership call
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white bg-white/10 hover:bg-white/20"
                onClick={() => navigate("/portfolio")}
              >
                See all case studies
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default WhiteLabelGoogleAds;
