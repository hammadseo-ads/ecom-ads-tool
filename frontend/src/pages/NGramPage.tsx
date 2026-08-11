// N-Gram Analysis page.
//
// Reads from KeywordSearchTermReport (the keyword tool's stored data), does
// NOT hit Google Ads API. So this page works as long as the user has
// generated keyword reports first. If not, page tells them to do that.
//
// Two side-by-side tables: "Top Performing" (sorted by ROAS desc) and
// "Wasted Spend" (sorted by cost desc among zero/low-conv n-grams).

import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import {
  ArrowLeft, RefreshCw, Trash2, Sparkles, Type, AlertTriangle,
  TrendingUp, TrendingDown, Download,
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

const API_BASE = "/api/ngrams";

interface NGramRow {
  ngram: string;
  ngram_size: number;
  source_type: string;
  source_term_count: number;
  has_cost_data: boolean;
  total_impressions: number;
  total_clicks: number;
  total_cost: number;
  total_conversions: number;
  total_conversion_value: number;
  ctr: number;
  conv_rate: number;
  roas: number;
  cpa: number;
}

interface PeriodData {
  ngrams: NGramRow[];
  total_ngrams: number;
  source_term_count_total: number;
  source_type: string;
  ngram_size: number;
}

const REPORT_TABS = [
  { value: "LAST_30_DAYS", label: "Last 30 Days" },
  { value: "LAST_60_DAYS", label: "Last 60 Days" },
  { value: "LAST_90_DAYS", label: "Last 90 Days" },
];

const empty = (): PeriodData => ({
  ngrams: [], total_ngrams: 0, source_term_count_total: 0,
  source_type: "SEARCH", ngram_size: 2,
});

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
    "Content-Type": "application/json",
  },
  withCredentials: true as const,
});

const withAuthRetry = async <T,>(call: () => Promise<T>): Promise<T> => {
  try { return await call(); }
  catch (err: any) {
    if (err?.response?.status !== 401) throw err;
    try {
      const { data } = await axios.post("/api/auth/refresh-token", {}, { withCredentials: true });
      if (data?.accessToken) localStorage.setItem("accessToken", data.accessToken);
    } catch { throw err; }
    return await call();
  }
};

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n || 0);

interface InnerProps {
  selectedAccountId: string;
  selectedAccountName: string;
}

const NGramInner = ({ selectedAccountId, selectedAccountName }: InnerProps) => {
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
  const [progress, setProgress] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [sourceType, setSourceType] = useState<"SEARCH" | "PMAX">("SEARCH");
  const [ngramSize, setNgramSize] = useState<number>(2);
  const [filterStopWords, setFilterStopWords] = useState(true);
  const userPickedTabRef = useRef(false);

  const loadCachedData = async (accountId: string, source: string, size: number, stopWords: boolean) => {
    if (!userId || !accountId) {
      setReportData({ LAST_30_DAYS: empty(), LAST_60_DAYS: empty(), LAST_90_DAYS: empty() });
      return;
    }
    setReportData({ LAST_30_DAYS: empty(), LAST_60_DAYS: empty(), LAST_90_DAYS: empty() });

    const results = await Promise.all(
      REPORT_TABS.map(async ({ value }) => {
        try {
          const { data } = await withAuthRetry(() =>
            axios.post(`${API_BASE}/cached`, {
              user_id: userId, customer_id: accountId, report_type: value,
              source_type: source, ngram_size: size,
              filter_stop_words: stopWords,
            }, getAuthHeaders())
          );
          return { value, data: data as PeriodData };
        } catch { return { value, data: null }; }
      })
    );

    let firstAvailable: string | null = null;
    setReportData((prev) => {
      const next = { ...prev };
      for (const { value, data } of results) {
        // Keep the returned report even when the CURRENT source/size filter
        // has no matches — otherwise a saved report looks like it vanished
        // (source_term_count_total resets to 0). Auto-select the first tab that
        // actually has n-grams for the current filter.
        if (data) {
          next[value] = data;
          if (data.ngrams?.length && !firstAvailable) firstAvailable = value;
        }
      }
      return next;
    });
    if (firstAvailable && !userPickedTabRef.current) setActiveTab(firstAvailable);
  };

  // Load whenever any filter changes
  useEffect(() => {
    userPickedTabRef.current = false;
    loadCachedData(selectedAccountId, sourceType, ngramSize, filterStopWords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId, userId, sourceType, ngramSize, filterStopWords]);

  const pollUntilDone = async (accountId: string): Promise<any> => {
    const POLL = 3000, MAX = 100;
    for (let i = 0; i < MAX; i++) {
      await new Promise((r) => setTimeout(r, POLL));
      try {
        const { data } = await withAuthRetry(() =>
          axios.post(`${API_BASE}/status`, { user_id: userId, customer_id: accountId }, getAuthHeaders())
        );
        if (data?.progress) setProgress(data.progress);
        if (data?.status === "COMPLETED") return data;
        if (data?.status === "FAILED") throw new Error(data.error || "Generation failed");
      } catch (e: any) {
        if (e?.message?.includes("Generation failed")) throw e;
      }
    }
    throw new Error("Generation took too long.");
  };

  const handleGenerate = async () => {
    if (!selectedAccountId) {
      toast({ title: "Pick an account", description: "Select an account first.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setProgress("Starting...");
    toast({
      title: "Generating",
      description: "Aggregating n-grams from your stored search terms (no Google API calls).",
      duration: 6000,
    });
    try {
      const { data: kicked } = await withAuthRetry(() =>
        axios.post(`${API_BASE}/generate`,
          { user_id: userId, customer_id: selectedAccountId },
          getAuthHeaders())
      );
      if (kicked?.status === "ALREADY_RUNNING") {
        toast({ title: "Already in progress" });
      }
      const final = await pollUntilDone(selectedAccountId);
      toast({
        title: "Done",
        description: `Aggregated n-grams from ${final?.result?.total_source_terms ?? 0} search terms.`,
      });
      await loadCachedData(selectedAccountId, sourceType, ngramSize, filterStopWords);
    } catch (e: any) {
      toast({
        title: "Generation failed",
        description: e.response?.data?.error || e.message ||
          "Try generating Keyword Reports first (Dashboard → Negative Keywords & Search Terms).",
        variant: "destructive",
      });
    } finally { setIsGenerating(false); setProgress(""); }
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
      toast({ title: "Cleared", description: "N-gram aggregates removed." });
    } catch (e: any) {
      toast({ title: "Clear failed", description: e.message, variant: "destructive" });
    } finally { setIsClearing(false); }
  };

  const periodData = reportData[activeTab] || empty();

  // Top-performing: ROAS desc, requires conversions and (for SEARCH) cost
  // Wasted-spend: cost desc among zero-conv (or for PMAX, clicks desc among zero-conv)
  const { topPerforming, wastedSpend } = useMemo(() => {
    const minTermsThreshold = 2; // n-gram must appear in at least N source terms
    const list = periodData.ngrams.filter((n) => n.source_term_count >= minTermsThreshold);

    const topPerf = [...list]
      .filter((n) => n.total_conversions >= 1)
      .sort((a, b) => {
        // SEARCH: ROAS preferred; PMAX: conversions preferred
        if (sourceType === "SEARCH") return b.roas - a.roas || b.total_conversions - a.total_conversions;
        return b.total_conversions - a.total_conversions;
      })
      .slice(0, 50);

    const wasted = [...list]
      .filter((n) => n.total_conversions === 0 && n.total_clicks >= 5)
      .sort((a, b) => {
        if (sourceType === "SEARCH") return b.total_cost - a.total_cost;
        return b.total_clicks - a.total_clicks;
      })
      .slice(0, 50);

    return { topPerforming: topPerf, wastedSpend: wasted };
  }, [periodData, sourceType]);

  const exportCsv = (rows: NGramRow[], suffix: string) => {
    if (!rows.length) return;
    const headers = ["ngram", "ngram_size", "source_type", "source_term_count",
      "impressions", "clicks", "ctr_pct", "cost", "conversions", "conv_value", "roas"];
    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push([
        `"${r.ngram.replace(/"/g, '""')}"`, r.ngram_size, r.source_type, r.source_term_count,
        r.total_impressions, r.total_clicks, r.ctr.toFixed(2),
        r.has_cost_data ? r.total_cost.toFixed(2) : "",
        r.total_conversions.toFixed(2), r.total_conversion_value.toFixed(2),
        r.has_cost_data ? r.roas.toFixed(2) : "",
      ].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ngrams-${selectedAccountId}-${activeTab}-${sourceType}-${ngramSize}gram-${suffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to tools
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="w-6 h-6 text-emerald-600" />
            <CardTitle className="text-2xl">N-Gram Analysis</CardTitle>
          </div>
          <CardDescription>
            Find which words and phrases drive your spend &amp; conversions for{" "}
            <span className="font-semibold">{selectedAccountName || "-"}</span>{" "}
            {selectedAccountId && <span className="text-gray-400">({selectedAccountId})</span>}
            <br />
            <span className="text-xs text-gray-500">
              Computed from your Keyword Analysis data, no Google API calls. Run{" "}
              <button
                className="text-emerald-700 underline"
                onClick={() => navigate("/dashboard/keywords")}
              >Keyword Reports</button>{" "}
              first, then Generate here.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedAccountId ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleGenerate} disabled={isGenerating} className="bg-emerald-600 hover:bg-emerald-700">
                  {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  {isGenerating ? "Aggregating..." : "Generate N-Grams"}
                </Button>
                <Button onClick={handleClear} disabled={isClearing || isGenerating || !periodData.total_ngrams} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" /> Clear
                </Button>
              </div>
              {isGenerating && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-300 rounded text-sm text-emerald-900">
                  <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>{progress || "Starting..."}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Select an account from the navigation above.</p>
          )}
        </CardContent>
      </Card>

      {selectedAccountId && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <Label className="text-xs">Source</Label>
                  <Select value={sourceType} onValueChange={(v: any) => setSourceType(v)}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEARCH">Search / Shopping</SelectItem>
                      <SelectItem value="PMAX">Performance Max</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">N-gram size</Label>
                  <Select value={String(ngramSize)} onValueChange={(v) => setNgramSize(Number(v))}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1-gram (single word)</SelectItem>
                      <SelectItem value="2">2-gram (pair)</SelectItem>
                      <SelectItem value="3">3-gram (triplet)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 self-end">
                  <Switch id="stopwords" checked={filterStopWords} onCheckedChange={setFilterStopWords} />
                  <Label htmlFor="stopwords" className="text-sm cursor-pointer">Hide stop words (the / a / for / etc.)</Label>
                </div>
                <Badge variant="outline" className="ml-auto self-end border-emerald-300 text-emerald-800">
                  {periodData.source_term_count_total} source search terms
                </Badge>
              </div>
            </CardContent>
          </Card>

          {sourceType === "PMAX" && (
            <div className="flex gap-3 p-4 bg-slate-50 border border-slate-300 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-900">
                <p className="font-semibold mb-1">PMax n-grams have no cost data.</p>
                <p>
                  Google does not expose cost-per-search-term for Performance Max. Conversions and
                  conversion value are still aggregated, but ROAS / cost columns will be blank.
                  Use clicks and conversions to identify wasted patterns. Add as account-level
                  negatives, PMax respects them.
                </p>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={(v) => { userPickedTabRef.current = true; setActiveTab(v); }}>
            <TabsList className="grid w-full grid-cols-3">
              {REPORT_TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
            </TabsList>
            {REPORT_TABS.map((t) => (
              <TabsContent key={t.value} value={t.value} className="space-y-6">
                {periodData.ngrams.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      <Type className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      {periodData.source_term_count_total > 0 ? (
                        <>
                          <p>This report has {periodData.source_term_count_total.toLocaleString()} search terms, but no <strong>{sourceType === "SEARCH" ? "Search" : "Performance Max"}</strong> {ngramSize}-grams.</p>
                          <p className="text-sm mt-1">
                            Your data is saved — try switching <strong>Source</strong>{" "}
                            ({sourceType === "SEARCH" ? "Performance Max" : "Search"}) or the <strong>n-gram size</strong> above. No need to regenerate.
                          </p>
                        </>
                      ) : (
                        <>
                          <p>No n-grams for {t.label.toLowerCase()} ({sourceType}, {ngramSize}-gram).</p>
                          <p className="text-sm mt-1">
                            Either no source data yet, run{" "}
                            <button className="text-emerald-700 underline" onClick={() => navigate("/dashboard/keywords")}>
                              Keyword Reports
                            </button>{" "}
                            first, or click <strong>Generate N-Grams</strong> above.
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Top performing */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-emerald-600" />
                          Top Performing N-Grams
                        </CardTitle>
                        <CardDescription>
                          Sorted by {sourceType === "SEARCH" ? "ROAS" : "conversions"} desc.
                          Min 2 source terms.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="px-4 pb-2 flex justify-end">
                          <Button onClick={() => exportCsv(topPerforming, "top")} variant="outline" size="sm" disabled={!topPerforming.length}>
                            <Download className="w-3 h-3 mr-1" /> CSV
                          </Button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                              <tr>
                                <th className="text-left px-3 py-2">N-gram</th>
                                <th className="text-right px-3 py-2">Terms</th>
                                <th className="text-right px-3 py-2">Clicks</th>
                                {sourceType === "SEARCH" && <th className="text-right px-3 py-2">Cost</th>}
                                <th className="text-right px-3 py-2">Conv</th>
                                {sourceType === "SEARCH" && <th className="text-right px-3 py-2">ROAS</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {topPerforming.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-6 text-gray-400 text-xs">No converting n-grams yet.</td></tr>
                              ) : topPerforming.map((r, i) => (
                                <tr key={i} className="border-t hover:bg-gray-50">
                                  <td className="px-3 py-2 font-medium text-gray-900">{r.ngram}</td>
                                  <td className="text-right px-3 py-2 tabular-nums text-gray-500">{r.source_term_count}</td>
                                  <td className="text-right px-3 py-2 tabular-nums">{r.total_clicks.toLocaleString()}</td>
                                  {sourceType === "SEARCH" && (
                                    <td className="text-right px-3 py-2 tabular-nums">
                                      {r.has_cost_data ? fmtMoney(r.total_cost) : <span className="text-gray-300">-</span>}
                                    </td>
                                  )}
                                  <td className="text-right px-3 py-2 tabular-nums">{r.total_conversions.toFixed(1)}</td>
                                  {sourceType === "SEARCH" && (
                                    <td className="text-right px-3 py-2 tabular-nums font-semibold text-emerald-700">
                                      {r.has_cost_data && r.total_cost > 0 ? r.roas.toFixed(2) : <span className="text-gray-300">-</span>}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Wasted spend / clicks */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingDown className="w-5 h-5 text-slate-600" />
                          Wasted {sourceType === "SEARCH" ? "Spend" : "Clicks"} N-Grams
                        </CardTitle>
                        <CardDescription>
                          ≥ 5 clicks, zero conversions. Sorted by{" "}
                          {sourceType === "SEARCH" ? "cost" : "clicks"} desc, top negative
                          keyword candidates.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="px-4 pb-2 flex justify-end">
                          <Button onClick={() => exportCsv(wastedSpend, "wasted")} variant="outline" size="sm" disabled={!wastedSpend.length}>
                            <Download className="w-3 h-3 mr-1" /> CSV
                          </Button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                              <tr>
                                <th className="text-left px-3 py-2">N-gram</th>
                                <th className="text-right px-3 py-2">Terms</th>
                                <th className="text-right px-3 py-2">Impr.</th>
                                <th className="text-right px-3 py-2">Clicks</th>
                                {sourceType === "SEARCH" && <th className="text-right px-3 py-2">Cost</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {wastedSpend.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-6 text-gray-400 text-xs">No wasted-spend n-grams.</td></tr>
                              ) : wastedSpend.map((r, i) => (
                                <tr key={i} className="border-t hover:bg-gray-50">
                                  <td className="px-3 py-2 font-medium text-gray-900">{r.ngram}</td>
                                  <td className="text-right px-3 py-2 tabular-nums text-gray-500">{r.source_term_count}</td>
                                  <td className="text-right px-3 py-2 tabular-nums">{r.total_impressions.toLocaleString()}</td>
                                  <td className="text-right px-3 py-2 tabular-nums">{r.total_clicks.toLocaleString()}</td>
                                  {sourceType === "SEARCH" && (
                                    <td className="text-right px-3 py-2 tabular-nums font-semibold text-slate-700">
                                      {r.has_cost_data ? fmtMoney(r.total_cost) : <span className="text-gray-300">-</span>}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
};

const NGramPage = () => (
  <DashboardShell>
    {({ selectedAccountId, selectedAccountName }) => (
      <NGramInner selectedAccountId={selectedAccountId} selectedAccountName={selectedAccountName} />
    )}
  </DashboardShell>
);

export default NGramPage;
