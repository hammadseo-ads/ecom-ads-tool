// Lead-Gen, Budget Wastage by Keywords
// /dashboard/lead-gen/wasted-keywords
//
// Surfaces every search term that spent budget but produced ZERO conversions
// over the last 30 / 60 / 90 days. PMax excluded (Google doesn't expose
// per-search-term cost for it).
//
// Same async generate/poll/cached pattern as the eCommerce tools, but the
// data shape is per-(term, campaign) instead of per-product.

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Loader2,
  PiggyBank,
  Search as SearchIcon,
  TrendingDown,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import SEO from "@/components/SEO";

const API = "/api/lead-gen/wasted-keywords";

interface Row {
  search_term: string;
  status: string | null;
  campaign_id: string;
  campaign_name: string;
  channel_type: string;
  ad_group_id: string;
  ad_group_name: string | null;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
}

interface CampaignSummary {
  campaign_id: string;
  campaign_name: string;
  channel_type: string;
  unique_terms: number;
  impressions: number;
  clicks: number;
  cost: number;
}

interface CachedResp {
  success: boolean;
  rows: Row[];
  campaign_summary: CampaignSummary[];
  totals: { unique_terms: number; impressions: number; clicks: number; cost: number };
  meta: {
    customer_id: string | null;
    days: number | null;
    report_start_date: string | null;
    report_end_date: string | null;
  };
}

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n || 0);

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
      const { data } = await axios.post(
        "/api/auth/refresh-token",
        {},
        { withCredentials: true }
      );
      if (data?.accessToken)
        localStorage.setItem("accessToken", data.accessToken);
    } catch {
      throw err;
    }
    return await call();
  }
};

interface InnerProps {
  selectedAccountId: string;
  selectedAccountName: string;
}

const Inner = ({ selectedAccountId, selectedAccountName }: InnerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId: _userId } = useUser();

  const [days, setDays] = useState<30 | 60 | 90>(30);
  const [data, setData] = useState<CachedResp | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [progress, setProgress] = useState("");
  const [filter, setFilter] = useState("");

  const loadCached = async (cid: string, d: number) => {
    if (!cid) {
      setData(null);
      return;
    }
    try {
      const { data: resp } = await withAuthRetry(() =>
        axios.post<CachedResp>(
          `${API}/cached`,
          { customer_id: cid, days: d },
          getAuthHeaders()
        )
      );
      setData(resp);
    } catch (err: any) {
      console.error("loadCached failed", err);
      setData(null);
    }
  };

  useEffect(() => {
    loadCached(selectedAccountId, days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId, days]);

  const pollUntilDone = async (cid: string, d: number) => {
    const POLL = 3000;
    const MAX = 60; // 3 minutes
    for (let i = 0; i < MAX; i++) {
      await new Promise((r) => setTimeout(r, POLL));
      try {
        const { data: status } = await withAuthRetry(() =>
          axios.post(
            `${API}/status`,
            { customer_id: cid, days: d },
            getAuthHeaders()
          )
        );
        if (status?.progress) setProgress(status.progress);
        if (status?.status === "COMPLETED") return status;
        if (status?.status === "FAILED")
          throw new Error(status.error || "Generation failed");
      } catch (e: any) {
        if (e?.message?.includes("Generation failed")) throw e;
      }
    }
    throw new Error("Generation took too long.");
  };

  const handleGenerate = async () => {
    if (!selectedAccountId) {
      toast({
        title: "Pick an account first",
        description: "Use the dropdown at the top of the page.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    setProgress("Starting...");
    try {
      const { data: kicked } = await withAuthRetry(() =>
        axios.post(
          `${API}/generate`,
          { customer_id: selectedAccountId, days },
          getAuthHeaders()
        )
      );
      if (kicked?.status === "ALREADY_RUNNING") {
        toast({ title: "Already running" });
      }
      const final = await pollUntilDone(selectedAccountId, days);
      toast({
        title: "Done",
        description: `Found ${final?.result?.unique_term_campaign_pairs ?? 0} non-converting term/campaign pairs (~${fmtMoney(final?.result?.total_wasted_cost || 0)} wasted).`,
      });
      await loadCached(selectedAccountId, days);
    } catch (e: any) {
      toast({
        title: "Generation failed",
        description:
          e.response?.data?.error || e.message || "Something went wrong.",
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
        axios.delete(`${API}/clear`, {
          data: { customer_id: selectedAccountId, days },
          ...getAuthHeaders(),
        })
      );
      setData(null);
      toast({
        title: "Cleared",
        description: "Wasted-keywords cache removed for this period.",
      });
    } catch (e: any) {
      toast({
        title: "Clear failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (!data?.rows) return [];
    if (!filter.trim()) return data.rows;
    const f = filter.toLowerCase();
    return data.rows.filter(
      (r) =>
        r.search_term.toLowerCase().includes(f) ||
        r.campaign_name.toLowerCase().includes(f)
    );
  }, [data, filter]);

  const exportCsv = () => {
    if (!filteredRows.length) return;
    const headers = [
      "search_term",
      "campaign_name",
      "channel_type",
      "ad_group_name",
      "impressions",
      "clicks",
      "cost",
      "conversions",
      "status",
    ];
    const lines = [headers.join(",")];
    for (const r of filteredRows) {
      lines.push(
        [
          `"${r.search_term.replace(/"/g, '""')}"`,
          `"${(r.campaign_name || "").replace(/"/g, '""')}"`,
          r.channel_type,
          `"${(r.ad_group_name || "").replace(/"/g, '""')}"`,
          r.impressions,
          r.clicks,
          r.cost.toFixed(2),
          r.conversions,
          r.status || "",
        ].join(",")
      );
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wasted-keywords_${selectedAccountId}_${days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totals = data?.totals || {
    unique_terms: 0,
    impressions: 0,
    clicks: 0,
    cost: 0,
  };
  const avgCpc = totals.clicks > 0 ? totals.cost / totals.clicks : 0;
  const hasData = (data?.rows?.length ?? 0) > 0;

  return (
    <div className="space-y-6 pb-20">
      <SEO
        title="Lead-Gen Wasted Keywords, Find Non-Converting Spend"
        description="Find every search term that burned budget over the last 30 / 60 / 90 days without producing a single conversion. Lead-gen optimized, no ROAS required."
        ogType="website"
        noindex
      />

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-xl p-6 md:p-8 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="bg-white/15 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0">
            <PiggyBank className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wide font-semibold text-emerald-200 mb-1">
              Lead Generation
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              Budget Wastage by Keywords
            </h1>
            <p className="text-emerald-100 mt-1 text-sm md:text-base">
              Search terms over the last <strong>{days}</strong> days that spent
              money but produced <strong>zero conversions</strong>.{" "}
              {selectedAccountName ? (
                <>Account: <strong>{selectedAccountName}</strong></>
              ) : (
                "Select an account from the top dropdown to begin."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Run analysis</CardTitle>
          <CardDescription>
            Picks a lookback window, queries Google Ads, and stores results.
            Re-runs overwrite the cache for that window.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                Lookback window
              </label>
              <Select
                value={String(days)}
                onValueChange={(v) => setDays(Number(v) as 30 | 60 | 90)}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedAccountId}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {progress || "Generating..."}
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {hasData ? "Re-run analysis" : "Run analysis"}
                </>
              )}
            </Button>
            {hasData && (
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={isClearing}
              >
                {isClearing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Clear
              </Button>
            )}
            {hasData && (
              <Button variant="outline" onClick={exportCsv}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
          {data?.meta?.report_start_date && (
            <p className="text-xs text-gray-500 mt-3">
              Cached report covers{" "}
              {new Date(data.meta.report_start_date).toLocaleDateString()} →{" "}
              {new Date(data.meta.report_end_date!).toLocaleDateString()}.
              Performance Max campaigns are excluded (Google does not expose
              per-search-term cost for PMax).
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary cards */}
      {hasData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Wasted spend
              </div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {fmtMoney(totals.cost)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Non-converting terms
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {totals.unique_terms.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Wasted clicks
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {totals.clicks.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Avg CPC of wasted
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {fmtMoney(avgCpc)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Per-campaign breakdown */}
      {hasData && data!.campaign_summary.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              Wasted spend by campaign
            </CardTitle>
            <CardDescription>
              Where the bleed is happening, ranked by cost.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-gray-600">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Campaign</th>
                    <th className="py-2 px-3 font-medium">Type</th>
                    <th className="py-2 px-3 font-medium text-right">
                      Terms
                    </th>
                    <th className="py-2 px-3 font-medium text-right">
                      Clicks
                    </th>
                    <th className="py-2 px-3 font-medium text-right">
                      Wasted spend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data!.campaign_summary.map((c) => (
                    <tr key={c.campaign_id} className="border-b last:border-0">
                      <td className="py-2 pr-3">
                        <div className="font-medium text-gray-900">
                          {c.campaign_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID {c.campaign_id}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-xs">
                          {c.channel_type}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {c.unique_terms.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {c.clicks.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-700">
                        {fmtMoney(c.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Term-level table */}
      {hasData && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base">
                  Non-converting search terms
                </CardTitle>
                <CardDescription>
                  Each row is what a user actually typed into Google.
                  Negative-keyword candidates first.
                </CardDescription>
              </div>
              <div className="relative">
                <SearchIcon className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                <Input
                  placeholder="Filter terms or campaigns..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-8 w-[260px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-gray-600">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Search term</th>
                    <th className="py-2 px-3 font-medium">Campaign</th>
                    <th className="py-2 px-3 font-medium text-right">
                      Impr.
                    </th>
                    <th className="py-2 px-3 font-medium text-right">
                      Clicks
                    </th>
                    <th className="py-2 px-3 font-medium text-right">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.slice(0, 500).map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-3">
                        <div className="font-medium text-gray-900">
                          {r.search_term}
                        </div>
                        {r.status && (
                          <div className="text-[11px] text-gray-500">
                            {r.status}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-gray-700">
                          {r.campaign_name}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {r.channel_type}
                          {r.ad_group_name ? ` · ${r.ad_group_name}` : ""}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {r.impressions.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {r.clicks.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-700">
                        {fmtMoney(r.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRows.length > 500 && (
                <p className="text-xs text-gray-500 mt-3">
                  Showing first 500 of {filteredRows.length} matching rows.
                  Use filter to narrow, or export CSV for the full list.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!hasData && !isGenerating && (
        <Card>
          <CardContent className="text-center py-16">
            <PiggyBank className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No analysis yet
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Click <strong>Run analysis</strong> above to pull
              non-converting search terms from Google Ads for the last{" "}
              {days} days.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const LeadGenWastedKeywordsPage = () => {
  return (
    <DashboardShell>
      {({ selectedAccountId, selectedAccountName }) => (
        <Inner
          selectedAccountId={selectedAccountId}
          selectedAccountName={selectedAccountName}
        />
      )}
    </DashboardShell>
  );
};

export default LeadGenWastedKeywordsPage;
