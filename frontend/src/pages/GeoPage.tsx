// Geographic / Zip Code Performance Analysis page.
//
// Locations are bucketed Winner / Loser / Sparse based on user thresholds.
// Per-row action labels respect campaign type:
//   - Search/Shopping campaigns: "Adjust bid" or "Exclude"
//   - PMax campaigns: "Exclude only", Google doesn't allow location bid
//     adjustments in PMax
// If a location is hit by BOTH PMax and other channels, we show "Mixed -
// adjust bids on Search/Shopping; exclude in PMax".

import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import {
  ArrowLeft, RefreshCw, Trash2, MapPin, Trophy, TrendingDown, Layers,
  Save, Download, Sparkles, ChevronUp, ChevronDown, AlertTriangle,
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

const API_BASE = "/api/geo";

interface CampaignContrib {
  campaign_id: string;
  campaign_name: string;
  channel_type: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversion_value: number;
}

interface GeoRow {
  criterion_id: string;
  name: string;
  canonical_name: string;
  target_type: string;
  country_code: string;
  total_impressions: number;
  total_clicks: number;
  total_cost: number;
  total_conversions: number;
  total_conversion_value: number;
  ctr: number;
  conv_rate: number;
  roas: number;
  cpa: number;
  bucket: string;
  campaigns: CampaignContrib[];
}

interface PeriodData {
  rows: GeoRow[];
  summary_table: { bucket: string; num_locations: number; total_cost: number; total_conversions: number; total_conversion_value: number; roas: number; ctr: number }[];
  total_locations: number;
  granularity: string;
}

interface Thresholds {
  targetRoas: number;
  maxLoserRoas: number;
  minSpend: number;
}

const REPORT_TABS = [
  { value: "LAST_30_DAYS", label: "Last 30 Days" },
  { value: "LAST_60_DAYS", label: "Last 60 Days" },
  { value: "LAST_90_DAYS", label: "Last 90 Days" },
  { value: "LAST_365_DAYS", label: "Last 1 Year" }, // opt-in — generated only on demand
];

const GRANULARITIES = [
  { value: "postal_code", label: "Postal Code (Zip)" },
  { value: "city", label: "City" },
  { value: "region", label: "Region (State/Province)" },
  { value: "metro", label: "Metro" },
];

const BUCKET_META: Record<string, { color: string; icon: any; description: string }> = {
  Winner: { color: "text-green-700 bg-green-50 border-green-300", icon: Trophy, description: "ROAS ≥ target, bid up or focus more here" },
  Loser:  { color: "text-slate-700 bg-slate-50 border-slate-300", icon: TrendingDown, description: "Spending without return, exclude or bid down" },
  Sparse: { color: "text-gray-600 bg-gray-50 border-gray-300", icon: Layers, description: "Below min-spend, not enough data yet" },
};
const BUCKET_ORDER = ["Winner", "Loser", "Sparse"];

const empty = (): PeriodData => ({ rows: [], summary_table: [], total_locations: 0, granularity: "postal_code" });

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

// Action label per row: depends on which campaign types contributed.
const actionLabel = (row: GeoRow): { text: string; color: string } => {
  const channels = new Set(row.campaigns.map((c) => c.channel_type));
  const hasPMax = channels.has("PERFORMANCE_MAX");
  const hasOther = [...channels].some((c) => c !== "PERFORMANCE_MAX" && c !== "UNKNOWN");
  if (row.bucket === "Winner") {
    if (hasPMax && !hasOther) return { text: "Keep / can't bid-up (PMax)", color: "text-emerald-700" };
    if (hasPMax && hasOther) return { text: "Mixed, bid up on Search/Shopping", color: "text-emerald-700" };
    return { text: "Bid UP or focus more", color: "text-emerald-700" };
  }
  if (row.bucket === "Loser") {
    if (hasPMax && !hasOther) return { text: "Exclude (PMax bid-down not allowed)", color: "text-slate-700" };
    if (hasPMax && hasOther) return { text: "Bid down on Search/Shopping; exclude in PMax", color: "text-slate-700" };
    return { text: "Bid DOWN or exclude", color: "text-slate-700" };
  }
  return { text: "Wait for more data", color: "text-gray-500" };
};

interface InnerProps {
  selectedAccountId: string;
  selectedAccountName: string;
}

const GeoInner = ({ selectedAccountId, selectedAccountName }: InnerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useUser();

  const [granularity, setGranularity] = useState("postal_code");
  const [activeTab, setActiveTab] = useState("LAST_30_DAYS");
  const [reportData, setReportData] = useState<Record<string, PeriodData>>({
    LAST_30_DAYS: empty(),
    LAST_60_DAYS: empty(),
    LAST_90_DAYS: empty(),
    LAST_365_DAYS: empty(),
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingYear, setIsGeneratingYear] = useState(false);
  const [progress, setProgress] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  const [sortBy, setSortBy] = useState<keyof GeoRow>("total_cost");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const userPickedTabRef = useRef(false);

  const [thresholds, setThresholds] = useState<Thresholds>({
    targetRoas: 3, maxLoserRoas: 1.5, minSpend: 25,
  });
  const [isSavingThresholds, setIsSavingThresholds] = useState(false);

  // Load thresholds
  useEffect(() => {
    if (!selectedAccountId || !userId) return;
    (async () => {
      try {
        const { data } = await withAuthRetry(() =>
          axios.post(`${API_BASE}/thresholds`, { customer_id: selectedAccountId }, getAuthHeaders())
        );
        if (data?.thresholds) setThresholds(data.thresholds);
      } catch {/* defaults */}
    })();
  }, [selectedAccountId, userId]);

  const loadCachedData = async (accountId: string, gran: string) => {
    if (!userId || !accountId) {
      setReportData({ LAST_30_DAYS: empty(), LAST_60_DAYS: empty(), LAST_90_DAYS: empty(), LAST_365_DAYS: empty() });
      return;
    }
    setReportData({ LAST_30_DAYS: empty(), LAST_60_DAYS: empty(), LAST_90_DAYS: empty(), LAST_365_DAYS: empty() });
    setSelectedBucket("all");

    const results = await Promise.all(
      REPORT_TABS.map(async ({ value }) => {
        try {
          const { data } = await withAuthRetry(() =>
            axios.post(`${API_BASE}/cached`,
              { user_id: userId, customer_id: accountId, report_type: value, granularity: gran },
              getAuthHeaders())
          );
          return { value, data: data as PeriodData };
        } catch { return { value, data: null }; }
      })
    );

    let firstAvailable: string | null = null;
    setReportData((prev) => {
      const next = { ...prev };
      for (const { value, data } of results) {
        if (data?.rows?.length) {
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
    loadCachedData(selectedAccountId, granularity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId, userId, granularity]);

  const pollUntilDone = async (accountId: string): Promise<any> => {
    const POLL = 4000, MAX = 150;
    for (let i = 0; i < MAX; i++) {
      await new Promise((r) => setTimeout(r, POLL));
      try {
        const { data } = await withAuthRetry(() =>
          axios.post(`${API_BASE}/status`, { user_id: userId, customer_id: accountId, granularity }, getAuthHeaders())
        );
        if (data?.progress) setProgress(data.progress);
        if (data?.status === "COMPLETED") return data;
        if (data?.status === "FAILED") throw new Error(data.error || "Generation failed");
      } catch (e: any) {
        if (e?.message?.includes("Generation failed")) throw e;
      }
    }
    throw new Error("Generation took longer than 10 minutes, check backend logs.");
  };

  const handleSaveThresholds = async () => {
    if (!selectedAccountId) return;
    setIsSavingThresholds(true);
    try {
      const { data } = await withAuthRetry(() =>
        axios.post(`${API_BASE}/thresholds/update`,
          { customer_id: selectedAccountId, thresholds },
          getAuthHeaders())
      );
      if (data?.thresholds) setThresholds(data.thresholds);
      toast({ title: "Thresholds saved", description: "Click Generate to re-bucket locations." });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally { setIsSavingThresholds(false); }
  };

  const runGeneration = async (scope: "standard" | "year") => {
    if (!selectedAccountId) {
      toast({ title: "Pick an account", description: "Select an account first.", variant: "destructive" });
      return;
    }
    const isYear = scope === "year";
    (isYear ? setIsGeneratingYear : setIsGenerating)(true);
    setProgress("Starting...");
    toast({
      title: isYear ? "Generating 1-Year report" : "Generating",
      description: isYear
        ? `Pulling a full year of ${granularity.replace("_", " ")} performance. This is much heavier — can take several minutes.`
        : `Pulling ${granularity.replace("_", " ")} performance for 30/60/90 days. Can take 1-3 min (geo lookups are slow).`,
      duration: 8000,
    });
    try {
      const { data: kicked } = await withAuthRetry(() =>
        axios.post(`${API_BASE}/generate`,
          { user_id: userId, customer_id: selectedAccountId, granularity, ...(isYear ? { scope: "year" } : {}) },
          getAuthHeaders())
      );
      if (kicked?.status === "ALREADY_RUNNING") {
        toast({ title: "Already in progress" });
      }
      const final = await pollUntilDone(selectedAccountId);
      toast({
        title: "Done",
        description: `Loaded ${final?.count ?? 0} locations.`,
      });
      await loadCachedData(selectedAccountId, granularity);
      if (isYear) { userPickedTabRef.current = true; setActiveTab("LAST_365_DAYS"); }
    } catch (e: any) {
      toast({
        title: "Generation failed",
        description: e.response?.data?.error || e.message || "Try again.",
        variant: "destructive",
      });
    } finally { (isYear ? setIsGeneratingYear : setIsGenerating)(false); setProgress(""); }
  };

  const handleGenerate = () => runGeneration("standard");
  const handleGenerateYear = () => runGeneration("year");

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
      setReportData({ LAST_30_DAYS: empty(), LAST_60_DAYS: empty(), LAST_90_DAYS: empty(), LAST_365_DAYS: empty() });
      toast({ title: "Cleared", description: "Geo data removed for this account." });
    } catch (e: any) {
      toast({ title: "Clear failed", description: e.message, variant: "destructive" });
    } finally { setIsClearing(false); }
  };

  const periodData = reportData[activeTab] || empty();

  const filteredRows = useMemo(() => {
    let rows = periodData.rows || [];
    if (selectedBucket !== "all") rows = rows.filter((r) => r.bucket === selectedBucket);
    return [...rows].sort((a, b) => {
      const av = a[sortBy] as number;
      const bv = b[sortBy] as number;
      const cmp = (av || 0) - (bv || 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [periodData, selectedBucket, sortBy, sortDir]);

  const SortHeader = ({ col, label }: { col: keyof GeoRow; label: string }) => (
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
    if (!filteredRows.length) return;
    const headers = ["criterion_id", "name", "canonical_name", "country", "bucket", "impressions", "clicks", "ctr_pct", "cost", "conversions", "conv_value", "roas", "cpa", "channels"];
    const lines = [headers.join(",")];
    for (const r of filteredRows) {
      const channels = Array.from(new Set(r.campaigns.map((c) => c.channel_type))).join("|");
      lines.push([
        r.criterion_id, `"${r.name}"`, `"${r.canonical_name}"`, r.country_code, r.bucket,
        r.total_impressions, r.total_clicks, r.ctr.toFixed(2),
        r.total_cost.toFixed(2), r.total_conversions.toFixed(2),
        r.total_conversion_value.toFixed(2), r.roas.toFixed(2), r.cpa.toFixed(2),
        channels,
      ].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `geo-${selectedAccountId}-${activeTab}-${granularity}-${selectedBucket}.csv`;
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
            <MapPin className="w-6 h-6 text-emerald-600" />
            <CardTitle className="text-2xl">Geographic Performance</CardTitle>
          </div>
          <CardDescription>
            Find your winning &amp; losing zip codes, cities, regions, and metros for{" "}
            <span className="font-semibold">{selectedAccountName || "-"}</span>{" "}
            {selectedAccountId && <span className="text-gray-400">({selectedAccountId})</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedAccountId ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3 items-center">
                <div>
                  <Label htmlFor="gran" className="text-xs">Granularity</Label>
                  <Select value={granularity} onValueChange={setGranularity}>
                    <SelectTrigger id="gran" className="w-56"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GRANULARITIES.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerate} disabled={isGenerating || isGeneratingYear} className="bg-emerald-600 hover:bg-emerald-700 mt-5">
                  {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  {isGenerating ? "Generating..." : "Generate Reports"}
                </Button>
                <Button onClick={handleGenerateYear} disabled={isGenerating || isGeneratingYear} variant="outline" className="text-emerald-700 border-emerald-400 hover:bg-emerald-50 mt-5" title="Fetches a full year of geo data — only when you click this">
                  {isGeneratingYear ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {isGeneratingYear ? "Generating 1-Year..." : "Generate 1-Year"}
                </Button>
                <Button onClick={handleClear} disabled={isClearing || isGenerating || !periodData.total_locations} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 mt-5">
                  <Trash2 className="w-4 h-4 mr-2" /> Clear Reports
                </Button>
              </div>
              {isGenerating && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-300 rounded text-sm text-emerald-900">
                  <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span><strong>Working in background:</strong> {progress || "Starting..."}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Select an account from the navigation above.</p>
          )}
        </CardContent>
      </Card>

      {/* Threshold config */}
      {selectedAccountId && (
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Bucket thresholds
            </CardTitle>
            <CardDescription>Saved per account. Edit + Save, then re-Generate to re-bucket.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="g-targetRoas">Winner ROAS ≥</Label>
                <Input id="g-targetRoas" type="number" step="0.1" min="0" value={thresholds.targetRoas}
                  onChange={(e) => setThresholds({ ...thresholds, targetRoas: Number(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="g-maxLoserRoas">Loser ROAS &lt;</Label>
                <Input id="g-maxLoserRoas" type="number" step="0.1" min="0" value={thresholds.maxLoserRoas}
                  onChange={(e) => setThresholds({ ...thresholds, maxLoserRoas: Number(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="g-minSpend">Min spend</Label>
                <Input id="g-minSpend" type="number" step="1" min="0" value={thresholds.minSpend}
                  onChange={(e) => setThresholds({ ...thresholds, minSpend: Number(e.target.value) })} />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleSaveThresholds} disabled={isSavingThresholds} variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                <Save className="w-4 h-4 mr-2" />
                {isSavingThresholds ? "Saving..." : "Save thresholds"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedAccountId && (
        <Tabs value={activeTab} onValueChange={(v) => { userPickedTabRef.current = true; setActiveTab(v); }}>
          <TabsList className="grid w-full grid-cols-4">
            {REPORT_TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
          </TabsList>
          {REPORT_TABS.map((t) => (
            <TabsContent key={t.value} value={t.value} className="space-y-6">
              {periodData.rows.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No {GRANULARITIES.find(g => g.value === granularity)?.label} data for {t.label.toLowerCase()}.</p>
                    <p className="text-sm mt-1">Click <strong>{t.value === "LAST_365_DAYS" ? "Generate 1-Year" : "Generate Reports"}</strong> above.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Bucket cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {periodData.summary_table
                      .sort((a, b) => BUCKET_ORDER.indexOf(a.bucket) - BUCKET_ORDER.indexOf(b.bucket))
                      .map((s) => {
                        const meta = BUCKET_META[s.bucket];
                        if (!meta) return null;
                        const Icon = meta.icon;
                        return (
                          <Card key={s.bucket} className={`border-2 ${meta.color}`}>
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{s.bucket}</div>
                                <Icon className="w-4 h-4 opacity-70" />
                              </div>
                              <div className="text-2xl font-bold">{s.num_locations}</div>
                              <div className="text-xs opacity-70 mt-1">
                                {fmtMoney(s.total_cost)} · ROAS {s.roas.toFixed(2)}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    <Card className="border-2 border-gray-400 bg-gray-100">
                      <CardContent className="p-3">
                        <div className="text-xs font-semibold uppercase tracking-wide opacity-80">Total</div>
                        <div className="text-2xl font-bold mt-1">{periodData.total_locations}</div>
                        <div className="text-xs opacity-70 mt-1">locations</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* PMax warning */}
                  <div className="flex gap-3 p-4 bg-slate-50 border border-slate-300 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-900">
                      <span className="font-semibold">Important:</span> PMax campaigns don't support
                      location-based bid adjustments, only full <em>exclusion</em>. Action labels
                      below are tailored per row based on which campaign types contributed.
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                      <SelectTrigger className="w-64"><SelectValue placeholder="Filter by bucket" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All buckets</SelectItem>
                        {BUCKET_ORDER.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button onClick={exportCsv} variant="outline" disabled={!filteredRows.length}>
                      <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                    <div className="text-sm text-gray-600 self-center ml-auto">
                      Showing <span className="font-semibold">{filteredRows.length}</span> of {periodData.total_locations} locations
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                          <tr>
                            <th className="text-left px-3 py-2">Location</th>
                            <th className="text-left px-3 py-2">Bucket</th>
                            <th className="text-left px-3 py-2">Suggested action</th>
                            <SortHeader col="total_impressions" label="Impr." />
                            <SortHeader col="total_clicks" label="Clicks" />
                            <SortHeader col="total_cost" label="Cost" />
                            <SortHeader col="total_conversions" label="Conv" />
                            <SortHeader col="roas" label="ROAS" />
                            <SortHeader col="cpa" label="CPA" />
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRows.map((r, i) => {
                            const action = actionLabel(r);
                            return (
                              <tr key={`${r.criterion_id}-${i}`} className="border-t hover:bg-gray-50">
                                <td className="px-3 py-2">
                                  <div className="font-medium text-gray-900">{r.name}</div>
                                  <div className="text-xs text-gray-500">{r.canonical_name}</div>
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`inline-block px-2 py-0.5 rounded text-xs border ${BUCKET_META[r.bucket]?.color || ""}`}>
                                    {r.bucket}
                                  </span>
                                </td>
                                <td className={`px-3 py-2 text-xs ${action.color}`}>{action.text}</td>
                                <td className="text-right px-3 py-2 tabular-nums">{r.total_impressions.toLocaleString()}</td>
                                <td className="text-right px-3 py-2 tabular-nums">{r.total_clicks.toLocaleString()}</td>
                                <td className="text-right px-3 py-2 tabular-nums">{fmtMoney(r.total_cost)}</td>
                                <td className="text-right px-3 py-2 tabular-nums">{r.total_conversions.toFixed(1)}</td>
                                <td className="text-right px-3 py-2 tabular-nums">
                                  {r.total_cost > 0 ? r.roas.toFixed(2) : <span className="text-gray-300">-</span>}
                                </td>
                                <td className="text-right px-3 py-2 tabular-nums">
                                  {r.total_conversions > 0 ? fmtMoney(r.cpa) : <span className="text-gray-300">-</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
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

const GeoPage = () => (
  <DashboardShell>
    {({ selectedAccountId, selectedAccountName }) => (
      <GeoInner selectedAccountId={selectedAccountId} selectedAccountName={selectedAccountName} />
    )}
  </DashboardShell>
);

export default GeoPage;
