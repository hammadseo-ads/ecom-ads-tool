import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast"; // Your custom toast
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface TopSummaryData {
  overall_roas: number;
  total_conversions: number;
  total_cost: number;
  total_clicks: number;
  total_impressions: number;
}
interface BucketSummary {
  bucket: string;
  num_titles: number;
  total_cost: number;
  total_conversions: number;
  total_value: number;
  roas: number;
}
interface ProductSummary {
  product_id: string;
  product_title: string;
  total_clicks: number;
  total_impressions: number;
  total_cost: number;
  total_conversions: number;
  total_conversion_value: number;
  product_roas: number;
}
interface CampaignData {
  campaign: {
    id: string;
    name: string;
    status: string;
  };
}
interface Props {
  selectedAccountId: string;
  selectedAccountName: string;
  campaigns: CampaignData[];
}

const EnhancedAggregatedPerformanceOverview: React.FC<Props> = ({
  selectedAccountId,
  selectedAccountName,
  campaigns,
}) => {
  const { user } = useAuth();
  const { toast } = useToast(); // Your custom toast
  const [isLoading, setIsLoading] = useState(false);
  const [topSummaryData, setTopSummaryData] = useState<TopSummaryData | null>(null);
  const [productSummary, setProductSummary] = useState<ProductSummary[]>([]);
  const [bucketSummaryData, setBucketSummaryData] = useState<BucketSummary[]>([]);
  const [hasData, setHasData] = useState(false);

  // Filters
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all");
  const [selectedCategoryTag, setSelectedCategoryTag] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Sorting / pagination
  const [sortColumn, setSortColumn] = useState<keyof ProductSummary | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const initDates = useRef(false);

  // Default: last 30 days
  useEffect(() => {
    if (!initDates.current) {
      const today = new Date();
      const thirtyAgo = new Date();
      thirtyAgo.setDate(today.getDate() - 29);
      setEndDate(today.toISOString().split("T")[0]);
      setStartDate(thirtyAgo.toISOString().split("T")[0]);
      initDates.current = true;
    }
  }, []);

  /* ---------- Helpers ---------- */
  const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n);
  const fmtCur = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  const fmtROAS = (r: number) => r.toFixed(2);

  const bucketColor = (b: string) => {
    const map: Record<string, string> = {
      profitable: "bg-green-100 text-green-800",
      costly: "bg-red-100 text-red-800",
      "zero-conversion": "bg-gray-100 text-gray-800",
      zombie: "bg-slate-100 text-slate-800",
      uncategorized: "bg-emerald-100 text-emerald-800",
    };
    return map[b.toLowerCase()] ?? "bg-gray-100 text-gray-800";
  };

  /* ---------- API call ---------- */
  const fetchData = async () => {
    if (!user?.id || !selectedAccountId || !startDate || !endDate) {
      toast({
        title: "Missing Info",
        description: "Please select an account and a date range first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/performance/aggregated", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          customer_id: selectedAccountId,
          selected_campaign_id: selectedCampaignId,
          selected_category_tag: selectedCategoryTag,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed to load data");

      setTopSummaryData(json.topSummaryData ?? null);
      setProductSummary(json.productSummary ?? []);
      setBucketSummaryData(json.bucketSummaryData ?? []);
      setHasData(true);
      toast({
        title: "Success",
        description: json.message ?? "Data loaded successfully",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message ?? "Failed to load data",
        variant: "destructive",
      });
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const load = () => {
    setCurrentPage(1);
    fetchData();
  };

  // Re-fetch when filters change (after first load)
  useEffect(() => {
    if (hasData && startDate && endDate) fetchData();
  }, [selectedCampaignId, selectedCategoryTag, startDate, endDate]);

  /* ---------- Sorting ---------- */
  const handleSort = (col: keyof ProductSummary) => {
    setSortColumn(col);
    setSortDirection(sortColumn === col && sortDirection === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const sorted = (() => {
    if (!sortColumn) return productSummary;
    return [...productSummary].sort((a, b) => {
      const av = a[sortColumn];
      const bv = b[sortColumn];
      return sortDirection === "asc" ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
    });
  })();

  const paginated = sorted.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(productSummary.length / rowssPerPage);

  /* ---------- Bucket totals ---------- */
  const bucketTotals = bucketSummaryData.reduce(
    (a, c) => ({
      num_titles: a.num_titles + c.num_titles,
      total_cost: a.total_cost + c.total_cost,
      total_conversions: a.total_conversions + c.total_conversions,
      total_value: a.total_value + c.total_value,
    }),
    { num_titles: 0, total_cost: 0, total_conversions: 0, total_value: 0 }
  );
  bucketTotals.roas = bucketTotals.total_cost
    ? bucketTotals.total_value / bucketTotals.total_cost
    : 0;

  const SortableHeader = ({
    col,
    children,
  }: {
    col: keyof ProductSummary;
    children: React.ReactNode;
  }) => (
    <TableHead
      className="cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center justify-between">
        {children}
        {sortColumn === col &&
          (sortDirection === "asc" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          ))}
      </div>
    </TableHead>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Aggregated Performance Overview
        </CardTitle>
        <CardDescription>
          Advanced filtering, bucket analysis, sorting & pagination
          {selectedAccountName && ` – ${selectedAccountName}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ---------- Filters ---------- */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Start:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">End:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              />
            </div>
            <Button
              onClick={load}
              disabled={!selectedAccountId || isLoading || !startDate || !endDate}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4 mr-2" />
              )}
              View Data
            </Button>
          </div>

          {hasData && (
            <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
              <Filter className="w-5 h-5 text-gray-600" />
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Campaign:</label>
                <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    {campaigns.map((c) => (
                      <SelectItem key={c.campaign.id} value={c.campaign.id}>
                        {c.campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Category:</label>
                <Select value={selectedCategoryTag} onValueChange={setSelectedCategoryTag}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { v: "all", l: "All Categories" },
                      { v: "Profitable", l: "Profitable" },
                      { v: "Costly", l: "Costly" },
                      { v: "Zero-Conversion", l: "Zero-Conversion" },
                      { v: "Zombie", l: "Zombie" },
                      { v: "Uncategorized", l: "Uncategorized" },
                    ].map((o) => (
                      <SelectItem key={o.v} value={o.v}>
                        {o.l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {hasData && startDate && endDate && (
          <div className="bg-emerald-50 p-3 rounded-lg text-sm">
            <strong>Data for:</strong> {startDate} – {endDate}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="w-5 h-5 animate-spin inline mr-2" />
            Loading…
          </div>
        )}

        {/* ---------- Data Sections ---------- */}
        {!isLoading && hasData && (
          <div className="space-y-8">
            {/* Bucket Summary */}
            {bucketSummaryData.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Category Summary</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bucket</TableHead>
                      <TableHead className="text-right"># Titles</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Conv</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">ROAS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bucketSummaryData.map((b, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${bucketColor(b.bucket)}`}>
                            {b.bucket}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{fmtNum(b.num_titles)}</TableCell>
                        <TableCell className="text-right">{fmtCur(b.total_cost)}</TableCell>
                        <TableCell className="text-right">{fmtNum(b.total_conversions)}</TableCell>
                        <TableCell className="text-right">{fmtCur(b.total_value)}</TableCell>
                        <TableCell className="text-right font-semibold">{fmtROAS(b.roas)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 bg-gray-50 font-semibold">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">{fmtNum(bucketTotals.num_titles)}</TableCell>
                      <TableCell className="text-right">{fmtCur(bucketTotals.total_cost)}</TableCell>
                      <TableCell className="text-right">{fmtNum(bucketTotals.total_conversions)}</TableCell>
                      <TableCell className="text-right">{fmtCur(bucketTotals.total_value)}</TableCell>
                      <TableCell className="text-right">{fmtROAS(bucketTotals.roas)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Top Summary */}
            {topSummaryData && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Performance Summary</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">ROAS</TableHead>
                      <TableHead className="text-center">Conversions</TableHead>
                      <TableHead className="text-center">Cost</TableHead>
                      <TableHead className="text-center">Clicks</TableHead>
                      <TableHead className="text-center">Impressions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-center font-bold text-2xl text-green-600">
                        {fmtROAS(topSummaryData.overall_roas)}
                      </TableCell>
                      <TableCell className="text-center font-bold text-2xl text-emerald-600">
                        {fmtNum(topSummaryData.total_conversions)}
                      </TableCell>
                      <TableCell className="text-center font-bold text-2xl text-red-600">
                        {fmtCur(topSummaryData.total_cost)}
                      </TableCell>
                      <TableCell className="text-center font-bold text-2xl text-purple-600">
                        {fmtNum(topSummaryData.total_clicks)}
                      </TableCell>
                      <TableCell className="text-center font-bold text-2xl text-orange-600">
                        {fmtNum(topSummaryData.total_impressions)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Product Table */}
            {productSummary.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Product Breakdown</h3>
                  <Select
                    value={rowsPerPage.toString()}
                    onValueChange={(v) => {
                      setRowsPerPage(+v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 50, 100, 200, 500].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader col="product_id">ID</SortableHeader>
                      <SortableHeader col="product_title">Title</SortableHeader>
                      <SortableHeader col="total_clicks">Clicks</SortableHeader>
                      <SortableHeader col="total_impressions">Impr</SortableHeader>
                      <SortableHeader col="total_cost">Cost</SortableHeader>
                      <SortableHeader col="total_conversions">Conv</SortableHeader>
                      <SortableHeader col="total_conversion_value">Value</SortableHeader>
                      <SortableHeader col="product_roas">ROAS</SortableHeader>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((p, i) => (
                      <TableRow key={`${p.product_id}-${i}`}>
                        <TableCell className="font-medium text-emerald-600">{p.product_id}</TableCell>
                        <TableCell className="max-w-xs truncate" title={p.product_title}>
                          {p.product_title}
                        </TableCell>
                        <TableCell className="text-right">{fmtNum(p.total_clicks)}</TableCell>
                        <TableCell className="text-right">{fmtNum(p.total_impressions)}</TableCell>
                        <TableCell className="text-right">{fmtCur(p.total_cost)}</TableCell>
                        <TableCell className="text-right">{fmtNum(p.total_conversions)}</TableCell>
                        <TableCell className="text-right">{fmtCur(p.total_conversion_value)}</TableCell>
                        <TableCell className="text-right font-semibold">{fmtROAS(p.product_roas)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(currentPage * rowsPerPage, productSummary.length)} of{" "}
                    {productSummary.length}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </Button>
                    <span className="self-center text-sm">
                      Page {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------- Empty States ---------- */}
        {!isLoading && !hasData && topSummaryData === null && (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Select account, dates and click “View Data”.</p>
          </div>
        )}

        {!isLoading && !hasData && topSummaryData !== null && (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No data for the selected filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedAggregatedPerformanceOverview;