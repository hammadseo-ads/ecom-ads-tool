// Manual Ecommerce Website CRO Audit guide.
// Static (no Google Ads connection needed) — user reads each section, looks at
// reference screenshots, and audits their own site against the checklist.
// Mirrors the design language of the other guide pages (CampaignStructureGuide etc.)
// — green primary palette, occasional red/yellow accents, no purples.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import SEO from '@/components/SEO';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Search,
  Smartphone,
  MessageSquare,
  Image as ImageIcon,
  Star,
  Instagram,
  Layout,
  PlayCircle,
  Sparkles,
} from "lucide-react";

interface AuditItem {
  id: string;
  text: string;
}

interface AuditSection {
  id: string;
  number: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  intro: string;
  whatToDoLabel?: string;
  items: AuditItem[];
  whyItMatters: string;
  images: { src: string; caption: string }[];
  extraNote?: { label: string; href?: string; text: string };
}

const sections: AuditSection[] = [
  {
    id: "section-1",
    number: "01",
    title: "Top Banners — First Impression",
    icon: Layout,
    intro:
      "The banner is the very first thing a visitor sees. It must instantly communicate a strong, attractive offer that pulls the audience in.",
    items: [
      {
        id: "1-1",
        text: "Place a leaderboard / web banner at the top of the homepage with your strongest active offer.",
      },
      {
        id: "1-2",
        text: "Lead with the offer the audience finds most attractive (discount %, free shipping, bundle deal, limited-time deal).",
      },
      {
        id: "1-3",
        text: "Keep the message short, bold, and scannable — one clear headline + one CTA button.",
      },
      {
        id: "1-4",
        text: "Pair the banner with a supporting visual that matches the offer (product shot, lifestyle image, or seasonal theme).",
      },
    ],
    whyItMatters:
      "Visitors decide within seconds whether to stay or leave. A high-impact banner with a real offer keeps them engaged long enough to start browsing.",
    images: [
      { src: "/lovable-uploads/cro-audit/banner-1.png", caption: "Leaderboard web banner — example 1" },
      { src: "/lovable-uploads/cro-audit/banner-2.png", caption: "Leaderboard web banner — example 2" },
      { src: "/lovable-uploads/cro-audit/banner-3.png", caption: "Leaderboard web banner — example 3" },
    ],
  },
  {
    id: "section-2",
    number: "02",
    title: "Smart Search",
    icon: Search,
    intro:
      "Once the visitor lands, search is one of the next things they reach for — especially on stores with many products. The default Shopify / store search isn't enough; we need a smart, suggestion-driven search.",
    items: [
      { id: "2-1", text: "Replace the default search with a smart search that shows live suggestions as the user types." },
      {
        id: "2-2",
        text: "Display top suggestions and best-selling products inside the search dropdown by default (even before the user types anything).",
      },
      { id: "2-3", text: "Show product images, prices, and quick links inside the suggestions — not just text." },
      { id: "2-4", text: "Include category and collection suggestions so users can jump straight to a section." },
      {
        id: "2-5",
        text: "Tools to consider: Searchanise, Algolia, Klevu, Boost AI Search. Final pick depends on platform and budget.",
      },
    ],
    whyItMatters:
      "Visitors who use search convert at a much higher rate than those who only browse — making the search smarter directly lifts revenue.",
    images: [
      { src: "/lovable-uploads/cro-audit/search-1.png", caption: "Smart search with product suggestions and best-sellers" },
    ],
  },
  {
    id: "section-3",
    number: "03",
    title: "Pop Up",
    icon: MessageSquare,
    intro:
      "A well-designed pop up captures the visitor's email or pushes them toward a first purchase. A weak pop up — text only, no visual — gets dismissed instantly.",
    items: [
      { id: "3-1", text: "Every pop up MUST contain an image — product shot, lifestyle visual, or offer graphic. No text-only pop ups." },
      { id: "3-2", text: "Every pop up MUST contain a clear offer (discount code, free shipping, gift, exclusive access)." },
      { id: "3-3", text: "Keep the headline short and benefit-led; one CTA button only." },
      { id: "3-4", text: "Trigger on intent (exit-intent or after ~10–15 seconds), not immediately on landing." },
      { id: "3-5", text: "Make it easy to close — a frustrating pop up hurts conversions more than it helps." },
    ],
    whyItMatters:
      "Pop ups with strong visuals + a real offer can dramatically increase email capture rate, building a list you can market to long after the visitor leaves.",
    images: [
      { src: "/lovable-uploads/cro-audit/popup-1.png", caption: "Pop up example 1 — image + offer" },
      { src: "/lovable-uploads/cro-audit/popup-2.png", caption: "Pop up example 2 — image + offer" },
    ],
  },
  {
    id: "section-4",
    number: "04",
    title: "Mobile Mega Menu",
    icon: Smartphone,
    intro:
      "Most stores build a mega menu for desktop and ignore mobile — but a large share of traffic is on mobile. A proper mobile mega menu makes the catalog discoverable instead of buried inside a basic hamburger list.",
    items: [
      { id: "4-1", text: "Build a dedicated mobile mega menu — don't just shrink the desktop one." },
      { id: "4-2", text: "Use collapsible categories with icons / thumbnails so users can scan visually." },
      { id: "4-3", text: "Highlight featured collections, new arrivals, or sale items at the top of the menu." },
      { id: "4-4", text: "Keep tap targets large and the menu fast to open / close." },
      { id: "4-5", text: "Include a search bar inside the menu itself for quick access." },
    ],
    whyItMatters:
      "Mobile users who can't navigate easily bounce within seconds. A real mobile mega menu directly improves engagement, time on site, and conversion.",
    images: [
      { src: "/lovable-uploads/cro-audit/mobilemenu-1.png", caption: "Mobile mega menu — example 1" },
      { src: "/lovable-uploads/cro-audit/mobilemenu-2.png", caption: "Mobile mega menu — example 2" },
      { src: "/lovable-uploads/cro-audit/mobilemenu-3.png", caption: "Mobile mega menu — example 3" },
    ],
  },
  {
    id: "section-5",
    number: "05",
    title: "Product Reviews (with Pictures & Video)",
    icon: Star,
    intro:
      "Reviews are the single strongest trust signal on an ecommerce site. They should not live only on product pages — they need to be visible everywhere the buyer makes a decision.",
    whatToDoLabel: "Where to place reviews + what kind to use",
    items: [
      { id: "5-1", text: "Home page — feature a few of the strongest, most credible reviews." },
      { id: "5-2", text: "Collection / category pages — show ratings on product cards and pull a featured review." },
      { id: "5-3", text: "Product pages — full review section + product-specific reviews." },
      { id: "5-4", text: "Cart page — reassurance reviews near the checkout button to reduce abandonment." },
      { id: "5-5", text: "Video reviews are the most powerful — prioritise them wherever possible." },
      { id: "5-6", text: "Reviews with photos / images come second." },
      { id: "5-7", text: "Written reviews work best when paired with a video or image, not on their own." },
      { id: "5-8", text: "On product pages, show product-specific reviews (not generic store reviews)." },
      { id: "5-9", text: "On home / collection pages, surface your top \"hero\" reviews — the most detailed, credible, and visual ones." },
    ],
    whyItMatters:
      "Buyers trust other buyers far more than brand copy. Video + photo reviews placed throughout the buying journey remove doubt at every step.",
    images: [
      { src: "/lovable-uploads/cro-audit/reviews-1.png", caption: "Reviews — example 1" },
      { src: "/lovable-uploads/cro-audit/reviews-2.png", caption: "Reviews — example 2" },
      { src: "/lovable-uploads/cro-audit/reviews-3.png", caption: "Reviews — example 3" },
    ],
  },
  {
    id: "section-6",
    number: "06",
    title: "Infographics & Videos in Product Gallery",
    icon: ImageIcon,
    intro:
      "The product gallery should not be plain product photos only. Mixing in infographics, demo videos, and UGC inside the gallery turns it into a mini sales page.",
    whatToDoLabel: "What to add inside the gallery",
    items: [
      { id: "6-1", text: "Infographics that explain features, dimensions, materials, or how the product works." },
      { id: "6-2", text: "Short product demo / how-to-use videos." },
      { id: "6-3", text: "UGC (User-Generated Content) — real customers using the product." },
      { id: "6-4", text: "Comparison images — \"with vs without\" or \"us vs competitor\" style visuals." },
      { id: "6-5", text: "Lifestyle shots showing the product in real-world context, not just on a white background." },
    ],
    whyItMatters:
      "People skim galleries before reading descriptions. Infographics and videos answer questions instantly and replace blocks of copy buyers would otherwise skip.",
    images: [
      { src: "/lovable-uploads/cro-audit/gallery-1.png", caption: "Infographics & video inside the product gallery" },
    ],
  },
  {
    id: "section-7",
    number: "07",
    title: "Instagram Embed on Website",
    icon: Instagram,
    intro:
      "An Instagram feed embedded on the site shows the brand is alive and active, generates social proof through UGC, and gives visitors another reason to follow.",
    items: [
      { id: "7-1", text: "Embed an Instagram feed section on the home page (typically above the footer)." },
      { id: "7-2", text: "Post strong videos consistently on Instagram so the embedded feed actually looks impressive — not empty or stale." },
      { id: "7-3", text: "Prioritise UGC and authority-building content (customer videos, behind the scenes, founder content)." },
      { id: "7-4", text: "Make every embedded post clickable — link to the IG profile or the relevant product." },
    ],
    whyItMatters:
      "An active embedded Instagram feed builds brand authority, grows social following from website traffic, and gives buyers fresh social proof every time they visit.",
    extraNote: {
      label: "Design reference",
      href: "https://webflow.com/templates/html/instagram-feed-cms",
      text: "More design inspiration for the Instagram section: Webflow Instagram Feed (cloneable)",
    },
    images: [
      { src: "/lovable-uploads/cro-audit/instagram-1.png", caption: "Instagram embed — example 1" },
      { src: "/lovable-uploads/cro-audit/instagram-2.png", caption: "Instagram embed — example 2" },
    ],
  },
];

export default function EcommerceCROAuditGuide() {
  const navigate = useNavigate();
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = (id: string) =>
    setCompletedItems((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const doneItems = Object.values(completedItems).filter(Boolean).length;
  const overallProgress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-green-50/30">
      <PublicHeader />
      <SEO
        title="Ecommerce Website CRO Audit — 7-Section Manual Checklist"
        description="A 7-section walkthrough of your eCommerce store in the order a real visitor experiences it — banners, search, popups, mobile menu, reviews, gallery, Instagram."
        ogType="article"
      />

      {/* Sticky progress sub-header */}
      <div
        className={`sticky top-0 z-30 transition-all duration-300 backdrop-blur ${
          isScrolled ? "bg-white/95 border-b border-emerald-100 shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="hidden sm:flex items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">Audit progress</span>
            <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="font-mono text-gray-700">{doneItems}/{totalItems}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-white">
          <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20 mb-4">
            <Sparkles className="w-3 h-3 mr-1" /> Manual Audit • No tools required
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Ecommerce Website CRO Audit
          </h1>
          <p className="text-base md:text-xl text-emerald-50/95 max-w-3xl mb-6">
            A 7-section walk-through of your store in the same order a real visitor experiences it —
            from the moment they land, through navigation and search, all the way to social proof
            and Instagram engagement. Each section explains{" "}
            <span className="font-semibold">what to add</span>,{" "}
            <span className="font-semibold">why it matters</span>, and shows reference screenshots.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50"
              onClick={() => scrollTo("section-1")}
            >
              <PlayCircle className="w-4 h-4 mr-2" /> Start the audit
            </Button>
          </div>
        </div>
      </section>

      {/* Section index */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-14 relative z-10">
        <Card className="border-emerald-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">7-section roadmap</CardTitle>
            <CardDescription>Click any section to jump straight to it.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {sections.map((s) => {
                const Icon = s.icon;
                const sectionDone = s.items.every((it) => completedItems[it.id]);
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all hover:shadow-md ${
                      sectionDone
                        ? "border-emerald-300 bg-emerald-50/50"
                        : "border-gray-200 bg-white hover:border-emerald-200"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        sectionDone
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {sectionDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-gray-500">{s.number}</div>
                      <div className="text-sm font-semibold text-gray-900 leading-tight">
                        {s.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Sections */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12 md:space-y-16">
        {sections.map((s) => {
          const Icon = s.icon;
          const sectionDone = s.items.filter((it) => completedItems[it.id]).length;
          return (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-md">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-mono text-emerald-700 font-semibold">
                    Section {s.number}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {s.title}
                  </h2>
                </div>
                <div className="hidden sm:block flex-shrink-0">
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                    {sectionDone}/{s.items.length} done
                  </Badge>
                </div>
              </div>

              <Card className="border-emerald-100 shadow-sm">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <p className="text-gray-700 leading-relaxed">{s.intro}</p>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {s.whatToDoLabel || "What to do"}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {s.items.map((item) => (
                        <label
                          key={item.id}
                          htmlFor={item.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            completedItems[item.id]
                              ? "bg-emerald-50/60 border-emerald-200"
                              : "bg-white border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30"
                          }`}
                        >
                          <Checkbox
                            id={item.id}
                            checked={!!completedItems[item.id]}
                            onCheckedChange={() => toggle(item.id)}
                            className="mt-0.5"
                          />
                          <span
                            className={`text-sm leading-relaxed ${
                              completedItems[item.id]
                                ? "text-gray-500 line-through"
                                : "text-gray-800"
                            }`}
                          >
                            {item.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {s.extraNote && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-900">
                        <span className="font-semibold">{s.extraNote.label}:</span>{" "}
                        {s.extraNote.href ? (
                          <a
                            href={s.extraNote.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-amber-400 hover:text-amber-700"
                          >
                            {s.extraNote.text}
                          </a>
                        ) : (
                          s.extraNote.text
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-emerald-900 mb-1">
                          Why it matters
                        </div>
                        <p className="text-sm text-emerald-900/90 leading-relaxed">
                          {s.whyItMatters}
                        </p>
                      </div>
                    </div>
                  </div>

                  {s.images.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-3">
                        Reference {s.images.length === 1 ? "screenshot" : "screenshots"}
                      </div>
                      <div
                        className={`grid gap-4 ${
                          s.images.length === 1
                            ? "grid-cols-1"
                            : s.images.length === 2
                            ? "grid-cols-1 md:grid-cols-2"
                            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        }`}
                      >
                        {s.images.map((img) => (
                          <figure
                            key={img.src}
                            className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                          >
                            <img
                              src={img.src}
                              alt={img.caption}
                              loading="lazy"
                              className="w-full h-auto block"
                            />
                            <figcaption className="px-3 py-2 text-xs text-gray-600 border-t border-gray-100 bg-gray-50">
                              {img.caption}
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          );
        })}

        {/* Footer CTA */}
        <section className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Done with the audit?
          </h2>
          <p className="text-emerald-50/95 mb-6 max-w-2xl mx-auto">
            Now run the data-driven analyses on your Google Ads — find the products and search
            terms that are eating budget, and the ones quietly making you money.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50"
              onClick={() => navigate("/dashboard")}
            >
              Open Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white bg-white/10 hover:bg-white/20"
              onClick={() => navigate("/guides")}
            >
              See more guides
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
