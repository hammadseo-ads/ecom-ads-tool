// Lead-Gen Heat Map (Hour × Day), uses the SAME backend as the eCom heat
// map (same GAQL: campaign metrics segmented by day_of_week + hour). Diff
// is purely UI: defaults to Conversions / CVR / CPA, hides ROAS, and
// re-labels the suggested-bid logic since lead-gen ranks by conv-rate.
//
// Renders a 24-row × 7-column grid color-coded by the selected metric.
// User can:
//   - Switch metric (Impressions / Clicks / CTR / Conv / ROAS / Suggested Bid Adj)
//   - Filter by campaign or view aggregated across all
//   - See bidding-strategy badge per campaign + warning when multipliers
//     are not actionable (Smart Bidding / PMax)
//
// Data smoothing happens server-side at /cached read time (±2hr window).

import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import {
  ArrowLeft, RefreshCw, Trash2, Calendar, Clock,
  AlertTriangle, ChevronDown, ChevronUp, MousePointerClick, Eye,
  Target, DollarSign, TrendingUp, Sparkles, Download, Filter,
} from "lucide-react";
import SEO from "@/components/SEO";
import DashboardShell from "@/components/DashboardShell";

const API_BASE = "/api/heat-map";

interface Cell {
  day_of_week: number; // 1=Mon … 7=Sun
  hour: number;        // 0-23
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversion_value: number;
  ctr: number;        // %
  conv_rate: number;  // %
  roas: number;
  suggested_bid_multiplier: number | null; // null if Smart Bidding/PMax or no clicks
}

interface CampaignMeta {
  id: string;
  name: string;
  channel_type: string;
  status?: string;
  bidding_strategy_type: string;
  supports_bid_multiplier: boolean;
}

interface PeriodData {
  cells: Cell[];
  mean_conv_rate: number;
  per_campaign: CampaignMeta[];
  total_campaigns: number;
  manual_bidding_campaigns: number;
  available_channels?: string[];
  filtered_campaign_count?: number;
  supports_bid_multiplier: boolean;
  selected_campaign: CampaignMeta | null;
  report_start_date?: string;
  report_end_date?: string;
}

// Friendly labels for Google Ads advertising_channel_type. Keyed by both the
// enum NAME and its numeric code, because older cached reports may store the
// raw number (e.g. "10") the API returned before it was decoded server-side.
const CHANNEL_LABELS: Record<string, string> = {
  SEARCH: "Search", "2": "Search",
  DISPLAY: "Display", "3": "Display",
  SHOPPING: "Shopping", "4": "Shopping",
  HOTEL: "Hotel", "5": "Hotel",
  VIDEO: "Video", "6": "Video",
  MULTI_CHANNEL: "Multi-channel", "7": "Multi-channel",
  LOCAL: "Local", "8": "Local",
  SMART: "Smart", "9": "Smart",
  PERFORMANCE_MAX: "PMax", "10": "PMax",
  LOCAL_SERVICES: "Local Services", "11": "Local Services",
  DISCOVERY: "Discovery", "12": "Discovery",
  TRAVEL: "Travel", "13": "Travel",
  DEMAND_GEN: "Demand Gen", "14": "Demand Gen",
};
const channelLabel = (c: string) => CHANNEL_LABELS[c] || c;
const isActive = (status?: string) => !status || status === "ENABLED";

const REPORT_TABS = [
  { value: "LAST_30_DAYS", label: "Last 30 Days" },
  { value: "LAST_60_DAYS", label: "Last 60 Days" },
  { value: "LAST_90_DAYS", label: "Last 90 Days" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const METRICS = [
  { key: "impressions", label: "Impressions", icon: Eye, format: (n: number) => Math.round(n).toLocaleString() },
  { key: "clicks", label: "Clicks", icon: MousePointerClick, format: (n: number) => Math.round(n).toLocaleString() },
  { key: "ctr", label: "CTR %", icon: Target, format: (n: number) => `${n.toFixed(2)}%` },
  { key: "cost", label: "Cost", icon: DollarSign, format: (n: number) => `$${n.toFixed(2)}` },
  { key: "conversions", label: "Conversions", icon: TrendingUp, format: (n: number) => n.toFixed(1) },
  { key: "conv_rate", label: "Conv Rate %", icon: TrendingUp, format: (n: number) => `${n.toFixed(2)}%` },
  { key: "suggested_bid_multiplier", label: "Suggested Bid Adj %", icon: Sparkles,
    format: (n: number | null) => n == null ? "-" : `${(n * 100).toFixed(1)}%` },
] as const;

const empty = (): PeriodData => ({
  cells: [], mean_conv_rate: 0, per_campaign: [],
  total_campaigns: 0, manual_bidding_campaigns: 0,
  supports_bid_multiplier: false, selected_campaign: null,
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

interface InnerProps {
  selectedAccountId: string;
  selectedAccountName: string;
}

const LeadGenHeatMapInner = ({ selectedAccountId, selectedAccountName }: InnerProps) => {
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
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // "all" | "active"
  const [selectedMetric, setSelectedMetric] = useState<string>("conversions");
  const userPickedTabRef = useRef(false);

  const loadCachedData = async (
    accountId: string,
    campaignFilter = "all",
    channelFilter = "all",
    statusFilterVal = "all",
  ) => {
    if (!userId || !accountId) {
      setReportData({ LAST_30_DAYS: empty(), LAST_60_DAYS: empty(), LAST_90_DAYS: empty() });
      return;
    }
    setReportData({ LAST_30_DAYS: empty(), LAST_60_DAYS: empty(), LAST_90_DAYS: empty() });

    const results = await Promise.all(
      REPORT_TABS.map(async ({ value }) => {
        try {
          const { data } = await withAuthRetry(() =>
            axios.post(`${API_BASE}/cached`,
              {
                user_id: userId, customer_id: accountId, report_type: value,
                campaign_id: campaignFilter, channel_type: channelFilter, status_filter: statusFilterVal,
              },
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
        if (data) {
          next[value] = data;
          if (data.cells?.length && !firstAvailable) firstAvailable = value;
        }
      }
      return next;
    });
    if (firstAvailable && !userPickedTabRef.current) setActiveTab(firstAvailable);
  };

  useEffect(() => {
    userPickedTabRef.current = false;
    setSelectedCampaign("all");
    setSelectedChannel("all");
    setStatusFilter("all");
    loadCachedData(selectedAccountId, "all", "all", "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId, userId]);

  // Reload when any filter changes
  useEffect(() => {
    if (!selectedAccountId) return;
    loadCachedData(selectedAccountId, selectedCampaign, selectedChannel, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign, selectedChannel, statusFilter]);

  // Changing channel/status can invalidate the picked campaign — reset to "all".
  const handleChannelChange = (v: string) => { setSelectedCampaign("all"); setSelectedChannel(v); };
  const handleStatusChange = (v: string) => { setSelectedCampaign("all"); setStatusFilter(v); };

  const handleExport = async () => {
    if (!selectedAccountId) return;
    setIsExporting(true);
    try {
      const res = await withAuthRetry(() =>
        axios.post(`${API_BASE}/export`,
          { user_id: userId, customer_id: selectedAccountId },
          { ...getAuthHeaders(), responseType: "blob" })
      );
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `heatmap_${selectedAccountId}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "Downloaded", description: "All heat map data exported as CSV." });
    } catch (e: any) {
      const notFound = e?.response?.status === 404;
      toast({
        title: "Export failed",
        description: notFound ? "No data yet — click Generate Reports first." : (e.message || "Try again."),
        variant: "destructive",
      });
    } finally { setIsExporting(false); }
  };

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
    throw new Error("Generation took longer than 10 minutes, check backend logs.");
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
      description: "Pulling hourly performance for 30/60/90 days. Can take 30s–2min.",
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
      toast({
        title: "Done",
        description: `Heat map ready for ${final?.result?.total_campaigns ?? 0} campaigns.`,
      });
      await loadCachedData(selectedAccountId, selectedCampaign);
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
      toast({ title: "Cleared", description: "Heat map data removed for this account." });
    } catch (e: any) {
      toast({ title: "Clear failed", description: e.message, variant: "destructive" });
    } finally { setIsClearing(false); }
  };

  const periodData = reportData[activeTab] || empty();
  const metric = METRICS.find((m) => m.key === selectedMetric) || METRICS[0];

  // Channel-type options present in this account + campaign list narrowed by
  // the active channel/status filters (the aggregate itself is filtered server-side).
  const availableChannels = periodData.available_channels || [];
  const visibleCampaigns = periodData.per_campaign.filter(
    (c) =>
      (selectedChannel === "all" || c.channel_type === selectedChannel) &&
      (statusFilter === "all" || isActive(c.status))
  );
  const allCount = periodData.filtered_campaign_count ?? periodData.total_campaigns;

  // Build [day][hour] grid for fast lookup + min/max for color scaling
  const { grid, vmin, vmax, topActionable, bottomActionable } = useMemo(() => {
    const g: Record<number, Record<number, Cell>> = {};
    let min = Infinity, max = -Infinity;
    const flat: Cell[] = [];
    for (const c of periodData.cells || []) {
      g[c.day_of_week] = g[c.day_of_week] || {};
      g[c.day_of_week][c.hour] = c;
      const v = (c as any)[selectedMetric] as number | null;
      if (v != null && Number.isFinite(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
        flat.push(c);
      }
    }
    if (!Number.isFinite(min)) { min = 0; max = 0; }
    // Top/bottom 5 cells by suggested bid multiplier (for action panel)
    const sortedByMult = flat
      .filter((c) => c.suggested_bid_multiplier != null)
      .sort((a, b) => (b.suggested_bid_multiplier || 0) - (a.suggested_bid_multiplier || 0));
    return {
      grid: g,
      vmin: min,
      vmax: max,
      topActionable: sortedByMult.slice(0, 5),
      bottomActionable: sortedByMult.slice(-5).reverse(),
    };
  }, [periodData, selectedMetric]);

  // Color: green for high values, red for low. Multiplier metric uses
  // diverging scale (red ↔ neutral ↔ green) with 0 as midpoint.
  const cellColor = (val: number | null): string => {
    if (val == null) return "bg-gray-100 text-gray-400";
    if (selectedMetric === "suggested_bid_multiplier") {
      // Diverging scale: -35% → red, 0 → neutral, +35% → green
      if (val > 0.001) {
        const intensity = Math.min(1, val / 0.35);
        const opacity = Math.round(intensity * 90);
        return `bg-emerald-${opacity > 60 ? "500" : opacity > 30 ? "300" : "100"} text-emerald-900`;
      } else if (val < -0.001) {
        const intensity = Math.min(1, -val / 0.35);
        const opacity = Math.round(intensity * 90);
        return `bg-red-${opacity > 60 ? "500" : opacity > 30 ? "300" : "100"} text-red-900`;
      }
      return "bg-gray-50 text-gray-700";
    }
    // Sequential green scale based on relative value within grid
    if (vmax === vmin) return "bg-emerald-50 text-gray-700";
    const t = (val - vmin) / (vmax - vmin);
    if (t > 0.85) return "bg-emerald-700 text-white";
    if (t > 0.65) return "bg-emerald-500 text-white";
    if (t > 0.45) return "bg-emerald-300 text-emerald-900";
    if (t > 0.25) return "bg-emerald-200 text-emerald-900";
    if (t > 0.10) return "bg-emerald-100 text-emerald-900";
    return "bg-gray-50 text-gray-700";
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
            <Calendar className="w-6 h-6 text-emerald-600" />
            <CardTitle className="text-2xl flex items-center gap-2">Hour × Day Heat Map <span className="text-emerald-800 text-[11px] font-bold uppercase tracking-wide bg-emerald-50 px-1.5 py-0.5 rounded">Lead Gen</span></CardTitle>
          </div>
          <CardDescription>
            See when your campaigns perform best. Suggested bid multipliers are computed from
            smoothed conversion rate vs the grid mean (capped ±35%) for{" "}
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
                <Button onClick={handleExport} disabled={isExporting || isGenerating} variant="outline" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                  {isExporting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  {isExporting ? "Exporting..." : "Download Data (CSV)"}
                </Button>
                <Button onClick={handleClear} disabled={isClearing || isGenerating || !periodData.cells.length} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
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

      {selectedAccountId && (
        <Tabs value={activeTab} onValueChange={(v) => { userPickedTabRef.current = true; setActiveTab(v); }}>
          <TabsList className="grid w-full grid-cols-3">
            {REPORT_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
          </TabsList>

          {REPORT_TABS.map((t) => (
            <TabsContent key={t.value} value={t.value} className="space-y-6">
              {periodData.per_campaign.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No data for {t.label.toLowerCase()}.</p>
                    <p className="text-sm mt-1">Click <strong>Generate Reports</strong> above to fetch from Google Ads.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Filters */}
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Channel-type filter: Search / PMax / Demand Gen / … */}
                    <Select value={selectedChannel} onValueChange={handleChannelChange}>
                      <SelectTrigger className="w-48">
                        <span className="flex items-center gap-2 truncate">
                          <Filter className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <SelectValue placeholder="Campaign type" />
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {availableChannels.map((ch) => (
                          <SelectItem key={ch} value={ch}>{channelLabel(ch)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Active-only vs all (active + paused) */}
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Active + Paused</SelectItem>
                        <SelectItem value="active">Active only</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                      <SelectTrigger className="w-72">
                        <SelectValue placeholder="Campaign filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All campaigns ({allCount})</SelectItem>
                        {visibleCampaigns.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}{" "}
                            <span className="text-gray-400 ml-1">
                              ({channelLabel(c.channel_type)}{!isActive(c.status) ? " · Paused" : ""})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Metric" />
                      </SelectTrigger>
                      <SelectContent>
                        {METRICS.map((m) => (
                          <SelectItem key={m.key} value={m.key}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {periodData.selected_campaign && (
                      <Badge variant="outline" className="border-emerald-300 text-emerald-800">
                        {periodData.selected_campaign.bidding_strategy_type}
                      </Badge>
                    )}
                  </div>

                  {periodData.cells.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-gray-500">
                        <Filter className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        <p>No campaigns match the current filters.</p>
                        <p className="text-sm mt-1">Try <strong>All types</strong> / <strong>Active + Paused</strong>, or a different period.</p>
                      </CardContent>
                    </Card>
                  ) : (
                   <>
                  {/* Warning banner, show when multipliers won't be honored */}
                  {!periodData.supports_bid_multiplier && (
                    <div className="flex gap-3 p-4 bg-amber-50 border border-amber-300 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-900">
                        <p className="font-semibold mb-1">
                          Bid-by-hour adjustments are NOT actionable for{" "}
                          {periodData.selected_campaign
                            ? `this campaign (${periodData.selected_campaign.bidding_strategy_type})`
                            : "the current view"}
                          .
                        </p>
                        <p>
                          {periodData.selected_campaign?.channel_type === "PERFORMANCE_MAX"
                            ? "PMax doesn't support bid % adjustments by hour, only -100% pause works. "
                            : periodData.selected_campaign
                            ? "Smart Bidding (Target ROAS / Target CPA / Maximize Conversions etc.) overrides hour-of-day adjustments, Google handles timing. "
                            : "The aggregated view mixes campaigns with different bidding strategies. Filter to a Manual CPC / Maximize Clicks campaign to see actionable suggestions. "}
                          Suggested-bid-adjustment values will show "-". Use the heat map to identify
                          hours to <strong>fully pause</strong> (set ad schedule to -100%) instead.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Heat map grid */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <metric.icon className="w-5 h-5 text-emerald-600" />
                          {metric.label}, Hour × Day
                        </CardTitle>
                        <div className="text-xs text-gray-500">
                          Mean conv rate (smoothed): {periodData.mean_conv_rate.toFixed(2)}%
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr>
                            <th className="text-right pr-2 py-1 text-gray-500 font-normal w-12">Hr</th>
                            {DAYS.map((d) => (
                              <th key={d} className="text-center py-1 text-gray-700 font-semibold">{d}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: 24 }, (_, h) => (
                            <tr key={h}>
                              <td className="text-right pr-2 text-gray-500 font-mono tabular-nums w-12 align-middle">
                                {String(h).padStart(2, "0")}
                              </td>
                              {Array.from({ length: 7 }, (_, dIdx) => {
                                const day = dIdx + 1;
                                const cell = grid[day]?.[h];
                                const val = cell ? (cell as any)[selectedMetric] as number | null : null;
                                return (
                                  <td
                                    key={day}
                                    className={`px-1 py-1 text-center tabular-nums border border-white text-[11px] ${cellColor(val)}`}
                                    title={cell
                                      ? `${DAYS[dIdx]} ${String(h).padStart(2, "0")}:00\n` +
                                        `Impr: ${Math.round(cell.impressions).toLocaleString()}\n` +
                                        `Clicks: ${Math.round(cell.clicks).toLocaleString()}\n` +
                                        `CTR: ${cell.ctr.toFixed(2)}%\n` +
                                        `Cost: $${cell.cost.toFixed(2)}\n` +
                                        `Conv: ${cell.conversions.toFixed(2)}\n` +
                                        `Conv rate: ${cell.conv_rate.toFixed(2)}%\n` +
                                        `ROAS: ${cell.roas.toFixed(2)}\n` +
                                        (cell.suggested_bid_multiplier == null
                                          ? `Bid adj: -`
                                          : `Bid adj: ${(cell.suggested_bid_multiplier * 100).toFixed(1)}%`)
                                      : "no data"}
                                  >
                                    {val == null ? "-" : metric.format(val)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>

                  {/* Suggested actions panel */}
                  {periodData.supports_bid_multiplier && (topActionable.length > 0 || bottomActionable.length > 0) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-emerald-600" />
                          Suggested actions
                        </CardTitle>
                        <CardDescription>
                          Top 5 hours to bid up, bottom 5 to bid down. Multipliers capped ±35%.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-4">
                            <h4 className="font-semibold text-emerald-900 mb-2 text-sm flex items-center gap-2">
                              <ChevronUp className="w-4 h-4" /> Bid UP these hours
                            </h4>
                            <ul className="text-sm text-emerald-900 space-y-1">
                              {topActionable.length === 0 ? (
                                <li className="text-gray-500 text-xs">Not enough variation to recommend bid-ups.</li>
                              ) : topActionable.map((c, i) => (
                                <li key={i} className="flex justify-between font-mono">
                                  <span>{DAYS[c.day_of_week - 1]} {String(c.hour).padStart(2, "0")}:00</span>
                                  <span className="font-semibold">+{((c.suggested_bid_multiplier || 0) * 100).toFixed(1)}%</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="border border-red-200 bg-red-50/40 rounded-lg p-4">
                            <h4 className="font-semibold text-red-900 mb-2 text-sm flex items-center gap-2">
                              <ChevronDown className="w-4 h-4" /> Bid DOWN these hours
                            </h4>
                            <ul className="text-sm text-red-900 space-y-1">
                              {bottomActionable.length === 0 ? (
                                <li className="text-gray-500 text-xs">Not enough variation to recommend bid-downs.</li>
                              ) : bottomActionable.map((c, i) => (
                                <li key={i} className="flex justify-between font-mono">
                                  <span>{DAYS[c.day_of_week - 1]} {String(c.hour).padStart(2, "0")}:00</span>
                                  <span className="font-semibold">{((c.suggested_bid_multiplier || 0) * 100).toFixed(1)}%</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                   </>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

const LeadGenHeatMapPage = () => (
  <DashboardShell>
    {({ selectedAccountId, selectedAccountName }) => (
      <LeadGenHeatMapInner
        selectedAccountId={selectedAccountId}
        selectedAccountName={selectedAccountName}
      />
    )}
  </DashboardShell>
);

export default LeadGenHeatMapPage;
