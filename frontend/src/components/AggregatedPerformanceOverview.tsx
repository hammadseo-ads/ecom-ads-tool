// src/components/AggregatedPerformanceOverview.tsx
import React, { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext"
import toast from "react-hot-toast";
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  Filter,
} from "lucide-react";

interface TopSummaryData {
  overall_roas: number;
  total_conversions: number;
  total_cost: number;
  total_clicks: number;
  total_impressions: number;
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

interface Campaign {
  id: string;
  name: string;
}

interface AggregatedPerformanceOverviewProps {
  selectedAccountId: string;
  selectedAccountName: string;
}

const AggregatedPerformanceOverview: React.FC<AggregatedPerformanceOverviewProps> = ({
  selectedAccountId,
  selectedAccountName,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [topSummaryData, setTopSummaryData] = useState<TopSummaryData | null>(null);
  const [productSummary, setProductSummary] = useState<ProductSummary[]>([]);
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [hasData, setHasData] = useState(false);

  // Filters
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all");
  const [selectedCategoryTag, setSelectedCategoryTag] = useState<string>("all");

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US").format(num);

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);

  const formatRoas = (roas: number) => roas.toFixed(2);

  const fetchAggregatedData = async () => {
    if (!user || !selectedAccountId) {
      toast.error("Please select an account first");
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
        }),
      });

      const data = await res.json();

      if (res.ok && data.topSummaryData) {
        setTopSummaryData(data.topSummaryData);
        setProductSummary(data.productSummary || []);
        setCampaignList(data.campaignList || []);
        setHasData(true);
        toast.success(data.message || "Data loaded successfully");
      } else {
        setHasData(false);
        toast.error(data.message || "No data found");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAggregatedData = () => {
    setSelectedCampaignId("all");
    setSelectedCategoryTag("all");
    fetchAggregatedData();
  };

  useEffect(() => {
    if (hasData && (selectedCampaignId !== "all" || selectedCategoryTag !== "all")) {
      fetchAggregatedData();
    }
  }, [selectedCampaignId, selectedCategoryTag]);

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "Profitable", label: "Profitable" },
    { value: "Costly", label: "Costly" },
    { value: "Zero-Conversion", label: "Zero-Conversion" },
    { value: "Zombie", label: "Zombie" },
    { value: "Uncategorized", label: "Uncategorized" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span>Aggregated Performance Overview</span>
        </CardTitle>
        <CardDescription>
          View overall performance totals and product-level summaries with advanced filtering
          {selectedAccountName && ` - ${selectedAccountName}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Action Button */}
          <div className="flex justify-start">
            <Button
              onClick={handleViewAggregatedData}
              disabled={!selectedAccountId || isLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4 mr-2" />
              )}
              View Aggregated Data
            </Button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin inline mr-2" />
              Fetching aggregated data...
            </div>
          )}

          {/* Filters + Data */}
          {!isLoading && hasData && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Filter className="w-5 h-5 text-gray-600" />
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Campaign:</label>
                  <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Campaigns</SelectItem>
                      {campaignList.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Category:</label>
                  <Select value={selectedCategoryTag} onValueChange={setSelectedCategoryTag}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
                          {formatRoas(topSummaryData.overall_roas)}
                        </TableCell>
                        <TableCell className="text-center font-bold text-2xl text-emerald-600">
                          {formatNumber(topSummaryData.total_conversions)}
                        </TableCell>
                        <TableCell className="text-center font-bold text-2xl text-red-600">
                          {formatCurrency(topSummaryData.total_cost)}
                        </TableCell>
                        <TableCell className="text-center font-bold text-2xl text-purple-600">
                          {formatNumber(topSummaryData.total_clicks)}
                        </TableCell>
                        <TableCell className="text-center font-bold text-2xl text-orange-600">
                          {formatNumber(topSummaryData.total_impressions)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Product Table */}
              {productSummary.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Product Breakdown</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead className="text-right">Clicks</TableHead>
                          <TableHead className="text-right">Impressions</TableHead>
                          <TableHead className="text-right">Cost</TableHead>
                          <TableHead className="text-right">Conv</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                          <TableHead className="text-right">ROAS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productSummary.map((p, i) => (
                          <TableRow key={`${p.product_id}-${i}`}>
                            <TableCell className="font-medium text-emerald-600">
                              {p.product_id}
                            </TableCell>
                            <TableCell className="max-w-xs truncate" title={p.product_title}>
                              {p.product_title}
                            </TableCell>
                            <TableCell className="text-right">{formatNumber(p.total_clicks)}</TableCell>
                            <TableCell className="text-right">{formatNumber(p.total_impressions)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(p.total_cost)}</TableCell>
                            <TableCell className="text-right">{formatNumber(p.total_conversions)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(p.total_conversion_value)}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatRoas(p.product_roas)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Data */}
          {!isLoading && !hasData && topSummaryData === null && (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select an account and click "View Aggregated Data"</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AggregatedPerformanceOverview;