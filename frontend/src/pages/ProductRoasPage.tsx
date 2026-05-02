// PMax Product ROAS Analysis page (Mike Rhodes-style bucketing).
//
// Layout:
//   - Threshold-config card at top (user-saved per account)
//   - Generate / Clear buttons + 3 period tabs (30/60/90 days)
//   - 5 bucket summary cards
//   - Filter bar (bucket, sort)
//   - Sortable table per period (with CSV export per filtered view)
//
// Architecture mirrors KeywordsReportPage: async generation + polling, with
// the same auth-retry wrapper and per-account cache loading.

import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Trash2,
  Sparkles,
  ShoppingBag,
  Trophy,
  TrendingDown,
  Skull,
  Clock,
  Layers,
  Save,
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

const API_BASE = "/api/product-roas";

interface CampaignContribution {
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversion_value: number;
}

interface ProductRow {
  product_item_id: string;
  product_title: string;
  product_brand?: string;
  total_impressions: number;
  total_clicks: number;
  total_cost: number;
  total_conversions: number;
  total_conversion_value: number;
  ctr: number;
  roas: number;
  cpa: number;
  conv_rate: number;
  bucket: string;
  campaigns?: CampaignContribution[];
}

interface SummaryRow {
  bucket: string;
  num_products: number;
  total_impressions: number;
  total_clicks: number;
  total_cost: number;
  total_conversions: number;
  total_conversion_value: number;
  ctr: number;
  roas: number;
  cpa: number;
}

interface PeriodData {
  product_details: ProductRow[];
  summary_table: SummaryRow[];
  total_products: number;
}

interface Thresholds {
  targetRoas: number;
  costlyRoasMax: number;
  minSpend: number;
  minClicksForSleeper: number;
}

const REPORT_TABS = [
  { value: "LAST_30_DAYS", label: "Last 30 Days", short: "30 days" },
  { value: "LAST_60_DAYS", label: "Last 60 Days", short: "60 days" },
  { value: "LAST_90_DAYS", label: "Last 90 Days", short: "90 days" },
];

const BUCKET_ORDER = ["Heroes", "Costly", "Zombies", "Sleepers", "Low Volume"];

const BUCKET_META: Record<string, { color: string; icon: any; description: string }> = {
  Heroes: { color: "text-green-700 bg-green-50 border-green-300", icon: Trophy,
    description: "High ROAS, high spend — protect & scale" },
  Costly: { color: "text-red-700 bg-red-50 border-red-300", icon: TrendingDown,
    description: "High spend, weak ROAS — cut or restructure" },
  Zombies: { color: "text-gray-700 bg-gray-100 border-gray-400", icon: Skull,
    description: "Impressions but ZERO clicks — title/image issue" },
  Sleepers: { color: "text-amber-800 bg-amber-50 border-amber-300", icon: Clock,
    description: "Clicks but ZERO conversions — funnel issue" },
  "Low Volume": { color: "text-blue-700 bg-blue-50 border-blue-300", icon: Layers,
    description: "Below min-spend — insufficient data" },
};

const empty = (): PeriodData => ({ product_details: [], summary_table: [], total_products: 0 });

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

const ProductRoasInner = ({ selectedAccountId, selectedAccountName }: InnerProps) => {
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
  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  const [sortBy, setSortBy] = useState<keyof ProductRow>("total_cost");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const userPickedTabRef = useRef(false);

  // Thresholds (per-account, server-saved)
  const [thresholds, setThresholds] = useState<Thresholds>({
    targetRoas: 4, costlyRoasMax: 2, minSpend: 50, minClicksForSleeper: 5,
  });
  const [isSavingThresholds, setIsSavingThresholds] = useState(false);

  // Load thresholds when account changes
  useEffect(() => {
    if (!selectedAccountId || !userId) return;
    (async () => {
      try {
        const { data } = await withAuthRetry(() =>
          axios.post(`${API_BASE}/thresholds`, { customer_id: selectedAccountId }, getAuthHeaders())
        );
        if (data?.thresholds) setThresholds(data.thresholds);
      } catch {/* keep defaults */}
    })();
  }, [selectedAccountId, userId]);

  const loadCachedData = async (accountId: string) => {
    if (!userId || !accountId) {
      setReportData({ LAST_30_DAYS: empty(), LAST_60_DAYS: empty(), LAST_90_DAYS: empty() });
      return;
    }
    setReportData({ LAST_30_DAYS: empty(), LAST_60_DAYS: empty(), LAST_90_DAYS: empty() });
    setSelectedBucket("all");

    const results = await Promise.all(
      REPORT_TABS.map(async ({ value }) => {
        try {
          const { data } = await withAuthRetry(() =>
            axios.post(`${API_BASE}/cached`,
              { user_id: userId, customer_id: accountId, report_type: value },
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
        if (data?.product_details?.length) {
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
        if (data?.progress) setProgress(data.progress);
        if (data?.status === "COMPLETED") return data;
        if (data?.status === "FAILED") throw new Error(data.error || "Generation failed");
      } catch (e: any) {
        if (e?.message?.includes("Generation failed")) throw e;
      }
    }
    throw new Error("Generation took longer than 10 minutes — check backend logs.");
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
      toast({
        title: "Thresholds saved",
        description: "Click Generate to re-bucket products with the new values.",
      });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSavingThresholds(false);
    }
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
      description: "Pulling PMax product performance for 30/60/90 days. Can take 30s–2min.",
      duration: 8000,
    });
    try {
      const { data: kicked } = await withAuthRetry(() =>
        axios.post(`${API_BASE}/generate`,
          { user_id: userId, customer_id: selectedAccountId },
          getAuthHeaders())
      );
      if (kicked?.status === "ALREADY_RUNNING") {
        toast({ title: "Already in progress", description: "Waiting for the running job to finish." });
      }
      const final = await pollUntilDone(selectedAccountId);
      const total = final?.count ?? 0;
      toast({ title: "Done", description: `Bucketed ${total.toLocaleString()} products.` });
      await loadCachedData(selectedAccountId);
    } catch (e: any) {
      toast({
        title: "Generation failed",
        description: e.response?.data?.error || e.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setProgress("");
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
      toast({ title: "Cleared", description: "Product-ROAS data removed for this account." });
    } catch (e: any) {
      toast({ title: "Clear failed", description: e.message, variant: "destructive" });
    } finally { setIsClearing(false); }
  };

  const periodData = reportData[activeTab] || empty();

  // Filter + sort
  const filteredProducts = useMemo(() => {
    let rows = periodData.product_details || [];
    if (selectedBucket !== "all") rows = rows.filter((r) => r.bucket === selectedBucket);
    return [...rows].sort((a, b) => {
      const av = a[sortBy] as number;
      const bv = b[sortBy] as number;
      const cmp = (av || 0) - (bv || 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [periodData, selectedBucket, sortBy, sortDir]);

  const SortHeader = ({ col, label }: { col: keyof ProductRow; label: string }) => (
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
    if (!filteredProducts.length) return;
    const headers = [
      "product_item_id", "product_title", "bucket", "total_impressions",
      "total_clicks", "ctr_pct", "total_cost", "total_conversions",
      "total_conversion_value", "roas", "cpa", "conv_rate_pct",
    ];
    const csvLines = [headers.join(",")];
    for (const r of filteredProducts) {
      const row = [
        r.product_item_id,
        `"${(r.product_title || "").replace(/"/g, '""')}"`,
        r.bucket,
        r.total_impressions,
        r.total_clicks,
        r.ctr.toFixed(2),
        r.total_cost.toFixed(2),
        r.total_conversions.toFixed(2),
        r.total_conversion_value.toFixed(2),
        r.roas.toFixed(2),
        r.cpa.toFixed(2),
        r.conv_rate.toFixed(2),
      ].join(",");
      csvLines.push(row);
    }
    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `product-roas-${selectedAccountId}-${activeTab}-${selectedBucket}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to tools
      </Button>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            <CardTitle className="text-2xl">PMax Product ROAS Analysis</CardTitle>
          </div>
          <CardDescription>
            Mike Rhodes-style bucketing — sorts every PMax product into Heroes / Costly / Zombies /
            Sleepers / Low Volume based on your thresholds, for{" "}
            <span className="font-semibold">{selectedAccountName || "—"}</span>{" "}
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
                <Button onClick={handleClear} disabled={isClearing || isGenerating || !periodData.total_products} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" /> Clear Reports
                </Button>
              </div>
              {isGenerating && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-300 rounded text-sm text-emerald-900">
                  <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>
                    <strong>Working in background:</strong> {progress || "Starting..."}
                    {" "}— safe to leave this tab open.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Select an account from the navigation above.</p>
          )}
        </CardContent>
      </Card>

      {/* Threshold config — per-account, user-saved */}
      {selectedAccountId && (
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Bucket thresholds
            </CardTitle>
            <CardDescription>
              Saved per account. Edit values then click <strong>Save & Re-bucket</strong>, then{" "}
              <strong>Generate Reports</strong> to apply the new thresholds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="targetRoas">Heroes ROAS ≥</Label>
                <Input
                  id="targetRoas"
                  type="number"
                  step="0.1"
                  min="0"
                  value={thresholds.targetRoas}
                  onChange={(e) => setThresholds({ ...thresholds, targetRoas: Number(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">e.g. 4 = needs to return $4 per $1 spent</p>
              </div>
              <div>
                <Label htmlFor="costlyRoasMax">Costly ROAS &lt;</Label>
                <Input
                  id="costlyRoasMax"
                  type="number"
                  step="0.1"
                  min="0"
                  value={thresholds.costlyRoasMax}
                  onChange={(e) => setThresholds({ ...thresholds, costlyRoasMax: Number(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">Below this + above min-spend → Costly</p>
              </div>
              <div>
                <Label htmlFor="minSpend">Min spend</Label>
                <Input
                  id="minSpend"
                  type="number"
                  step="1"
                  min="0"
                  value={thresholds.minSpend}
                  onChange={(e) => setThresholds({ ...thresholds, minSpend: Number(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">Below this → Low Volume bucket</p>
              </div>
              <div>
                <Label htmlFor="minClicksForSleeper">Min clicks (Sleeper)</Label>
                <Input
                  id="minClicksForSleeper"
                  type="number"
                  step="1"
                  min="0"
                  value={thresholds.minClicksForSleeper}
                  onChange={(e) => setThresholds({ ...thresholds, minClicksForSleeper: Number(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">Sleeper = clicks ≥ this AND zero conversions</p>
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

      {/* Tabs / data */}
      {selectedAccountId && (
        <Tabs value={activeTab} onValueChange={(v) => { userPickedTabRef.current = true; setActiveTab(v); }}>
          <TabsList className="grid w-full grid-cols-3">
            {REPORT_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
          </TabsList>

          {REPORT_TABS.map((t) => (
            <TabsContent key={t.value} value={t.value} className="space-y-6">
              {periodData.product_details.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No data for {t.label.toLowerCase()}.</p>
                    <p className="text-sm mt-1">Click <strong>Generate Reports</strong> above to fetch from Google Ads.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {periodData.summary_table
                      .filter((s) => s.bucket !== "TOTAL")
                      .sort((a, b) => BUCKET_ORDER.indexOf(a.bucket) - BUCKET_ORDER.indexOf(b.bucket))
                      .map((s) => {
                        const meta = BUCKET_META[s.bucket];
                        const Icon = meta?.icon || ShoppingBag;
                        return (
                          <Card key={s.bucket} className={`border-2 ${meta?.color || ""}`}>
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{s.bucket}</div>
                                <Icon className="w-4 h-4 opacity-70 flex-shrink-0" />
                              </div>
                              <div className="text-2xl font-bold">{s.num_products}</div>
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
                        <div className="text-2xl font-bold mt-1">{periodData.total_products}</div>
                        <div className="text-xs opacity-70 mt-1">products</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                      <SelectTrigger className="w-64"><SelectValue placeholder="Filter by bucket" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All buckets</SelectItem>
                        {BUCKET_ORDER.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b} {selectedBucket === b ? "" : `— ${BUCKET_META[b].description}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={exportCsv} variant="outline" disabled={!filteredProducts.length}>
                      <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                    <div className="text-sm text-gray-600 self-center ml-auto">
                      Showing <span className="font-semibold">{filteredProducts.length}</span> of {periodData.total_products} products
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                          <tr>
                            <th className="text-left px-3 py-2">Product</th>
                            <th className="text-left px-3 py-2">Bucket</th>
                            <SortHeader col="total_impressions" label="Impr." />
                            <SortHeader col="total_clicks" label="Clicks" />
                            <SortHeader col="ctr" label="CTR %" />
                            <SortHeader col="total_cost" label="Cost" />
                            <SortHeader col="total_conversions" label="Conv" />
                            <SortHeader col="total_conversion_value" label="Conv value" />
                            <SortHeader col="roas" label="ROAS" />
                            <SortHeader col="cpa" label="CPA" />
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((r, i) => (
                            <tr key={`${r.product_item_id}-${i}`} className="border-t hover:bg-gray-50">
                              <td className="px-3 py-2">
                                <div className="font-medium text-gray-900 max-w-md truncate" title={r.product_title}>
                                  {r.product_title}
                                </div>
                                <div className="text-xs text-gray-500 font-mono">{r.product_item_id}</div>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs border ${BUCKET_META[r.bucket]?.color || ""}`}>
                                  {r.bucket}
                                </span>
                              </td>
                              <td className="text-right px-3 py-2 tabular-nums">{r.total_impressions.toLocaleString()}</td>
                              <td className="text-right px-3 py-2 tabular-nums">{r.total_clicks.toLocaleString()}</td>
                              <td className="text-right px-3 py-2 tabular-nums">{r.ctr.toFixed(2)}</td>
                              <td className="text-right px-3 py-2 tabular-nums">{fmtMoney(r.total_cost)}</td>
                              <td className="text-right px-3 py-2 tabular-nums">{r.total_conversions.toFixed(1)}</td>
                              <td className="text-right px-3 py-2 tabular-nums">{fmtMoney(r.total_conversion_value)}</td>
                              <td className="text-right px-3 py-2 tabular-nums">
                                {r.total_cost > 0 ? r.roas.toFixed(2) : <span className="text-gray-300">—</span>}
                              </td>
                              <td className="text-right px-3 py-2 tabular-nums">
                                {r.total_conversions > 0 ? fmtMoney(r.cpa) : <span className="text-gray-300">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-3 py-2 text-xs text-gray-500 border-t bg-gray-50">
                      Bucketing uses your saved thresholds. To change them, edit and save above, then re-Generate.
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

const ProductRoasPage = () => (
  <DashboardShell>
    {({ selectedAccountId, selectedAccountName }) => (
      <ProductRoasInner
        selectedAccountId={selectedAccountId}
        selectedAccountName={selectedAccountName}
      />
    )}
  </DashboardShell>
);

export default ProductRoasPage;
