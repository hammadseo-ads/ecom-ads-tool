// Lead-Gen Keyword / Search-Terms Analysis.
//
// Uses the SAME backend as the eCom Search Terms tool (/api/keyword-report):
// same generate / cached / status / clear. The difference is purely lead-gen
// framing done on the client:
//   - Shopping is excluded (Shopping is an eCom-only channel).
//   - Buckets are re-derived by CONVERSIONS + CPL (cost per lead), NOT ROAS,
//     because lead-gen accounts usually have no conversion value.
//   - The table shows CPL instead of ROAS / conversion value.
//
// This is the page the Lead-Gen N-Gram and Wasted-Keywords tools link to
// ("Run Keyword Reports first").

import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import {
  ArrowLeft, Search, AlertTriangle, RefreshCw, Trash2, Info,
  ChevronUp, ChevronDown, CheckCircle, Download,
} from "lucide-react";
import SEO from "@/components/SEO";
import DashboardShell from "@/components/DashboardShell";

const API_BASE = "/api/keyword-report";

interface CampaignContrib {
  campaign_id: string;
  campaign_name: string;
  channel_type: string;
  category_label?: string;
  impressions?: number;
  clicks?: number;
  cost?: number;
  conversions?: number;
  conversion_value?: number;
}

interface TermRow {
  search_term: string;
  total_impressions: number;
  total_clicks: number;
  total_cost: number;
  total_conversions: number;
  total_conversion_value: number;
  ctr: number;
  roas: number;
  has_cost_data: boolean;
  channel_types: string[];
  category: string; // server (eCom) category — ignored here, we re-derive
  campaigns?: CampaignContrib[];
}

interface PeriodData {
  term_details: TermRow[];
  summary_table: any[];
  campaign_list: { id: string; name: string; channel_type: string }[];
  total_terms: number;
}

// A derived lead-gen row: same term with a lead-gen bucket + CPL.
interface LeadRow extends TermRow {
  lead_bucket: string;
  cpl: number | null; // cost per lead (conversion); null if no conversions
}

const REPORT_TABS = [
  { value: "LAST_30_DAYS", label: "Last 30 Days", short: "30 days" },
  { value: "LAST_60_DAYS", label: "Last 60 Days", short: "60 days" },
  { value: "LAST_90_DAYS", label: "Last 90 Days", short: "90 days" },
];

// Lead-gen buckets, derived from conversions + engagement (not ROAS).
const BUCKET_ORDER = [
  "Converting",
  "Wasteful Spend",
  "High Engagement, No Conversion",
  "Low Visibility",
];

const BUCKET_COLOR: Record<string, string> = {
  Converting: "text-green-700 bg-green-50 border-green-300",
  "Wasteful Spend": "text-red-700 bg-red-50 border-red-300",
  "High Engagement, No Conversion": "text-amber-800 bg-amber-50 border-amber-300",
  "Low Visibility": "text-gray-600 bg-gray-50 border-gray-300",
};

// Minimum clicks for a zero-conversion term to count as "engaged" (review)
// rather than "low visibility".
const ENGAGEMENT_CLICKS = 10;

const isShoppingOnly = (channels: string[] = []) =>
  channels.length > 0 && channels.every((c) => c === "SHOPPING");

const leadBucket = (r: TermRow): string => {
  if (r.total_conversions >= 1) return "Converting";
  // No conversions:
  if (r.has_cost_data && r.total_cost > 0) return "Wasteful Spend"; // spent, no lead
  if (r.total_clicks >= ENGAGEMENT_CLICKS) return "High Engagement, No Conversion";
  return "Low Visibility";
};

const empty = (): PeriodData => ({
  term_details: [], summary_table: [], campaign_list: [], total_terms: 0,
});

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
    "Content-Type": "application/json",
  },
  withCredentials: true as const,
});

const withAuthRetry = async <T,>(call: () => Promise<T>): Promise<T> => {
  try {
    return await call();
  } catch (err: any) {
    if (err?.response?.status !== 401) throw err;
    try {
      const { data } = await axios.post("/api/auth/refresh-token", {}, { withCredentials: true });
      if (data?.accessToken) localStorage.setItem("accessToken", data.accessToken);
    } catch {
      throw err;
    }
    return await call();
  }
};

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n || 0);

interface InnerProps {
  selectedAccountId: string;
  selectedAccountName: string;
}

const LeadGenKeywordsInner = ({ selectedAccountId, selectedAccountName }: InnerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useUser();

  const [activeTab, setActiveTab] = useState("LAST_30_DAYS");
  const [reportData, setReportData] = useState<Record<string, PeriodData>>({
    LAST_30_DAYS: empty(), LAST_60_DAYS: empty(), LAST_90_DAYS: empty(),
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>("");
  const [isClearing, setIsClearing] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [sortBy, setSortBy] = useState<keyof LeadRow>("total_cost");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const userPickedTabRef = useRef(false);

  const loadCachedData = async (accountId: string) => {
    if (!userId || !accountId) {
      setReportData({ LAST_30_DAYS: empty(), LAST_60_DAYS: empty(), LAST_90_DAYS: empty() });
      return;
    }
    setReportData({ LAST_30_DAYS: empty(), LAST_60_DAYS: empty(), LAST_90_DAYS: empty() });
    setSelectedBucket("all");
    setSelectedCampaign("all");

    const results = await Promise.all(
      REPORT_TABS.map(async ({ value }) => {
        try {
          const { data } = await withAuthRetry(() =>
            axios.post(`${API_BASE}/cached`,
              { user_id: userId, customer_id: accountId, report_type: value },
              getAuthHeaders())
          );
          return { value, data: data as PeriodData };
        } catch {
          return { value, data: null };
        }
      })
    );

    let firstAvailable: string | null = null;
    setReportData((prev) => {
      const next = { ...prev };
      for (const { value, data } of results) {
        if (data?.term_details?.length) {
          next[value] = data;
          if (!firstAvailable) firstAvailable = value;
        }
      }
      return next;
    });
    if (firstAvailable && !userPickedTabRef.current) setActiveTab(firstAvailable);
  };

  useEffect(() => {
    userPickedTabRef.current = false;
    loadCachedData(selectedAccountId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId, userId]);

  const pollUntilDone = async (accountId: string): Promise<any> => {
    const POLL_INTERVAL_MS = 4000;
    const MAX_POLLS = 150;
    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      try {
        const { data } = await withAuthRetry(() =>
          axios.post(`${API_BASE}/status`,
            { user_id: userId, customer_id: accountId },
            getAuthHeaders())
        );
        if (data?.progress) setGenerationProgress(data.progress);
        if (data?.status === "COMPLETED") return data;
        if (data?.status === "FAILED") throw new Error(data.error || "Generation failed");
      } catch (e: any) {
        if (e?.message?.includes("Generation failed")) throw e;
      }
    }
    throw new Error("Generation took longer than 10 minutes, check backend logs.");
  };

  const handleGenerate = async () => {
    if (!selectedAccountId) {
      toast({ title: "Pick an account", description: "Select an account first.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setGenerationProgress("Starting...");
    toast({
      title: "Generating in background",
      description: "Search terms across your Search & PMax campaigns. Can take a few minutes, safe to leave this tab open.",
      duration: 8000,
    });
    try {
      const { data: kicked } = await withAuthRetry(() =>
        axios.post(`${API_BASE}/generate`,
          { user_id: userId, customer_id: selectedAccountId },
          getAuthHeaders())
      );
      if (kicked?.status === "ALREADY_RUNNING") {
        toast({ title: "Already in progress", description: "A generation is already running for this account." });
      }
      const final = await pollUntilDone(selectedAccountId);
      const totalTerms = final?.count ?? 0;
      toast({ title: "Done", description: `Loaded ${totalTerms.toLocaleString()} unique search terms.` });
      await loadCachedData(selectedAccountId);
    } catch (e: any) {
      toast({
        title: "Generation failed",
        description: e.response?.data?.error || e.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress("");
    }
  };

  const handleClear = async () => {
    if (!selectedAccountId) return;
    setIsClearing(true);
    try {
      await withAuthRetry(() =>
        axios.delete(`${API_BASE}/clear`, {
          data: { user_id: userId, customer_id: selectedAccountId },
          ...getAuthHeaders(),
        })
      );
      setReportData({ LAST_30_DAYS: empty(), LAST_60_DAYS: empty(), LAST_90_DAYS: empty() });
      toast({ title: "Cleared", description: "Search-term data removed for this account." });
    } catch (e: any) {
      toast({ title: "Clear failed", description: e.message, variant: "destructive" });
    } finally {
      setIsClearing(false);
    }
  };

  const periodData = reportData[activeTab] || empty();

  // Lead-gen campaign list: drop Shopping campaigns.
  const campaignList = useMemo(
    () => (periodData.campaign_list || []).filter((c) => c.channel_type !== "SHOPPING"),
    [periodData]
  );

  // All terms → lead-gen rows (Shopping-only terms excluded, CPL + bucket derived).
  const leadRows: LeadRow[] = useMemo(() => {
    return (periodData.term_details || [])
      .filter((r) => !isShoppingOnly(r.channel_types))
      .map((r) => ({
        ...r,
        lead_bucket: leadBucket(r),
        cpl: r.total_conversions > 0 ? r.total_cost / r.total_conversions : null,
      }));
  }, [periodData]);

  const totalLeadTerms = leadRows.length;

  // Bucket summary (counts + spend) computed from lead rows.
  const bucketSummary = useMemo(() => {
    const map = new Map<string, { bucket: string; num_terms: number; total_clicks: number; total_cost: number; total_conversions: number }>();
    for (const r of leadRows) {
      const b = r.lead_bucket;
      if (!map.has(b)) map.set(b, { bucket: b, num_terms: 0, total_clicks: 0, total_cost: 0, total_conversions: 0 });
      const s = map.get(b)!;
      s.num_terms += 1;
      s.total_clicks += r.total_clicks;
      s.total_cost += r.has_cost_data ? r.total_cost : 0;
      s.total_conversions += r.total_conversions;
    }
    return map;
  }, [leadRows]);

  // Filter + sort (with per-campaign recompute, like the eCom tool).
  const filteredTerms = useMemo(() => {
    let rows = leadRows;
    if (selectedBucket !== "all") rows = rows.filter((r) => r.lead_bucket === selectedBucket);

    if (selectedCampaign !== "all") {
      const target = String(selectedCampaign);
      rows = rows
        .filter((r) => (r.campaigns || []).some((c) => String(c?.campaign_id ?? "") === target))
        .map((r) => {
          const matches = (r.campaigns || []).filter((c) => String(c?.campaign_id ?? "") === target);
          const impr = matches.reduce((s, c) => s + (c.impressions || 0), 0);
          const clicks = matches.reduce((s, c) => s + (c.clicks || 0), 0);
          const cost = matches.reduce((s, c) => s + (c.cost || 0), 0);
          const conv = matches.reduce((s, c) => s + (c.conversions || 0), 0);
          const convVal = matches.reduce((s, c) => s + (c.conversion_value || 0), 0);
          const hasCost = matches.some((c) => c.channel_type !== "PERFORMANCE_MAX");
          const recomputed: LeadRow = {
            ...r,
            total_impressions: impr,
            total_clicks: clicks,
            total_cost: cost,
            total_conversions: conv,
            total_conversion_value: convVal,
            ctr: impr > 0 ? (clicks / impr) * 100 : 0,
            roas: cost > 0 ? convVal / cost : 0,
            has_cost_data: hasCost,
            channel_types: Array.from(new Set(matches.map((c) => c.channel_type))),
            cpl: conv > 0 ? cost / conv : null,
            lead_bucket: r.lead_bucket,
          };
          return recomputed;
        });
    }

    return [...rows].sort((a, b) => {
      // CPL sort: nulls (no conversions) always sort last.
      if (sortBy === "cpl") {
        const av = a.cpl, bv = b.cpl;
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const av = (a[sortBy] as number) || 0;
      const bv = (b[sortBy] as number) || 0;
      const cmp = av - bv;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [leadRows, selectedBucket, selectedCampaign, sortBy, sortDir]);

  // Lead-gen insights.
  const insights = useMemo(() => {
    if (totalLeadTerms === 0) return null;
    const conv = bucketSummary.get("Converting");
    const wasted = bucketSummary.get("Wasteful Spend");
    const review = bucketSummary.get("High Engagement, No Conversion");
    const totalCost = leadRows.reduce((s, r) => s + (r.has_cost_data ? r.total_cost : 0), 0);
    const totalLeads = leadRows.reduce((s, r) => s + r.total_conversions, 0);
    const avgCpl = totalLeads > 0 ? totalCost / totalLeads : 0;
    const wastedCost = wasted?.total_cost || 0;
    const wastedPct = totalCost > 0 ? (wastedCost / totalCost) * 100 : 0;
    return {
      convTerms: conv?.num_terms || 0,
      convLeads: conv?.total_conversions || 0,
      convCost: conv?.total_cost || 0,
      avgCpl,
      wastedCost,
      wastedPct,
      wastedTerms: wasted?.num_terms || 0,
      reviewTerms: review?.num_terms || 0,
      reviewClicks: review?.total_clicks || 0,
      totalCost,
    };
  }, [bucketSummary, leadRows, totalLeadTerms]);

  const SortHeader = ({ col, label }: { col: keyof LeadRow; label: string }) => (
    <th
      className="text-right px-3 py-2 cursor-pointer hover:text-emerald-700 select-none"
      onClick={() => {
        if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortBy(col); setSortDir("desc"); }
      }}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortBy === col && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </span>
    </th>
  );

  const exportCsv = () => {
    if (!filteredTerms.length) return;
    const headers = ["search_term", "bucket", "source", "impressions", "clicks", "ctr_pct", "cost", "conversions", "cpl"];
    const lines = [headers.join(",")];
    for (const r of filteredTerms) {
      lines.push([
        `"${r.search_term.replace(/"/g, '""')}"`,
        `"${r.lead_bucket}"`,
        `"${(r.channel_types || []).join("|")}"`,
        r.total_impressions, r.total_clicks, r.ctr.toFixed(2),
        r.has_cost_data ? r.total_cost.toFixed(2) : "",
        r.total_conversions.toFixed(2),
        r.cpl != null ? r.cpl.toFixed(2) : "",
      ].join(","));
    }
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leadgen-keywords-${selectedAccountId}-${activeTab}-${selectedBucket}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabLabel = REPORT_TABS.find((t) => t.value === activeTab)?.short || "30 days";

  return (
    <div className="space-y-6">
      <SEO title="Lead Gen Keyword Reports | ManagingSEO" noindex />
      <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to tools
      </Button>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-6 h-6 text-emerald-600" />
            <CardTitle className="text-2xl flex items-center gap-2">
              Keyword &amp; Search Terms
              <span className="text-emerald-800 text-[11px] font-bold uppercase tracking-wide bg-emerald-50 px-1.5 py-0.5 rounded">Lead Gen</span>
            </CardTitle>
          </div>
          <CardDescription>
            Search terms across your Search &amp; Performance Max campaigns for{" "}
            <span className="font-semibold">{selectedAccountName || "-"}</span>{" "}
            {selectedAccountId && <span className="text-gray-400">({selectedAccountId})</span>}
            <br />
            <span className="text-xs text-gray-500">
              Bucketed by conversions &amp; cost-per-lead (CPL). Shopping is excluded (eCom-only).
              This is the source data for the Lead Gen{" "}
              <button className="text-emerald-700 underline" onClick={() => navigate("/dashboard/lead-gen/ngrams")}>N-Gram</button>{" "}
              tool.
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          {selectedAccountId ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleGenerate} disabled={isGenerating} className="bg-emerald-600 hover:bg-emerald-700">
                  {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  {isGenerating ? "Generating..." : "Generate Reports"}
                </Button>
                <Button onClick={handleClear} disabled={isClearing || isGenerating || !periodData.total_terms} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" /> Clear Reports
                </Button>
              </div>
              {isGenerating && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-300 rounded text-sm text-emerald-900">
                  <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span><strong>Working in background:</strong> {generationProgress || "Starting..."} - safe to leave this tab open.</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Select an account from the navigation above.</p>
          )}
        </CardContent>
      </Card>

      {/* Warning banner */}
      <div className="flex gap-3 p-4 bg-amber-50 border border-amber-300 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <p className="font-semibold mb-1">Before adding any term as a negative keyword, review it first.</p>
          <p>
            Some search terms may be highly relevant but haven't converted yet (small sample, long sales cycle, indirect intent).
            Treat the <span className="font-semibold">"High Engagement, No Conversion"</span> bucket as <em>candidates for review</em>, not automatic negatives.
          </p>
        </div>
      </div>

      {selectedAccountId && (
        <Tabs value={activeTab} onValueChange={(v) => { userPickedTabRef.current = true; setActiveTab(v); }}>
          <TabsList className="grid w-full grid-cols-3">
            {REPORT_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
          </TabsList>

          {REPORT_TABS.map((t) => (
            <TabsContent key={t.value} value={t.value} className="space-y-6">
              {totalLeadTerms === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No data for {t.label.toLowerCase()}.</p>
                    <p className="text-sm mt-1">Click <strong>Generate Reports</strong> above to fetch from Google Ads.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Insight panels */}
                  {insights && (
                    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                      <h3 className="text-xl font-bold text-gray-900">What we found in your search terms ({tabLabel})</h3>

                      {insights.convTerms > 0 && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-lg font-semibold text-green-800">Converting terms</h4>
                            <div className="bg-green-100 px-3 py-1 rounded-full">
                              <span className="text-green-800 font-bold text-lg">{insights.convTerms}</span>
                            </div>
                          </div>
                          <p className="text-green-700">
                            <strong>{insights.convTerms} terms</strong> drove <strong>{insights.convLeads.toFixed(0)} leads</strong> for{" "}
                            <strong>{fmtMoney(insights.convCost)}</strong> over the past {tabLabel} - an average CPL of{" "}
                            <strong>{fmtMoney(insights.avgCpl)}</strong>.
                          </p>
                          <p className="text-green-700 text-sm mt-2">
                            Sort the Converting bucket by <strong>CPL</strong> to spot your most expensive leads - those are the ones to
                            tighten (bids, match types, landing pages) or scale down.
                          </p>
                        </div>
                      )}

                      {insights.wastedPct > 0 && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-lg font-semibold text-red-800">Wasted spend</h4>
                            <div className="bg-red-100 px-3 py-1 rounded-full">
                              <span className="text-red-800 font-bold text-lg">{insights.wastedPct.toFixed(1)}%</span>
                            </div>
                          </div>
                          <p className="text-red-700">
                            <strong>{fmtMoney(insights.wastedCost)}</strong> of <strong>{fmtMoney(insights.totalCost)}</strong> went to{" "}
                            <strong>{insights.wastedTerms} terms</strong> with zero leads over the past {tabLabel}.
                          </p>
                          <p className="text-red-700 text-sm mt-2">
                            These are your strongest negative-keyword candidates. Filter to "Wasteful Spend", review each, and add the
                            irrelevant ones as exact-match negatives.
                          </p>
                        </div>
                      )}

                      {insights.reviewTerms > 0 && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-lg font-semibold text-amber-900">Review before negativing</h4>
                            <div className="bg-amber-100 px-3 py-1 rounded-full">
                              <span className="text-amber-900 font-bold text-lg">{insights.reviewTerms}</span>
                            </div>
                          </div>
                          <p className="text-amber-900">
                            <strong>{insights.reviewTerms} terms</strong> got clicks ({insights.reviewClicks.toLocaleString()} total) but
                            no leads yet. Some may be relevant with a slow sales cycle - read each before negativing.
                          </p>
                        </div>
                      )}

                      <div className="mt-2 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h4 className="text-lg font-semibold text-gray-900">Quick actions</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-red-700 whitespace-nowrap">• Immediate:</span>
                            <span>Filter to <strong>"Wasteful Spend"</strong> and add clearly irrelevant terms as exact-match negatives.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-emerald-700 whitespace-nowrap">• This week:</span>
                            <span>Sort <strong>"Converting"</strong> by CPL and rein in the high-CPL leads.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-amber-700 whitespace-nowrap">• Review:</span>
                            <span>Go through <strong>"High Engagement, No Conversion"</strong> one by one - don't bulk-negative.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Bucket summary cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {BUCKET_ORDER.filter((b) => bucketSummary.has(b)).map((b) => {
                      const s = bucketSummary.get(b)!;
                      return (
                        <Card key={b} className={`border-2 ${BUCKET_COLOR[b] || ""}`}>
                          <CardContent className="p-3">
                            <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{b}</div>
                            <div className="text-2xl font-bold mt-1">{s.num_terms}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {s.total_clicks.toLocaleString()} clicks
                              {s.total_cost > 0 && <> · {fmtMoney(s.total_cost)}</>}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-3">
                    <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                      <SelectTrigger className="w-64"><SelectValue placeholder="Filter by bucket" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All buckets</SelectItem>
                        {BUCKET_ORDER.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {campaignList.length > 0 && (
                      <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                        <SelectTrigger className="w-72"><SelectValue placeholder="Filter by campaign" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All campaigns</SelectItem>
                          {campaignList.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name} <span className="text-gray-400">({c.channel_type})</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button onClick={exportCsv} variant="outline" disabled={!filteredTerms.length}>
                      <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                    <div className="text-sm text-gray-600 self-center ml-auto">
                      Showing <span className="font-semibold">{filteredTerms.length}</span> of {totalLeadTerms} terms
                    </div>
                  </div>

                  {selectedCampaign !== "all" && (
                    <div className="bg-emerald-50 border border-emerald-300 rounded p-3 text-sm text-emerald-900">
                      🔍 <strong>Per-campaign view active.</strong> Metrics below are the contribution from{" "}
                      <span className="font-mono">{campaignList.find((c) => c.id === selectedCampaign)?.name || selectedCampaign}</span>{" "}
                      only, not the cross-campaign total.
                    </div>
                  )}

                  {/* Table */}
                  <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                          <tr>
                            <th className="text-left px-3 py-2">Search term</th>
                            <th className="text-left px-3 py-2">Bucket</th>
                            <th className="text-left px-3 py-2">Source</th>
                            <SortHeader col="total_impressions" label="Impr." />
                            <SortHeader col="total_clicks" label="Clicks" />
                            <SortHeader col="ctr" label="CTR %" />
                            <SortHeader col="total_cost" label="Cost" />
                            <SortHeader col="total_conversions" label="Leads" />
                            <SortHeader col="cpl" label="CPL" />
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTerms.map((r, i) => (
                            <tr key={`${r.search_term}-${i}`} className="border-t hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">
                                <span className="inline-flex items-center gap-2">
                                  {r.search_term}
                                  {r.lead_bucket === "High Engagement, No Conversion" && (
                                    <span title="Has clicks but no leads, review manually before negativing">
                                      <Info className="w-3.5 h-3.5 text-amber-500" />
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs border ${BUCKET_COLOR[r.lead_bucket] || ""}`}>
                                  {r.lead_bucket}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-500">{(r.channel_types || []).join(", ")}</td>
                              <td className="text-right px-3 py-2 tabular-nums">{r.total_impressions.toLocaleString()}</td>
                              <td className="text-right px-3 py-2 tabular-nums">{r.total_clicks.toLocaleString()}</td>
                              <td className="text-right px-3 py-2 tabular-nums">{r.ctr.toFixed(2)}</td>
                              <td className="text-right px-3 py-2 tabular-nums">
                                {r.has_cost_data ? fmtMoney(r.total_cost) : <span className="text-gray-300">-</span>}
                              </td>
                              <td className="text-right px-3 py-2 tabular-nums">{r.total_conversions.toFixed(1)}</td>
                              <td className="text-right px-3 py-2 tabular-nums font-semibold">
                                {r.cpl != null ? fmtMoney(r.cpl) : <span className="text-gray-300">-</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-3 py-2 text-xs text-gray-500 border-t bg-gray-50">
                      CPL = cost / leads. Cost is shown only for Search/Display terms - Google does not expose cost-per-search-term for Performance Max.
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

const LeadGenKeywordsReportPage = () => (
  <DashboardShell>
    {({ selectedAccountId, selectedAccountName }) => (
      <LeadGenKeywordsInner
        selectedAccountId={selectedAccountId}
        selectedAccountName={selectedAccountName}
      />
    )}
  </DashboardShell>
);

export default LeadGenKeywordsReportPage;
