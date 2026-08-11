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
  ArrowLeft,
  Search,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Info,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Download,
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

const API_BASE = "/api/keyword-report";

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
  category: string;
  campaigns?: { campaign_id: string; campaign_name: string; channel_type: string; category_label?: string }[];
}

interface SummaryRow {
  bucket: string;
  num_terms: number;
  total_impressions: number;
  total_clicks: number;
  total_cost: number;
  total_conversions: number;
  total_conversion_value: number;
  ctr: number;
  roas: number;
}

interface PeriodData {
  term_details: TermRow[];
  summary_table: SummaryRow[];
  campaign_list: { id: string; name: string; channel_type: string }[];
  total_terms: number;
}

const REPORT_TABS = [
  { value: "LAST_30_DAYS", label: "Last 30 Days", short: "30 days" },
  { value: "LAST_60_DAYS", label: "Last 60 Days", short: "60 days" },
  { value: "LAST_90_DAYS", label: "Last 90 Days", short: "90 days" },
];

const BUCKET_ORDER = [
  "Profitable",
  "Costly Conversions",
  "Wasteful Spend",
  "Wasteful Clicks",
  "High Engagement, No Conversion",
  "Low Visibility",
  "Other",
];

const BUCKET_COLOR: Record<string, string> = {
  Profitable: "text-green-700 bg-green-50 border-green-300",
  "Costly Conversions": "text-slate-700 bg-slate-50 border-slate-300",
  "Wasteful Spend": "text-slate-700 bg-slate-50 border-slate-300",
  "Wasteful Clicks": "text-orange-700 bg-orange-50 border-orange-300",
  "High Engagement, No Conversion": "text-slate-800 bg-slate-50 border-slate-300",
  "Low Visibility": "text-gray-600 bg-gray-50 border-gray-300",
  Other: "text-emerald-700 bg-emerald-50 border-emerald-300",
};

const empty = (): PeriodData => ({
  term_details: [],
  summary_table: [],
  campaign_list: [],
  total_terms: 0,
});

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
    "Content-Type": "application/json",
  },
  withCredentials: true as const,
});

// Wrap an axios call. If it fails with 401, try /auth/refresh-token once
// (uses the 7-day HttpOnly refresh cookie) and retry. Long-running calls like
// /generate can outlive the 15-minute access token, so this transparent retry
// prevents 5xx-looking failures mid-generation.
const withAuthRetry = async <T,>(call: () => Promise<T>): Promise<T> => {
  try {
    return await call();
  } catch (err: any) {
    if (err?.response?.status !== 401) throw err;
    try {
      const { data } = await axios.post("/api/auth/refresh-token", {}, { withCredentials: true });
      if (data?.accessToken) localStorage.setItem("accessToken", data.accessToken);
    } catch {
      throw err; // refresh failed too, surface original
    }
    return await call();
  }
};

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n || 0);
const fmtPct = (n: number) => `${(n || 0).toFixed(1)}%`;

interface InnerProps {
  selectedAccountId: string;
  selectedAccountName: string;
}

const KeywordsReportInner = ({ selectedAccountId, selectedAccountName }: InnerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useUser();

  const [activeTab, setActiveTab] = useState("LAST_30_DAYS");
  const [reportData, setReportData] = useState<Record<string, PeriodData>>({
    LAST_30_DAYS: empty(),
    LAST_60_DAYS: empty(),
    LAST_90_DAYS: empty(),
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>("");
  const [isClearing, setIsClearing] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [sortBy, setSortBy] = useState<keyof TermRow>("total_clicks");
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
            axios.post(
              `${API_BASE}/cached`,
              { user_id: userId, customer_id: accountId, report_type: value },
              getAuthHeaders()
            )
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

  // Poll /status every few seconds until the job completes or fails.
  // Returns the final status payload.
  const pollUntilDone = async (accountId: string): Promise<any> => {
    const POLL_INTERVAL_MS = 4000;
    const MAX_POLLS = 150; // 10 minutes
    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      try {
        const { data } = await withAuthRetry(() =>
          axios.post(
            `${API_BASE}/status`,
            { user_id: userId, customer_id: accountId },
            getAuthHeaders()
          )
        );
        if (data?.progress) setGenerationProgress(data.progress);
        if (data?.status === "COMPLETED") return data;
        if (data?.status === "FAILED") throw new Error(data.error || "Generation failed");
        // RUNNING or NO_DATA → keep polling (NO_DATA can briefly appear if the
        // poll lands between job dispatch and the in-memory tracker update)
      } catch (e: any) {
        // Network blip, keep polling unless it's a clear failure
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
      description: "Search terms across all campaigns. This can take a few minutes for large accounts, you can leave this tab open.",
      duration: 8000,
    });
    try {
      // /generate now returns 202 immediately. Real work runs in the background.
      const { data: kicked } = await withAuthRetry(() =>
        axios.post(
          `${API_BASE}/generate`,
          { user_id: userId, customer_id: selectedAccountId },
          getAuthHeaders()
        )
      );
      if (kicked?.status === "ALREADY_RUNNING") {
        toast({ title: "Already in progress", description: "A generation is already running for this account, waiting for it to finish." });
      }
      // Poll until COMPLETED / FAILED
      const final = await pollUntilDone(selectedAccountId);
      const totalTerms = final?.count ?? 0;
      toast({
        title: "Done",
        description: `Loaded ${totalTerms.toLocaleString()} unique search terms.`,
      });
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

  // Filter + sort.
  //
  // Crucial: when filtering by a single campaign, recompute every metric from
  // just that campaign's contribution (each row stores per-campaign breakdown
  // in r.campaigns). Without this, a term appearing in 3 campaigns would show
  // the same totals no matter which campaign is selected.
  const filteredTerms = useMemo(() => {
    let rows = periodData.term_details || [];
    if (selectedBucket !== "all") rows = rows.filter((r) => r.category === selectedBucket);

    if (selectedCampaign !== "all") {
      const target = String(selectedCampaign);
      rows = rows
        .filter((r) =>
          (r.campaigns || []).some((c) => String(c?.campaign_id ?? "") === target)
        )
        .map((r) => {
          // Sum just the matching campaign entries (a term may rarely appear
          // in the SAME campaign across multiple ad groups, sum those too).
          const matches = (r.campaigns || []).filter(
            (c) => String(c?.campaign_id ?? "") === target
          );
          const impr = matches.reduce((s, c) => s + (c.impressions || 0), 0);
          const clicks = matches.reduce((s, c) => s + (c.clicks || 0), 0);
          const cost = matches.reduce((s, c) => s + (c.cost || 0), 0);
          const conv = matches.reduce((s, c) => s + (c.conversions || 0), 0);
          const convVal = matches.reduce((s, c) => s + (c.conversion_value || 0), 0);
          const hasCost = matches.some(
            (c) => c.channel_type !== "PERFORMANCE_MAX"
          );
          return {
            ...r,
            total_impressions: impr,
            total_clicks: clicks,
            total_cost: cost,
            total_conversions: conv,
            total_conversion_value: convVal,
            ctr: impr > 0 ? (clicks / impr) * 100 : 0,
            roas: cost > 0 ? convVal / cost : 0,
            has_cost_data: hasCost,
            // channel_types reduced to just the matching campaign's source
            channel_types: Array.from(new Set(matches.map((c) => c.channel_type))),
          };
        });
    }

    return [...rows].sort((a, b) => {
      const av = a[sortBy] as number;
      const bv = b[sortBy] as number;
      const cmp = (av || 0) - (bv || 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [periodData, selectedBucket, selectedCampaign, sortBy, sortDir]);

  // Debug: log filter state + sample row to verify the per-campaign recompute.
  useEffect(() => {
    if (selectedCampaign !== "all") {
      const sample = filteredTerms[0];
      // eslint-disable-next-line no-console
      console.warn(
        "[keywords-FILTER] campaign:", selectedCampaign,
        "| matched rows:", filteredTerms.length, "/", periodData.term_details?.length || 0,
        "| sample row:", sample
          ? { term: sample.search_term, clicks: sample.total_clicks, cost: sample.total_cost, campaigns: sample.campaigns?.length }
          : "(none)"
      );
    }
  }, [selectedCampaign, filteredTerms, periodData.term_details?.length]);

  // Export the current (filtered) search-term table as CSV.
  const exportCsv = () => {
    if (!filteredTerms.length) return;
    const csv = (v: any) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const headers = ["search_term", "bucket", "source", "impressions", "clicks", "ctr_pct", "cost", "conversions", "conv_value", "roas"];
    const lines = [headers.join(",")];
    for (const r of filteredTerms) {
      lines.push([
        csv(r.search_term), csv(r.category), csv((r.channel_types || []).join("|")),
        r.total_impressions, r.total_clicks, r.ctr.toFixed(2),
        r.has_cost_data ? r.total_cost.toFixed(2) : "",
        r.total_conversions.toFixed(2), r.total_conversion_value.toFixed(2),
        r.has_cost_data && r.total_cost > 0 ? r.roas.toFixed(2) : "",
      ].join(","));
    }
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `search-terms-${selectedAccountId}-${activeTab}-${selectedBucket}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortHeader = ({ col, label }: { col: keyof TermRow; label: string }) => (
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

  // ---- Insight panels (mirroring product tool) ----
  const insightSections = useMemo(() => {
    const summary = periodData.summary_table || [];
    const total = summary.find((s) => s.bucket === "TOTAL");
    const profitable = summary.find((s) => s.bucket === "Profitable");
    const costly = summary.find((s) => s.bucket === "Costly Conversions");
    const wastefulSpend = summary.find((s) => s.bucket === "Wasteful Spend");
    const wastefulClicks = summary.find((s) => s.bucket === "Wasteful Clicks");
    const review = summary.find((s) => s.bucket === "High Engagement, No Conversion");

    if (!total || total.num_terms === 0) return null;

    const totalCost = total.total_cost;
    const totalValue = total.total_conversion_value;
    const totalClicks = total.total_clicks;

    const profitablePctOfSpend = totalCost > 0 ? ((profitable?.total_cost || 0) / totalCost) * 100 : 0;
    const profitableValueShare = totalValue > 0 ? ((profitable?.total_conversion_value || 0) / totalValue) * 100 : 0;

    const wastedSpend = wastefulSpend?.total_cost || 0;
    const wastedSpendPct = totalCost > 0 ? (wastedSpend / totalCost) * 100 : 0;

    const wastedClicks = wastefulClicks?.total_clicks || 0;
    const wastedClicksPct = totalClicks > 0 ? (wastedClicks / totalClicks) * 100 : 0;

    const reviewCount = review?.num_terms || 0;
    const reviewPct = total.num_terms > 0 ? (reviewCount / total.num_terms) * 100 : 0;

    return {
      profitablePctOfSpend,
      profitableValueShare,
      profitableCost: profitable?.total_cost || 0,
      profitableValue: profitable?.total_conversion_value || 0,
      totalCost,
      totalValue,
      wastedSpend,
      wastedSpendPct,
      wastedClicks,
      wastedClicksPct,
      reviewCount,
      reviewPct,
      reviewClicks: review?.total_clicks || 0,
      costlyCount: costly?.num_terms || 0,
      costlyCost: costly?.total_cost || 0,
      hasCostData: totalCost > 0,
    };
  }, [periodData]);

  const tabLabel = REPORT_TABS.find((t) => t.value === activeTab)?.short || "30 days";

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to tools
      </Button>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-6 h-6 text-emerald-600" />
            <CardTitle className="text-2xl">Search Terms Analysis</CardTitle>
          </div>
          <CardDescription>
            Search terms across Search, Shopping, and Performance Max campaigns for{" "}
            <span className="font-semibold">{selectedAccountName || "-"}</span>{" "}
            {selectedAccountId && <span className="text-gray-400">({selectedAccountId})</span>}
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
                  <span>
                    <strong>Working in background:</strong> {generationProgress || "Starting..."}
                    {" "}- safe to leave this tab open. Polling every few seconds.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Select an account from the navigation above.</p>
          )}
        </CardContent>
      </Card>

      {/* Warning banner */}
      <div className="flex gap-3 p-4 bg-slate-50 border border-slate-300 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-900">
          <p className="font-semibold mb-1">Before adding any term as a negative keyword, review it first.</p>
          <p>
            Some search terms may be highly relevant to your business but haven't converted yet (small sample, long sales cycle, indirect intent).
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
              {periodData.term_details.length === 0 ? (
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
                  {insightSections && (
                    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                      <h3 className="text-xl font-bold text-gray-900">What we found from your search terms ({tabLabel})</h3>

                      {/* Profitable Spend */}
                      {insightSections.hasCostData && insightSections.profitablePctOfSpend > 0 && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-lg font-semibold text-green-800">Profitable Spend</h4>
                            <div className="bg-green-100 px-3 py-1 rounded-full">
                              <span className="text-green-800 font-bold text-lg">{fmtPct(insightSections.profitablePctOfSpend)}</span>
                            </div>
                          </div>
                          <p className="text-green-700">
                            <strong>{fmtPct(insightSections.profitableValueShare)}</strong> of your sales came from <strong>{fmtPct(insightSections.profitablePctOfSpend)}</strong> of your search-term spend.
                            {fmtMoney(insightSections.profitableCost)} of {fmtMoney(insightSections.totalCost)} total spend generated {fmtMoney(insightSections.profitableValue)} in profitable sales over the past {tabLabel}.
                          </p>
                          <p className="text-green-700 text-sm mt-2">
                            These are the search terms driving your business, protect and scale them. Consider raising bids on the keywords that triggered them, or building tighter ad groups around their themes.
                          </p>
                        </div>
                      )}

                      {/* Wasted Spend (Search/Shopping cost-based) */}
                      {insightSections.hasCostData && insightSections.wastedSpendPct > 0 && (
                        <div className="bg-slate-50 border-l-4 border-slate-500 p-6 rounded-r-lg">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-lg font-semibold text-slate-800">Wasted Spend</h4>
                            <div className="bg-slate-100 px-3 py-1 rounded-full">
                              <span className="text-slate-800 font-bold text-lg">{fmtPct(insightSections.wastedSpendPct)}</span>
                            </div>
                          </div>
                          <p className="text-slate-700">
                            <strong>{fmtMoney(insightSections.wastedSpend)}</strong> of <strong>{fmtMoney(insightSections.totalCost)}</strong> went to search terms with no conversions over the past {tabLabel}.
                          </p>
                          <p className="text-slate-700 text-sm mt-2">
                            These are strong negative-keyword candidates. Filter the table to "Wasteful Spend", review each term, and add the irrelevant ones as exact-match negatives.
                          </p>
                        </div>
                      )}

                      {/* Wasted Clicks (PMax, no cost data) */}
                      {insightSections.wastedClicksPct > 0 && (
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-lg font-semibold text-orange-800">Wasted PMax Clicks</h4>
                            <div className="bg-orange-100 px-3 py-1 rounded-full">
                              <span className="text-orange-800 font-bold text-lg">{fmtPct(insightSections.wastedClicksPct)}</span>
                            </div>
                          </div>
                          <p className="text-orange-700">
                            <strong>{insightSections.wastedClicks.toLocaleString()}</strong> clicks went to PMax search terms with low CTR and no conversions. Cost is not exposed by Google for PMax, but these clicks still consumed budget.
                          </p>
                          <p className="text-orange-700 text-sm mt-2">
                            Add these as account-level negative keywords (PMax respects negatives applied at the account level).
                          </p>
                        </div>
                      )}

                      {/* Review Candidates */}
                      {insightSections.reviewCount > 0 && (
                        <div className="bg-slate-50 border-l-4 border-slate-500 p-6 rounded-r-lg">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-lg font-semibold text-slate-900">Review Before Negativing</h4>
                            <div className="bg-slate-100 px-3 py-1 rounded-full">
                              <span className="text-slate-900 font-bold text-lg">{insightSections.reviewCount}</span>
                            </div>
                          </div>
                          <p className="text-slate-900">
                            <strong>{insightSections.reviewCount} terms</strong> ({fmtPct(insightSections.reviewPct)} of total) have decent CTR but no conversions yet. They got <strong>{insightSections.reviewClicks.toLocaleString()}</strong> clicks total.
                          </p>
                          <p className="text-slate-900 text-sm mt-2">
                            These look engaged, read each one. Some may be relevant terms with a long sales cycle, slow attribution, or just a small sample. Don't bulk-negative them.
                          </p>
                        </div>
                      )}

                      {/* Costly conversions */}
                      {insightSections.hasCostData && insightSections.costlyCount > 0 && (
                        <div className="bg-slate-50 border-l-4 border-slate-500 p-6 rounded-r-lg">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-lg font-semibold text-slate-800">Costly Conversions (low ROAS)</h4>
                            <div className="bg-slate-100 px-3 py-1 rounded-full">
                              <span className="text-slate-800 font-bold text-lg">{insightSections.costlyCount}</span>
                            </div>
                          </div>
                          <p className="text-slate-700">
                            <strong>{insightSections.costlyCount} terms</strong> are converting but at low ROAS (&lt; 2.0). They burned <strong>{fmtMoney(insightSections.costlyCost)}</strong>.
                          </p>
                          <p className="text-slate-700 text-sm mt-2">
                            Consider lowering bids on the keywords that match these terms, or checking your landing-page conversion rate for them.
                          </p>
                        </div>
                      )}

                      {/* Action recommendations */}
                      <div className="mt-2 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h4 className="text-lg font-semibold text-gray-900">Quick Action Recommendations</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-green-700 whitespace-nowrap">• Immediate:</span>
                            <span>Filter the table to <strong>"Wasteful Spend"</strong> and add the obviously irrelevant terms as exact-match negatives.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-slate-700 whitespace-nowrap">• Same week:</span>
                            <span>Review every term in <strong>"High Engagement, No Conversion"</strong>. Don't bulk-negative, decide per term.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-emerald-700 whitespace-nowrap">• Long-term:</span>
                            <span>Build dedicated ad groups around themes from <strong>"Profitable"</strong> terms.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Bucket summary cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {periodData.summary_table
                      .filter((s) => s.bucket !== "TOTAL")
                      .sort((a, b) => BUCKET_ORDER.indexOf(a.bucket) - BUCKET_ORDER.indexOf(b.bucket))
                      .map((s) => (
                        <Card key={s.bucket} className={`border-2 ${BUCKET_COLOR[s.bucket] || ""}`}>
                          <CardContent className="p-3">
                            <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{s.bucket}</div>
                            <div className="text-2xl font-bold mt-1">{s.num_terms}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {s.total_clicks.toLocaleString()} clicks
                              {s.total_cost > 0 && <> · {fmtMoney(s.total_cost)}</>}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    <Card className="border-2 border-gray-400 bg-gray-100">
                      <CardContent className="p-3">
                        <div className="text-xs font-semibold uppercase tracking-wide opacity-80">Total</div>
                        <div className="text-2xl font-bold mt-1">{periodData.total_terms}</div>
                        <div className="text-xs opacity-70 mt-1">terms</div>
                      </CardContent>
                    </Card>
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
                    {periodData.campaign_list.length > 0 && (
                      <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                        <SelectTrigger className="w-72"><SelectValue placeholder="Filter by campaign" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All campaigns</SelectItem>
                          {periodData.campaign_list.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name} <span className="text-gray-400">({c.channel_type})</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button onClick={exportCsv} variant="outline" disabled={!filteredTerms.length}>
                      <Download className="w-4 h-4 mr-2" /> Download CSV
                    </Button>
                    <div className="text-sm text-gray-600 self-center ml-auto">
                      Showing <span className="font-semibold">{filteredTerms.length}</span> of {periodData.total_terms} terms
                    </div>
                  </div>

                  {selectedCampaign !== "all" && (
                    <div className="bg-emerald-50 border border-emerald-300 rounded p-3 text-sm text-emerald-900">
                      🔍 <strong>Per-campaign view active.</strong> Metrics in the table below are the contribution
                      from <span className="font-mono">{periodData.campaign_list.find(c => c.id === selectedCampaign)?.name || selectedCampaign}</span> only, not the cross-campaign total. If you don't see numbers change after picking a campaign, your browser is still running the old build (hard refresh with Cmd/Ctrl+Shift+Delete → clear cached files for localhost, then reload).
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
                            <SortHeader col="total_conversions" label="Conv" />
                            <SortHeader col="total_conversion_value" label="Conv value" />
                            <SortHeader col="roas" label="ROAS" />
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTerms.map((r, i) => (
                            <tr key={`${r.search_term}-${i}`} className="border-t hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">
                                <span className="inline-flex items-center gap-2">
                                  {r.search_term}
                                  {r.category === "High Engagement, No Conversion" && (
                                    <span title="May be a relevant term, review manually before negativing">
                                      <Info className="w-3.5 h-3.5 text-slate-500" />
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs border ${BUCKET_COLOR[r.category] || ""}`}>
                                  {r.category}
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
                              <td className="text-right px-3 py-2 tabular-nums">{fmtMoney(r.total_conversion_value)}</td>
                              <td className="text-right px-3 py-2 tabular-nums">
                                {r.has_cost_data && r.total_cost > 0 ? r.roas.toFixed(2) : <span className="text-gray-300">-</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-3 py-2 text-xs text-gray-500 border-t bg-gray-50">
                      Cost &amp; ROAS are shown only for Search/Shopping/Display terms, Google does not expose cost-per-search-term for Performance Max.
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

const KeywordsReportPage = () => (
  <DashboardShell>
    {({ selectedAccountId, selectedAccountName }) => (
      <KeywordsReportInner
        selectedAccountId={selectedAccountId}
        selectedAccountName={selectedAccountName}
      />
    )}
  </DashboardShell>
);

export default KeywordsReportPage;
