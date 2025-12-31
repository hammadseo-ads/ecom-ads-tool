// components/OnDemandProductReport.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, RefreshCw, Filter, ExternalLink } from "lucide-react";
import axios from 'axios';

interface OnDemandProductReportProps {
  selectedAccountId: string;
  selectedAccountName: string;
}

interface ProductData {
  campaign_id: string;
  product_item_id: string;
  product_title: string;
  product_link: string;
  channel_type: string;
  campaign_name: string;
  total_impressions: number;
  total_clicks: number;
  total_cost: number;
  total_conversions: number;
  total_conversion_value: number;
  roas: number;
  category: string;
}

interface SummaryData {
  bucket: string;
  num_titles: number;
  total_cost: number;
  total_conversions: number;
  total_value: number;
  roas: number;
}

interface CampaignOption {
  id: string;
  name: string;
}

const OnDemandProductReport: React.FC<OnDemandProductReportProps> = ({
  selectedAccountId,
  selectedAccountName
}) => {
  const { toast } = useToast();

  const [selectedDateRange, setSelectedDateRange] = useState('LAST_30_DAYS');
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData[]>([]);
  const [campaignList, setCampaignList] = useState<CampaignOption[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [sortColumn, setSortColumn] = useState<keyof ProductData>('total_cost');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const dateRangeOptions = [
    { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { value: 'LAST_60_DAYS', label: 'Last 60 Days' },
    { value: 'LAST_90_DAYS', label: 'Last 90 Days' }
  ];

  const getAuthToken = () => localStorage.getItem('token') || '';

  const handleFetchData = async () => {
    if (!selectedAccountId) {
      toast({
        title: "Error",
        description: "Please select a Google Ads account first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProductData([]);
    setSummaryData([]);
    setCampaignList([]);
    setCurrentPage(1);

    try {
      const response = await axios.post('/api/on-demand-report/generate', {
        customer_id: selectedAccountId,
        date_range_preset: selectedDateRange,
        selected_campaign_id: selectedCampaign === 'all' ? null : selectedCampaign
      }, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const { product_details, summary_table, campaign_list, message } = response.data;

      setProductData(product_details || []);
      setSummaryData(summary_table || []);
      setCampaignList([
        { id: 'all', name: 'All Campaigns' },
        ...(campaign_list || []).map((c: CampaignOption) => ({ id: c.id, name: c.name }))
      ]);

      toast({
        title: "Success",
        description: message || "Product report loaded successfully",
      });

    } catch (error: any) {
      console.error('Error fetching product report:', error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to fetch report";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: keyof ProductData) => {
    if (column === sortColumn) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedData = [...productData].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const aStr = String(aValue ?? '').toLowerCase();
    const bStr = String(bValue ?? '').toLowerCase();
    return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      'Profitable': 'bg-green-100 text-green-800',
      'Costly': 'bg-yellow-100 text-yellow-800',
      'Zero-Conversion': 'bg-red-100 text-red-800',
      'Zombie': 'bg-gray-100 text-gray-800',
      'Uncategorized': 'bg-blue-100 text-blue-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>On-Demand Product Performance Report</span>
            </CardTitle>
            <CardDescription>
              Generate real-time product performance insights for selected date ranges
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedAccountId ? (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Date Range:</span>
                {dateRangeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={selectedDateRange === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDateRange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              <Button
                onClick={handleFetchData}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                Fetch Report Data
              </Button>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Fetching product data from Google Ads...</span>
                </div>
              </div>
            )}

            {/* Summary Table */}
            {summaryData.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Category Summary</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>Conversions</TableHead>
                        <TableHead>Conversion Value</TableHead>
                        <TableHead>ROAS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryData.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Badge className={getCategoryBadgeColor(s.bucket)}>
                              {s.bucket}
                            </Badge>
                          </TableCell>
                          <TableCell>{s.num_titles}</TableCell>
                          <TableCell>{formatCurrency(s.total_cost)}</TableCell>
                          <TableCell>{formatNumber(s.total_conversions)}</TableCell>
                          <TableCell>{formatCurrency(s.total_value)}</TableCell>
                          <TableCell>{s.roas.toFixed(2)}x</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Product Details */}
            {productData.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Product Details</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by campaign" />
                        </SelectTrigger>
                        <SelectContent>
                          {campaignList.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Select value={rowsPerPage.toString()} onValueChange={(v) => {
                      setRowsPerPage(Number(v));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 20, 50, 100].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {[
                          'product_title', 'product_item_id', 'campaign_name', 'channel_type',
                          'total_impressions', 'total_clicks', 'total_cost', 'total_conversions',
                          'total_conversion_value', 'roas', 'category'
                        ].map(col => (
                          <TableHead
                            key={col}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort(col as keyof ProductData)}
                          >
                            {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            {sortColumn === col && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                          </TableHead>
                        ))}
                        <TableHead>Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((p, i) => (
                        <TableRow key={`${p.product_item_id}-${p.campaign_id}-${i}`}>
                          <TableCell className="max-w-xs">
                            {p.product_link ? (
                              <a href={p.product_link} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1">
                                <span className="truncate">{p.product_title}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="truncate">{p.product_title}</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{p.product_item_id}</TableCell>
                          <TableCell>{p.campaign_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {p.channel_type?.replace('_', ' ') || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatNumber(p.total_impressions)}</TableCell>
                          <TableCell>{formatNumber(p.total_clicks)}</TableCell>
                          <TableCell>{formatCurrency(p.total_cost)}</TableCell>
                          <TableCell>{formatNumber(p.total_conversions)}</TableCell>
                          <TableCell>{formatCurrency(p.total_conversion_value)}</TableCell>
                          <TableCell className="font-semibold">{p.roas.toFixed(2)}x</TableCell>
                          <TableCell>
                            <Badge className={getCategoryBadgeColor(p.category)}>
                              {p.category}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, sortedData.length)} of {sortedData.length}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}>
                        Previous
                      </Button>
                      <span className="flex items-center px-2 text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button variant="outline" size="sm" disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}>
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && productData.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="font-medium text-lg">No product data yet</p>
                <p className="text-sm mt-2">
                  Click "Fetch Report Data" to load performance insights for {selectedAccountName || 'your account'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Please select a Google Ads account from the header to generate reports.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnDemandProductReport;