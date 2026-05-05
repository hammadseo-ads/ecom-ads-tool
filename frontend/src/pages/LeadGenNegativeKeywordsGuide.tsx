// Lead-Gen Negative Keywords workflow guide.
//
// Mirrors NegativeKeywordsAndTitlesGuide.tsx structurally but is built for
// lead-gen accounts:
//   Part 1 — pull last 30 days of search-term data per campaign
//   Part 2 — run that data through the lead-gen Claude skill (combined
//            with your landing-page content) to get a tuned negatives list
//   Part 3 — apply the negatives in Google Ads
//
// Three deliberate placeholders waiting for content from the user:
//   * The Claude .skill file (download button is a placeholder)
//   * Reference screenshots (none included yet)
//   * The exact prompt text (placeholder string)

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import SEO from "@/components/SEO";
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
  Lightbulb,
  Download,
  FileSpreadsheet,
  Sparkles,
  Search,
  PlayCircle,
  AlertCircle,
} from "lucide-react";

// =====================================================================
// SKILL ASSETS
// =====================================================================
const SKILL_FILE_HREF: string | null =
  "/lovable-uploads/skills/lead-gen-negative-keywords.skill";
const SKILL_FILE_NAME = "lead-gen-negative-keywords.skill";
// Prompt text — will be wired in once the user provides it. Until then,
// the prompt block stays hidden on the page.
const SKILL_PROMPT_TEXT: string | null = null;

interface Step {
  id: string;
  text: string;
}
interface Part {
  id: string;
  number: string;
  title: string;
  intro: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: Step[];
  outcome?: string;
}

const parts: Part[] = [
  {
    id: "part-1",
    number: "01",
    title: "Pull your last 30 days of search-term data",
    intro:
      "You can either download the file straight from Google Ads UI, or use our built-in extractor inside the dashboard (recommended — it gives you the data in the exact shape the skill expects).",
    icon: Search,
    steps: [
      {
        id: "1-1",
        text: "Sign in to Ecom Ads by ManagingSEO and connect your Google Ads account if you haven't already.",
      },
      {
        id: "1-2",
        text: 'Go to Dashboard → Lead Generation → "Budget Wastage by Keywords" and run the analysis for the last 30 days.',
      },
      {
        id: "1-3",
        text: "Click \"Export CSV\" on the results page. That file is ready to feed into Claude.",
      },
      {
        id: "1-4",
        text: "Alternative (manual): in Google Ads, Campaigns → Insights and Reports → Search Terms → Last 30 days → All campaigns → Download as Excel.",
      },
    ],
  },
  {
    id: "part-2",
    number: "02",
    title: "Run the lead-gen analysis in Claude",
    intro:
      "Upload the search-term file to Claude along with the lead-gen-negative-keywords skill. Tell Claude where your landing pages live so the skill can read them and judge which queries are actually relevant to what you sell.",
    icon: Sparkles,
    steps: [
      {
        id: "2-1",
        text: 'Download the "lead-gen-negative-keywords" skill (button below) and upload it to your Claude skills (Settings → Skills → Add).',
      },
      {
        id: "2-2",
        text: "Open a new Claude chat. Attach the search-term CSV/Excel file you exported in Part 1.",
      },
      {
        id: "2-3",
        text: "Paste the prompt shown below. Replace [landing-page-urls] with a comma-separated list of YOUR landing pages (e.g. https://yoursite.com/services, https://yoursite.com/contact).",
      },
      {
        id: "2-4",
        text: "Claude reads your landing pages, understands what you actually sell, then classifies every search term as Relevant / Probably-Negative / Definitely-Negative based on your business — not generic templates.",
      },
    ],
    outcome:
      "Two outputs: (1) a ready-to-apply negative-keywords list (CSV/Excel), and (2) a short summary explaining which themes to exclude and why.",
  },
  {
    id: "part-3",
    number: "03",
    title: "Apply the negatives in Google Ads",
    intro:
      "Use Google Ads' bulk-upload negative-keyword tool. Apply at the shared-library level so the negatives cover every campaign at once.",
    icon: CheckCircle,
    steps: [
      { id: "3-1", text: "Open Google Ads → Tools → Shared Library → Negative keyword lists." },
      {
        id: "3-2",
        text: "Create a new list (or add to your existing master list). Paste the negatives from Claude's output. Apply the list to all relevant campaigns.",
      },
      {
        id: "3-3",
        text: "Re-run our Wasted Keywords tool in 30 days. The newly negative-ed terms should disappear; you'll see how much spend you saved.",
      },
    ],
  },
];

export default function LeadGenNegativeKeywordsGuide() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = (id: string) =>
    setCompleted((p) => ({ ...p, [id]: !p[id] }));

  const totalSteps = parts.reduce((s, p) => s + p.steps.length, 0);
  const doneSteps = Object.values(completed).filter(Boolean).length;
  const progress =
    totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-green-50/30">
      <PublicHeader />
      <SEO
        title="Lead-Gen Negative Keywords — Google Ads + Claude Workflow"
        description="Step-by-step workflow for lead-generation accounts: pull 30 days of search-term data, run it through our Claude skill (combined with your landing pages), and get back a negative-keywords list tuned to your actual business."
        ogType="article"
      />

      {/* Sticky progress sub-header */}
      <div
        className={`sticky top-0 z-30 transition-all duration-300 backdrop-blur ${
          isScrolled
            ? "bg-white/95 border-b border-emerald-100 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="hidden sm:flex items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">Progress</span>
            <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-gray-700">
              {doneSteps}/{totalSteps}
            </span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-white">
          <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20 mb-4">
            <Sparkles className="w-3 h-3 mr-1" /> Lead Gen workflow • 3 parts
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Negative Keywords for Lead Generation
          </h1>
          <p className="text-base md:text-xl text-emerald-50/95 max-w-3xl mb-6">
            Pull 30 days of search-term data, drop it into Claude with our
            lead-gen skill (which reads your landing pages to understand what
            you actually sell), and get back a negatives list tuned to your
            business — not a generic template.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50"
              onClick={() => scrollTo("part-1")}
            >
              <PlayCircle className="w-4 h-4 mr-2" /> Start the workflow
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white bg-white/10 hover:bg-white/20"
              onClick={() => navigate("/dashboard/lead-gen/wasted-keywords")}
            >
              Open the data extractor
            </Button>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-14 relative z-10">
        <Card className="border-emerald-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">What this workflow gives you</CardTitle>
            <CardDescription>
              Two clear outputs that directly cut wasted lead-gen spend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-semibold text-emerald-900">
                    Output 1 — Negative Keywords List
                  </h3>
                </div>
                <ul className="text-sm text-emerald-900/90 space-y-1.5 list-disc pl-5">
                  <li>
                    Identifies search terms wasting budget that aren't real
                    leads (job seekers, free-something hunters, location/intent
                    mismatches, competitor names you don't want).
                  </li>
                  <li>
                    Bulk-pasteable into Google Ads' shared negative-keyword
                    list.
                  </li>
                </ul>
              </div>

              <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-semibold text-emerald-900">
                    Output 2 — Theme Summary
                  </h3>
                </div>
                <ul className="text-sm text-emerald-900/90 space-y-1.5 list-disc pl-5">
                  <li>
                    A short note explaining the patterns the skill found —
                    e.g. "lots of 'jobs' / 'careers' queries" or "many DIY-
                    intent searches" — so you understand what the negatives
                    are actually fixing.
                  </li>
                  <li>
                    Often surfaces gaps in your landing-page copy that are
                    causing Google to match the wrong audience.
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">Why landing pages matter:</span>{" "}
                  the skill reads your actual landing pages to understand what
                  service you sell — so it can tell that "free legal advice"
                  is junk for a paid law firm but real intent for a legal-aid
                  nonprofit. Generic negative-keyword templates can't make
                  that distinction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Step-by-step parts */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12 md:space-y-16">
        {parts.map((p) => {
          const Icon = p.icon;
          const stepsDone = p.steps.filter((s) => completed[s.id]).length;
          return (
            <section key={p.id} id={p.id} className="scroll-mt-24">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-md">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-mono text-emerald-700 font-semibold">
                    Part {p.number}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {p.title}
                  </h2>
                </div>
                <div className="hidden sm:block flex-shrink-0">
                  <Badge
                    variant="outline"
                    className="border-emerald-200 text-emerald-700"
                  >
                    {stepsDone}/{p.steps.length} done
                  </Badge>
                </div>
              </div>

              <Card className="border-emerald-100 shadow-sm">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <p className="text-gray-700 leading-relaxed">{p.intro}</p>

                  {/* Steps */}
                  <div className="space-y-2">
                    {p.steps.map((s, idx) => (
                      <label
                        key={s.id}
                        htmlFor={s.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          completed[s.id]
                            ? "bg-emerald-50/60 border-emerald-200"
                            : "bg-white border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30"
                        }`}
                      >
                        <Checkbox
                          id={s.id}
                          checked={!!completed[s.id]}
                          onCheckedChange={() => toggle(s.id)}
                          className="mt-0.5"
                        />
                        <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span
                          className={`text-sm leading-relaxed ${
                            completed[s.id]
                              ? "text-gray-500 line-through"
                              : "text-gray-800"
                          }`}
                        >
                          {s.text}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Skill download — only Part 2; placeholder if file not ready */}
                  {p.id === "part-2" && (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-emerald-900 mb-1">
                          Download the skill
                        </div>
                        {SKILL_FILE_HREF ? (
                          <p className="text-sm text-emerald-900/85">
                            Upload{" "}
                            <span className="font-mono">
                              {SKILL_FILE_NAME}
                            </span>{" "}
                            to your Claude skills (Claude desktop or web →
                            Settings → Skills → Add).
                          </p>
                        ) : (
                          <p className="text-sm text-emerald-900/85 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            Skill file is being finalized — download will
                            appear here shortly. In the meantime, you can run
                            Part 1 (data extraction) and we'll publish the
                            skill before you need Part 2.
                          </p>
                        )}
                      </div>
                      {SKILL_FILE_HREF && (
                        <a href={SKILL_FILE_HREF} download={SKILL_FILE_NAME}>
                          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Download className="w-4 h-4 mr-2" /> Download
                            skill
                          </Button>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Prompt placeholder — shown only when ready */}
                  {p.id === "part-2" && SKILL_PROMPT_TEXT && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        Prompt to paste in Claude
                      </div>
                      <div className="relative bg-gray-900 text-emerald-100 rounded-lg p-4 font-mono text-sm">
                        <pre className="whitespace-pre-wrap break-words pr-20">
                          {SKILL_PROMPT_TEXT}
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyPrompt(SKILL_PROMPT_TEXT!)}
                          className="absolute top-2 right-2 h-7 text-xs text-emerald-100 hover:bg-white/10 hover:text-white"
                        >
                          {copied ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Replace{" "}
                        <span className="font-mono">[landing-page-urls]</span>{" "}
                        with your actual landing-page URLs (comma-separated).
                      </p>
                    </div>
                  )}

                  {/* Outcome callout */}
                  {p.outcome && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-emerald-900 mb-1">
                            What you get back
                          </div>
                          <p className="text-sm text-emerald-900/90 leading-relaxed">
                            {p.outcome}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reference screenshots — placeholder section */}
                  {p.id === "part-1" && (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-500 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Reference screenshots coming soon. The dashboard
                      extractor in step 1.2 already produces the file in the
                      exact shape Claude expects, so visuals are optional.
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
            Done? Time to apply the negatives.
          </h2>
          <p className="text-emerald-50/95 mb-6 max-w-2xl mx-auto">
            Paste the negatives into your Google Ads shared library. Re-run
            our Wasted Keywords tool in 30 days to measure the savings.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50"
              onClick={() => navigate("/dashboard/lead-gen/wasted-keywords")}
            >
              Open Wasted Keywords <ArrowRight className="w-4 h-4 ml-2" />
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
