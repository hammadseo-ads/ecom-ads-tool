// Negative Keywords & Product Titles Analysis guide.
//
// Manual workflow guide (no Google Ads connection from our app):
//   Part 1 — download Last 30 Days Search Terms from Google Ads
//   Part 2 — download Last 30 Days Product Title Data from Google Ads
//   Part 3 — run those Excel files through the "negative-keyword-targeting"
//            Claude skill to get back two outputs: a negatives list (Excel)
//            and a product title audit (Word).
//
// Same green palette as the other guides — no purples.

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
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Search,
  Tags,
  PlayCircle,
} from "lucide-react";

// File served from /public — see frontend/public/lovable-uploads/skills/
const SKILL_FILE_HREF = "/lovable-uploads/skills/negative-keyword-targeting.skill";
const SKILL_FILE_NAME = "negative-keyword-targeting.skill";

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
  images?: { src: string; caption: string }[];
  // For Part 3 — extra "prompt" callout to copy/paste
  prompt?: string;
  // For Part 3 — outcome description
  outcome?: string;
}

const parts: Part[] = [
  {
    id: "part-1",
    number: "01",
    title: "Download Last 30 Days Search Terms",
    intro:
      "Pull the search-term report from Google Ads. This is the raw data showing what people actually searched before clicking your ads.",
    icon: Search,
    steps: [
      { id: "1-1", text: "Log in to Google Ads." },
      { id: "1-2", text: "Go to Campaigns → Insights and Reports → Search Terms." },
      { id: "1-3", text: "Select All Campaigns." },
      { id: "1-4", text: "Set the date range to Last 30 Days." },
      { id: "1-5", text: "Download the data as an Excel file." },
    ],
    images: [
      {
        src: "/lovable-uploads/negkw-titles/report-editor.png",
        caption: "Report Editor → search \"Product Title Data Along with Campaigns\"",
      },
    ],
  },
  {
    id: "part-2",
    number: "02",
    title: "Download Last 30 Days Product Title Data",
    intro:
      "Pull the product-title performance data per campaign. This shows which titles are pulling traffic and how they're performing.",
    icon: Tags,
    steps: [
      { id: "2-1", text: "Log in to Google Ads." },
      {
        id: "2-2",
        text: "Go to Campaigns → Insights and Reports → Report Editor → type \"Product Title Data Along with Campaigns\" → click Generate Report.",
      },
      {
        id: "2-3",
        text: "Select all campaigns → set the date range to Last 30 Days → download as Excel.",
      },
    ],
    images: [
      {
        src: "/lovable-uploads/negkw-titles/search-terms-path.png",
        caption: "Path: Campaigns → Insights and Reports → Search Terms",
      },
      {
        src: "/lovable-uploads/negkw-titles/select-campaigns.png",
        caption: "Select campaigns, set date range, and download",
      },
    ],
  },
  {
    id: "part-3",
    number: "03",
    title: "Run the Analysis in Claude",
    intro:
      "Once both Excel files are downloaded, run them through Claude using the dedicated skill.",
    icon: Sparkles,
    steps: [
      {
        id: "3-1",
        text: "Download the \"negative-keyword-targeting\" skill (button below) and upload it to your Claude skills.",
      },
      { id: "3-2", text: "Upload BOTH Excel files (search terms + product title data) to Claude in the same chat." },
      { id: "3-3", text: "Paste the prompt shown below — replace [website-link] with your store URL." },
    ],
    prompt:
      'For the website [website-link], work on the files I attached, use the skill "negative-keyword-targeting" and perform the analysis.',
    outcome:
      "Claude returns two files — the negative keywords list (Excel) to apply in Google Ads, and the product title audit (Word) telling you exactly which titles to rewrite and how.",
  },
];

export default function NegativeKeywordsAndTitlesGuide() {
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
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalSteps = parts.reduce((sum, p) => sum + p.steps.length, 0);
  const doneSteps = Object.values(completed).filter(Boolean).length;
  const overallProgress = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — non-https or denied
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-green-50/30">
      <PublicHeader />
      <SEO
        title="Negative Keywords + Product Titles — Google Ads Workflow"
        description="Step-by-step workflow: pull 30 days of search-term + product-title data from Google Ads, run it through the Claude skill, get a ready-to-apply negatives list and a product-title audit."
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
            <span className="font-medium">Progress</span>
            <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="font-mono text-gray-700">{doneSteps}/{totalSteps}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-white">
          <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20 mb-4">
            <Sparkles className="w-3 h-3 mr-1" /> Manual workflow • 3 parts
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Negative Keywords &amp; Product Titles Analysis
          </h1>
          <p className="text-base md:text-xl text-emerald-50/95 max-w-3xl mb-6">
            Step-by-step guide to clean wasted ad spend and fix product titles. Pull 30 days of
            Google Ads data, drop it into Claude with our skill, and get back a ready-to-apply
            negatives list plus a product-title audit.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50"
              onClick={() => scrollTo("part-1")}
            >
              <PlayCircle className="w-4 h-4 mr-2" /> Start the analysis
            </Button>
            <a href={SKILL_FILE_HREF} download={SKILL_FILE_NAME}>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white bg-white/10 hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" /> Download skill
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* What this analysis does */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-14 relative z-10">
        <Card className="border-emerald-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">What this analysis gives you</CardTitle>
            <CardDescription>Two clear outputs that directly improve campaign performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-semibold text-emerald-900">Output 1 — Negative Keywords List</h3>
                </div>
                <ul className="text-sm text-emerald-900/90 space-y-1.5 list-disc pl-5">
                  <li>Identifies search terms wasting ad spend (irrelevant traffic, wrong intent, junk queries).</li>
                  <li>Tells you exactly which keywords to add as negatives so your budget stops bleeding into clicks that never convert.</li>
                </ul>
              </div>

              <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-semibold text-emerald-900">Output 2 — Product Title Audit</h3>
                </div>
                <ul className="text-sm text-emerald-900/90 space-y-1.5 list-disc pl-5">
                  <li>In PMax, Google uses your product titles to decide which keywords to show ads against.</li>
                  <li>If titles contain wrong, vague, or misleading words, ads end up triggered on the wrong searches — the root cause of most negatives in the first place.</li>
                  <li>Flags titles that need to be rewritten so ads start showing on the right searches.</li>
                  <li>Better titles = higher CTR = lower CPC.</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">Why it matters:</span> Most teams treat negative
                  keywords and product titles as two separate problems. They are not. Bad titles
                  CAUSE bad search terms. Fixing titles fixes the source — adding negatives fixes
                  the symptoms. You need to do both, and this analysis covers both in one run.
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
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">
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
                            completed[s.id] ? "text-gray-500 line-through" : "text-gray-800"
                          }`}
                        >
                          {s.text}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Skill download — only Part 3 has it */}
                  {p.id === "part-3" && (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-emerald-900 mb-1">
                          Download the skill
                        </div>
                        <p className="text-sm text-emerald-900/85">
                          Upload <span className="font-mono">{SKILL_FILE_NAME}</span> to your Claude
                          skills (Claude desktop or web → Settings → Skills → Add).
                        </p>
                      </div>
                      <a href={SKILL_FILE_HREF} download={SKILL_FILE_NAME}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          <Download className="w-4 h-4 mr-2" /> Download skill
                        </Button>
                      </a>
                    </div>
                  )}

                  {/* Prompt to copy — only Part 3 */}
                  {p.prompt && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        Prompt to paste in Claude
                      </div>
                      <div className="relative bg-gray-900 text-emerald-100 rounded-lg p-4 font-mono text-sm">
                        <pre className="whitespace-pre-wrap break-words pr-20">{p.prompt}</pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyPrompt(p.prompt!)}
                          className="absolute top-2 right-2 h-7 text-xs text-emerald-100 hover:bg-white/10 hover:text-white"
                        >
                          {copied ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Replace <span className="font-mono">[website-link]</span> with your store URL.
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
                          <p className="text-sm text-emerald-900/90 leading-relaxed">{p.outcome}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reference screenshots */}
                  {p.images && p.images.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-3">
                        Reference {p.images.length === 1 ? "screenshot" : "screenshots"}
                      </div>
                      <div
                        className={`grid gap-4 ${
                          p.images.length === 1
                            ? "grid-cols-1"
                            : "grid-cols-1 md:grid-cols-2"
                        }`}
                      >
                        {p.images.map((img) => (
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
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Done with the analysis?</h2>
          <p className="text-emerald-50/95 mb-6 max-w-2xl mx-auto">
            Apply the negatives in Google Ads, rewrite the titles flagged in the audit, then run
            the analysis again in 30 days to measure the lift.
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
