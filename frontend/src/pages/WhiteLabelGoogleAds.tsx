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
  Linkedin,
} from "lucide-react";

const CALENDLY_URL =
  "https://calendly.com/managingseo-hammad/client-management-and-meetings";

// Five sample explainer videos (the first-step CRO walkthroughs we send
// to a prospect's end client).
const SAMPLE_VIDEOS = [
  { id: "z0l5mKyJb2k", label: "Sample 1, CRO walkthrough" },
  { id: "DVGogrban_s", label: "Sample 2, CRO walkthrough" },
  { id: "XLVb_zvIZLY", label: "Sample 3, CRO walkthrough" },
  { id: "-vkPJTQLlNI", label: "Sample 4, CRO walkthrough" },
  { id: "IZsJ0PbPfoU", label: "Sample 5, CRO walkthrough" },
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
// Loads the actual iframe only when the user clicks, also a perf win.
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
      className="group absolute inset-0 w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400"
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
        <div className="w-[68px] h-[48px] rounded-[14px] bg-green-600 group-hover:bg-green-500 flex items-center justify-center shadow-lg shadow-green-900/40 transition-all group-hover:scale-110">
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
        <section className="relative isolate overflow-hidden py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          {/* Backdrop layers */}
          <div className="absolute inset-0 -z-10">
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
            {/* Animated emerald orbs */}
            <div
              aria-hidden
              className="absolute -top-32 -left-20 w-[28rem] h-[28rem] bg-green-500/30 rounded-full blur-3xl animate-orb-float"
            />
            <div
              aria-hidden
              className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] bg-green-400/20 rounded-full blur-3xl animate-orb-float"
              style={{ animationDelay: "4s" }}
            />
            <div
              aria-hidden
              className="absolute -bottom-24 left-1/3 w-80 h-80 bg-green-300/15 rounded-full blur-3xl animate-float"
              style={{ animationDelay: "2s" }}
            />
            {/* Faint grid pattern overlay */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto isolate">
            <div className="max-w-3xl">
              {/* Hero text */}
              <div className="text-white">
                <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-400/30 rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-green-100 mb-6">
                  <Handshake className="w-3.5 h-3.5" />
                  White Label Google Ads Partnership
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-6">
                  Upsell{" "}
                  <span className="relative inline-block">
                    <span
                      aria-hidden
                      className="absolute -inset-x-4 -inset-y-1 md:-inset-y-2 bg-green-400 -rotate-[1.5deg] -z-10 rounded-md"
                    />
                    <span className="relative text-green-950">
                      Google Ads &amp; CRO
                    </span>
                  </span>{" "}
                  to your eCommerce clients,{" "}
                  <span className="relative inline-block mt-2">
                    <span
                      aria-hidden
                      className="absolute -inset-x-4 -inset-y-1 md:-inset-y-2 bg-green-300 rotate-[-0.8deg] -z-10 rounded-md"
                    />
                    <span className="relative text-green-950">
                      without doing the work.
                    </span>
                  </span>
                </h1>
                <p className="text-base md:text-lg text-green-50/85 max-w-2xl mb-8 leading-relaxed">
                  You already have eCommerce clients. We deliver the Google
                  Ads, under your brand or ours, while you earn commission.
                  Every step gives the end client real value before they ever
                  pay anything.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-900/40 px-6"
                    onClick={bookCall}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book a partnership call
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/40 text-white bg-white/10 hover:bg-white/20 px-6"
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
            </div>
          </div>

          {/* Offer strip, reinforces the hero promise */}
          <div className="relative max-w-5xl mx-auto mt-14">
            <div className="rounded-2xl border border-green-400/25 bg-green-500/10 backdrop-blur-sm px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-3xl md:text-4xl font-black text-green-300 leading-none">50%</span>
                <span className="text-green-100/80 text-xs font-semibold uppercase tracking-widest leading-tight">
                  Your share,<br />no work
                </span>
              </div>
              <p className="text-green-50/90 text-sm md:text-[15px] leading-relaxed">
                Upsell Google Ads and CRO to your existing clients and keep{" "}
                <span className="font-semibold text-white">50% of the revenue</span>{" "}
                without doing the work. We are your white label team: we manage the
                quality and deliver the service under your brand. You just introduce
                the clients and we take it from there.
              </p>
            </div>
          </div>
        </section>

        {/* ===================== MEET THE FOUNDER ===================== */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
          {/* Soft background accent */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 pointer-events-none"
          >
            <div className="absolute top-1/3 -left-32 w-96 h-96 bg-green-100/60 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-50 rounded-full blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* PHOTO COLUMN */}
              <div className="lg:col-span-5 relative">
                <div className="relative max-w-md mx-auto lg:mx-0">
                  {/* Accent emerald block behind photo */}
                  <div
                    aria-hidden
                    className="absolute -top-3 -left-3 w-full h-full bg-green-500 rounded-2xl -rotate-2 -z-10"
                  />
                  {/* Photo frame */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-white">
                    <img
                      src="/lovable-uploads/ceo-hammad-cropped.jpg"
                      alt="Hammad, Founder, ManagingSEO"
                      className="w-full h-auto block"
                      loading="lazy"
                    />
                    {/* FOUNDER pill, top-left */}
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      Founder
                    </span>
                  </div>
                  {/* Floating credibility card */}
                  <div className="absolute -bottom-5 -right-3 lg:-right-6 bg-white rounded-xl shadow-xl border border-gray-100 px-4 py-3">
                    <div className="text-2xl font-black text-green-700 leading-none">
                      6<span className="text-base font-bold ml-0.5">yrs</span>
                    </div>
                    <div className="text-xs font-semibold text-gray-700 mt-1">
                      of digital marketing
                    </div>
                  </div>
                </div>
              </div>

              {/* TEXT COLUMN */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-[11px] font-bold uppercase tracking-[0.18em] rounded-full px-3 py-1.5 mb-5">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                  Meet the founder
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-6 relative isolate">
                  Hi, I'm{" "}
                  <span className="relative inline-block">
                    <span
                      aria-hidden
                      className="absolute -inset-x-3 -inset-y-1 md:-inset-y-2 bg-green-400 -rotate-[1.5deg] -z-10 rounded-md"
                    />
                    <span className="relative text-green-950">Hammad</span>
                  </span>
                  .
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed text-[15px] md:text-base">
                  <p>
                    I'm an engineer, a <strong>NUST graduate</strong>, so I've
                    always thought in numbers. When I moved into marketing,
                    people expected it to be a big switch. It wasn't. Good
                    marketing runs on the same thing engineering does: data. I
                    was already comfortable digging into the numbers, breaking
                    problems apart, and working out why competitors were
                    winning, so it just clicked.
                  </p>
                  <p>
                    I learned the work myself before I built a team around it,
                    and we still run <strong>Google Ads</strong> the way I
                    think, on logic, not gut feeling. Every account starts with
                    the data: we look at what's happening down to the product
                    and search-term level, cut the spend that's going nowhere,
                    and put more behind what's actually working. No autopilot,
                    no cookie-cutter setups. And we're honest about what we
                    promise, we only commit to a goal once the numbers say it's
                    realistic, so <strong>when we commit, we deliver</strong>.
                    Fewer clients, full attention, results that add up over
                    time.
                  </p>
                </div>

                <div className="mt-6 flex items-baseline gap-3 text-green-700">
                  <span className="font-serif italic text-2xl font-semibold">
                    Hammad
                  </span>
                  <span className="text-sm text-gray-500">
                    Founder, ManagingSEO
                  </span>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100"
                    onClick={bookCall}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book a partnership call
                  </Button>
                  <a
                    href="https://www.linkedin.com/in/sheikh-hammad-4045b4134/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-800 text-sm font-semibold px-5 py-2.5 rounded-md transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-[#0a66c2]" />
                    Connect on LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== HOW IT WORKS ===================== */}
        <section
          id="how-it-works"
          className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        >
          {/* Soft background mesh */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-200/40 rounded-full mix-blend-multiply filter blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-100/50 rounded-full mix-blend-multiply filter blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-14">
              <span className="inline-block bg-green-100 text-green-700 text-[11px] font-semibold uppercase tracking-widest rounded-full px-3 py-1 mb-3">
                The Process
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                This is how we convert your clients into customers
              </h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-base md:text-lg">
                We lead with value. You send us your client list, and we find who
                is running Google Ads and whose store is quietly losing sales.
                Then, before they commit to anything, we show them exactly where
                their money is leaking and how they can grow. The results do the
                convincing.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* Connecting dashed line on desktop */}
              <div className="hidden md:block absolute top-[88px] left-[16%] right-[16%] h-px -z-10">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-green-300 to-transparent" />
              </div>

              {[
                {
                  n: 1,
                  Icon: Sparkles,
                  tag: "CRO",
                  title: "A real CRO redesign, free",
                  body:
                    "We rebuild their store pages and show them a live, updated design, so they can see exactly how many more of their current visitors could become buyers. It is real proof, not a pitch, and it is where they realize the opportunity is genuine.",
                  deliverable: "A visual CRO redesign of their store",
                },
                {
                  n: 2,
                  Icon: TrendingUp,
                  tag: "Ads",
                  title: "A free Google Ads analysis",
                  body:
                    "Once they are interested, we ask only for view-only access to their Google Ads and run a full analysis. We show them exactly where budget is being wasted and how much they can save, and we walk them through all of it with no obligation.",
                  deliverable: "A wasted-spend and savings report",
                },
                {
                  n: 3,
                  Icon: Handshake,
                  tag: "Deliver",
                  title: "We convert and deliver, results first",
                  body:
                    "This is how the client converts, on value, not pressure. Before we start, we agree on the results to realistically expect and the timeframe, so nothing is promised that we cannot deliver. We only take on a client if we can genuinely help them.",
                  deliverable: "A clear, realistic results plan",
                },
              ].map((step) => {
                const Icon = step.Icon;
                return (
                  <div
                    key={step.n}
                    className="group relative bg-white/80 backdrop-blur-sm border border-green-100/80 rounded-2xl p-7 shadow-sm hover:shadow-2xl hover:shadow-green-100 hover:-translate-y-1 hover:border-green-300 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Giant faded background number */}
                    <div
                      aria-hidden
                      className="absolute -top-2 right-3 text-[110px] font-black text-green-100/80 leading-none select-none pointer-events-none group-hover:text-green-200/80 transition-colors"
                    >
                      0{step.n}
                    </div>

                    {/* Step pill */}
                    <div className="inline-flex w-fit items-center gap-2 bg-green-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5 relative shadow-sm">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      Step 0{step.n} · {step.tag}
                    </div>

                    {/* Icon tile */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-200 mb-4 relative group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 relative">
                      {step.title}
                    </h3>

                    <p className="text-sm text-gray-600 leading-relaxed mb-5 relative flex-grow">
                      {step.body}
                    </p>

                    {/* Deliverable strip */}
                    <div className="pt-4 mt-auto border-t border-green-100 relative">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-green-700/70 mb-1">
                        What you get
                      </div>
                      <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{step.deliverable}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upgraded "Why this works" callout */}
            <div className="mt-12 relative max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-2xl p-7 md:p-9 shadow-2xl shadow-green-200 text-white overflow-hidden">
                {/* Decorative dot pattern */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at center, white 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                  }}
                />
                {/* Soft accent orb */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

                <div className="relative flex flex-col md:flex-row gap-5">
                  <div className="flex-shrink-0">
                    <div className="bg-white/15 backdrop-blur-sm w-14 h-14 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-green-100 mb-2">
                      Why this works
                    </div>
                    <p className="text-green-50 leading-relaxed text-[15px]">
                      By this point the client has seen a better-converting store
                      design and a clear picture of the money their ads are
                      wasting, all before paying anything, so the decision makes
                      itself. We stay value-first the whole way. We only work with
                      a client if we can genuinely move the needle, never to
                      squeeze out a fee.{" "}
                      <span className="font-semibold text-white">
                        You introduce the client, we convert and deliver, and you
                        earn.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== STEP 1 DETAIL: CRO ===================== */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50/40 via-white to-green-50/40">
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
                    <Sparkles className="w-5 h-5 text-green-600" />
                    What we redesign on their site
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {CRO_POINTS.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    The 4 Google Ads analyses we preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ADS_ANALYSES.map((a) => {
                    const Icon = a.icon;
                    return (
                      <div key={a.title} className="flex items-start gap-3">
                        <div className="bg-green-100 rounded-lg w-9 h-9 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-green-700" />
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
                <div className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-2">
                  See it on a real client
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  10 CRO upgrades we ship on the store before the ads run
                </h3>
                <p className="text-gray-600 mt-3 max-w-3xl mx-auto">
                  Real before/after from a SleekPro Fitness redesign. Hover any tile
                  to see the before state, click to enlarge. Together these typically{" "}
                  <strong>double mobile conversion</strong>, raise{" "}
                  <strong>AOV 20–30%</strong>, and lift{" "}
                  <strong>Google Ads ROAS 30–50%</strong>,without spending one
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
                    before: "Basic search input, no suggestions, no product preview, no category shortcuts.",
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
                    noBeforeSub: "Buyers had to scroll back up to add, most never bothered",
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
                    after: "'See it in action' video + photo review grid, verified buyers with star ratings and caption snippets.",
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
                    before: "Standard PDP, no bundle suggestion. Customer buys 1 item and leaves.",
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
                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-green-300 transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
                          <img
                            src={s.afterImg}
                            alt={`${s.title} after`}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                          />
                          {s.noBefore ? (
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center px-6 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
                              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            />
                          )}
                          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-green-600 text-white px-2 py-0.5 rounded-full shadow-sm group-hover:hidden">
                            After
                          </span>
                          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-white/95 text-gray-700 px-2 py-0.5 rounded-full shadow-sm hidden group-hover:inline-block">
                            Before
                          </span>
                          <span className="absolute top-2 right-2 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
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
                          <p className="text-sm text-green-800 flex gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>
                              <span className="font-semibold">After:</span> {s.after}
                            </span>
                          </p>
                        </div>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl w-[95vw] p-0 bg-white max-h-[92vh] overflow-y-auto">
                      <DialogTitle className="sr-only">
                        {s.title},before and after
                      </DialogTitle>
                      <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <div className="text-[11px] font-bold uppercase tracking-widest text-green-700 mb-1">
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
                          <div className="text-[11px] font-bold uppercase tracking-widest text-green-700 mb-3">
                            After
                          </div>
                          <img
                            src={s.afterImg}
                            alt={`${s.title} after`}
                            className="w-full h-auto rounded-md border border-green-100"
                          />
                          <p className="text-sm text-green-900 mt-3 flex gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>{s.after}</span>
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
              <p className="text-center text-xs text-gray-500 mt-8">
                Hover any tile to flip back to the before, click to enlarge the full comparison.
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
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50/40 via-white to-green-50/40">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Real Step-1 walkthroughs we've sent
              </h2>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                Five actual CRO analysis videos we recorded for prospects'
                end clients. This is the value they get before paying anything.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
              {SAMPLE_VIDEOS.map((v) => (
                <div
                  key={v.id}
                  className="rounded-xl overflow-hidden shadow-lg border border-green-100 bg-black"
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
                  className="group cursor-pointer hover:shadow-lg hover:border-green-400 border-2 transition-all overflow-hidden"
                  onClick={() => navigate(c.slug)}
                >
                  {/* After by default, swap to Before on hover */}
                  <div className="relative w-full aspect-[16/10] bg-gray-50 overflow-hidden">
                    <img
                      src={c.after}
                      alt={`${c.name} after`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                    />
                    <img
                      src={c.before}
                      alt={`${c.name} before`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide bg-green-600 text-white px-2 py-0.5 rounded-full shadow-sm group-hover:hidden">
                      After
                    </span>
                    <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide bg-white/90 text-gray-700 px-2 py-0.5 rounded-full shadow-sm hidden group-hover:inline-block">
                      Before
                    </span>
                    {/* Hover CTA, appears over the image on hover */}
                    <div className="absolute inset-x-0 bottom-0 p-3 flex items-end justify-center pointer-events-none">
                      <span className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        Open case study
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6 text-center">
                    <Badge className="mb-3">{c.name}</Badge>
                    <div className="text-xl font-bold text-green-700 mb-1">
                      {c.result}
                    </div>
                    <div className="text-xs text-green-700 flex items-center justify-center gap-1 mt-3 group-hover:text-green-800 transition-colors">
                      View case study <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== COMMISSION / CTA ===================== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-green-800 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-green-200" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              You introduce. We deliver. You earn.
            </h2>
            <p className="text-green-50/95 text-lg mb-8">
              Run it under your brand or ours, your choice. Book a call and
              we'll walk through the partnership, the commission structure, and
              how the first client onboarding works.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-white text-green-700 hover:bg-green-50"
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
