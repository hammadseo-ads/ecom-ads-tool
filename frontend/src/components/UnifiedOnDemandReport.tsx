import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, RefreshCw, Filter, ExternalLink, Trash2, Download } from "lucide-react";
import axios from 'axios';

interface UnifiedOnDemandReportProps {
  selectedAccountId: string;
  selectedAccountName: string;
  userId: string;
  InsightsComponent?: React.ComponentType<{
    reportData: ReportData | null;
    activeTab: string;
    selectedCampaign: string;
    onCampaignChange: (value: string) => void;
  }>;
  onReportGeneration?: () => void;
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

interface ReportData {
  product_details: ProductData[];
  summary_table: SummaryData[];
  campaign_list: CampaignOption[];
  total_products: number;
  message?: string;
}

const API_BASE = '/api/on-demand-report';

const UnifiedOnDemandReport: React.FC<UnifiedOnDemandReportProps> = ({
  selectedAccountId,
  selectedAccountName,
  userId,
  InsightsComponent,
  onReportGeneration
}) => {
  const { toast } = useToast();

  const [isReportGenerationInProgress, setIsReportGenerationInProgress] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [activeTab, setActiveTab] = useState('LAST_30_DAYS');
  const [reportGenerationMessage, setReportGenerationMessage] = useState('');
  const [reportData, setReportData] = useState<Record<string, ReportData>>({
    LAST_30_DAYS: { product_details: [], summary_table: [], campaign_list: [], total_products: 0 },
    LAST_60_DAYS: { product_details: [], summary_table: [], campaign_list: [], total_products: 0 },
    LAST_90_DAYS: { product_details: [], summary_table: [], campaign_list: [], total_products: 0 },
  });

  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortColumn, setSortColumn] = useState<keyof ProductData>('total_cost');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

  const [childAccounts, setChildAccounts] = useState<{id: string; name: string}[]>([]);
  const [selectedChildAccount, setSelectedChildAccount] = useState<string>(selectedAccountId);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const reportTabs = [
    { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { value: 'LAST_60_DAYS', label: 'Last 60 Days' },
    { value: 'LAST_90_DAYS', label: 'Last 90 Days' },
  ];

  // track if user manually selected a tab to avoid auto-switching
  const userSelectedTabRef = useRef(false);

  const categoryTabs = [
    { value: 'all', label: 'All Products' },
    { value: 'Profitable', label: 'Profitable' },
    { value: 'Costly', label: 'Costly' },
    { value: 'Zero-Conversion', label: 'Zero-Conversion' },
    { value: 'Zombie', label: 'Zombie' },
    { value: 'Uncategorized', label: 'Uncategorized' },
  ];

  const getAuthHeaders = () => ({
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      'Content-Type': 'application/json',
    },
  });

  // Empty report shape for resetting between accounts
  const emptyReportData = () => ({
    LAST_30_DAYS: { product_details: [], summary_table: [], campaign_list: [], total_products: 0 },
    LAST_60_DAYS: { product_details: [], summary_table: [], campaign_list: [], total_products: 0 },
    LAST_90_DAYS: { product_details: [], summary_table: [], campaign_list: [], total_products: 0 },
  });

  // Load cached reports on mount and whenever the selected account changes.
  // Critically: reset state FIRST so the previous account's data is never shown
  // for the new account.
  const checkCachedDataAvailability = React.useCallback(async () => {
    if (!userId || !selectedAccountId) {
      setReportData(emptyReportData());
      return;
    }

    // Reset before fetching so a switch to an account with no data shows nothing
    // (instead of the previous account's stale data).
    setReportData(emptyReportData());
    setSelectedCampaign('all');
    setSelectedCategory('all');
    setCurrentPage(1);

    const types = ['LAST_30_DAYS', 'LAST_60_DAYS', 'LAST_90_DAYS'];
    const customerToQuery = selectedChildAccount || selectedAccountId;
    let firstAvailable: string | null = null;

    // Fetch all three periods in parallel; only update state for periods that
    // actually returned data for THIS account.
    const results = await Promise.all(
      types.map(async (type) => {
        try {
          const { data } = await axios.post(
            `${API_BASE}/cached`,
            { user_id: userId, customer_id: customerToQuery, report_type: type },
            getAuthHeaders()
          );
          return { type, data };
        } catch {
          return { type, data: null };
        }
      })
    );

    setReportData((prev) => {
      const next = { ...prev };
      for (const { type, data } of results) {
        if (data?.product_details?.length > 0) {
          const backendCampaigns = data.campaign_list || [];
          const campaignList = [{ id: 'all', name: 'All Campaigns' }, ...backendCampaigns.filter((c: any) => c?.id !== 'all')];
          next[type] = {
            product_details: data.product_details,
            summary_table: data.summary_table || [],
            campaign_list: campaignList,
            total_products: data.total_products || 0,
            message: data.message,
          };
          if (!firstAvailable) firstAvailable = type;
        }
      }
      return next;
    });

    if (firstAvailable && !userSelectedTabRef.current) {
      setActiveTab(firstAvailable);
    }
  }, [userId, selectedAccountId, selectedChildAccount]);

  // Sync selectedChildAccount when the parent's selectedAccountId changes
  useEffect(() => {
    setSelectedChildAccount(selectedAccountId);
    // Reset the "user manually picked a tab" flag so auto-switching works again
    userSelectedTabRef.current = false;
  }, [selectedAccountId]);

  useEffect(() => {
    checkCachedDataAvailability();
  }, [checkCachedDataAvailability]);

  // Load available child accounts for MCC
  useEffect(() => {
    if (!selectedAccountId || !userId) return;

    const loadChildAccounts = async () => {
      setIsLoadingAccounts(true);
      try {
        const { data } = await axios.post(
          `${API_BASE}/list-accounts`,
          { customer_id: selectedAccountId },
          getAuthHeaders()
        );

        if (data?.available_accounts && data.available_accounts.length > 0) {
          // Normalize accounts to objects with {id, name}
          const normalized = data.available_accounts.map((a: any) => {
            if (typeof a === 'string') return { id: a, name: `Account ${a}` };
            return { id: a.id || String(a), name: a.name || `Account ${a.id || String(a)}` };
          });
          setChildAccounts(normalized);
          // Auto-select the first child account if current one is the manager
          const hasSelected = normalized.some((a: any) => a.id === selectedAccountId);
          if (!hasSelected) {
            setSelectedChildAccount(normalized[0].id);
          }
        }
      } catch (err) {
        // Silent error - child accounts not available (not an MCC)
        setChildAccounts([]);
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    loadChildAccounts();
  }, [selectedAccountId, userId]);

  const handleGenerateAllReports = async () => {
    if (!selectedChildAccount) {
      toast({ title: "Error", description: "Please select an account", variant: "destructive" });
      return;
    }

    onReportGeneration?.();
    setIsReportGenerationInProgress(true);
    setReportGenerationMessage('Generating reports...');

    toast({
      title: "Started",
      description: "Generating 30/60/90-day reports. This takes 10–60 seconds.",
      duration: 10000,
    });

    // Immediately show the 30-day insights panel with a placeholder so user sees feedback
    setActiveTab('LAST_30_DAYS');
    setSelectedCampaign('all');
    setSelectedCategory('all');
    setCurrentPage(1);

    setReportData(prev => ({
      ...prev,
      LAST_30_DAYS: {
        ...prev.LAST_30_DAYS,
        message: 'Generating reports...',
        // keep existing summary if present, otherwise provide a minimal placeholder so InsightsComponent renders
        summary_table: prev.LAST_30_DAYS?.summary_table && prev.LAST_30_DAYS.summary_table.length
          ? prev.LAST_30_DAYS.summary_table
          : [{ bucket: 'TOTAL', num_titles: 0, total_cost: 0, total_conversions: 0, total_value: 0, roas: 0 }],
        campaign_list: prev.LAST_30_DAYS?.campaign_list && prev.LAST_30_DAYS.campaign_list.length
          ? prev.LAST_30_DAYS.campaign_list
          : [{ id: 'all', name: 'All Campaigns' }],
      }
    }));

    try {
      await axios.post(
        `${API_BASE}/generate`,
        { user_id: userId, customer_id: selectedChildAccount },
        getAuthHeaders()
      );

      startPollingForCompletion();
    } catch (err: any) {
      toast({
        title: "Failed to start",
        description: err.response?.data?.error || "Please try again",
        variant: "destructive",
      });
      setIsReportGenerationInProgress(false);
      setReportGenerationMessage('');
    }
  };

  const startPollingForCompletion = () => {
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.post(`${API_BASE}/status`, {}, getAuthHeaders());

        if (data.status === 'COMPLETED' || data.status === 'NO_DATA') {
          clearInterval(interval);
          setIsReportGenerationInProgress(false);
          setReportGenerationMessage('Reports ready!');

          toast({
            title: "Success",
            description: data.count > 0
              ? `Loaded ${data.count} products`
              : "No Shopping/Performance Max data found in this period",
          });

          // Refresh cached data (prefer child account if selected)
          await checkCachedDataAvailability();
          // Show 30-day report by default and reset filters so users immediately see results
          setActiveTab('LAST_30_DAYS');
          setSelectedCampaign('all');
          setSelectedCategory('all');
          setCurrentPage(1);
          // Ensure we load the report data for the selected child account (or manager fallback)
          await loadReportData('LAST_30_DAYS');
        }
      } catch (err) {
        console.error('Status poll failed:', err);
      }
    }, 3000);

    setTimeout(() => {
      if (isReportGenerationInProgress) {
        clearInterval(interval);
        setIsReportGenerationInProgress(false);
        toast({ title: "Timeout", description: "Generation took too long", variant: "destructive" });
      }
    }, 180_000);
  };

  const handleTabChange = async (value: string) => {
    // mark that the user manually changed the tab so we don't auto-switch it
    userSelectedTabRef.current = true;
    setActiveTab(value);
    setCurrentPage(1);
    setSelectedCampaign('all');
    setSelectedCategory('all');

    if (!reportData[value].product_details.length) {
      await loadReportData(value);
    }
  };

  const loadReportData = async (reportType: string) => {
    try {
      const customerToQuery = selectedChildAccount || selectedAccountId;
      const { data } = await axios.post(
        `${API_BASE}/cached`,
        { user_id: userId, customer_id: customerToQuery, report_type: reportType },
        getAuthHeaders()
      );

      if (!data?.product_details?.length) {
        toast({ title: "No Data", description: "No report for this period", variant: "destructive" });
        return;
      }

      const backendCampaigns = data.campaign_list || [];
      const campaignList = [{ id: 'all', name: 'All Campaigns' }, ...backendCampaigns.filter((c: any) => c?.id !== 'all')];

      setReportData(prev => {
        const prevBlock = prev[reportType] || { product_details: [], summary_table: [], campaign_list: [], total_products: 0 };

        // If we had a generation placeholder, merge results instead of replacing so placeholder remains and real data is appended
        const isPlaceholder = prevBlock.message === 'Generating reports...';

        const mergedProductDetails = isPlaceholder
          ? [ ...(prevBlock.product_details || []), ...(data.product_details || []) ]
          : data.product_details || [];

        // Merge summary tables by appending backend summary after any placeholder summary
        const mergedSummary = isPlaceholder
          ? [ ...(prevBlock.summary_table || []), ...(data.summary_table || []) ]
          : (data.summary_table || []);

        // Merge campaign lists and dedupe by id
        const existingCampaigns = prevBlock.campaign_list || [];
        const combinedCampaigns = [ ...existingCampaigns, ...campaignList ];
        const dedupedCampaigns: any[] = [];
        const seen = new Set();
        combinedCampaigns.forEach((c: any) => {
          const id = String(c?.id || c);
          if (!seen.has(id)) {
            seen.add(id);
            dedupedCampaigns.push({ id, name: c?.name || (id === 'all' ? 'All Campaigns' : `Campaign ${id}`) });
          }
        });

        return {
          ...prev,
          [reportType]: {
            product_details: mergedProductDetails,
            summary_table: mergedSummary,
            campaign_list: dedupedCampaigns,
            total_products: data.total_products || mergedProductDetails.length || 0,
            message: undefined,
          }
        };
      });
      // Reset campaign/category selection to show all products by default
      setSelectedCampaign('all');
      setSelectedCategory('all');
    } catch (err) {
      toast({ title: "Error", description: "Failed to load report", variant: "destructive" });
    }
  };

  const handleClearAllReports = async () => {
    setIsClearing(true);
    try {
      // Clear reports for the currently-selected account only.
      // To wipe everything, use "Delete all data" in Account Settings.
      await axios.delete(`${API_BASE}/clear`, {
        data: { user_id: userId, customer_id: selectedAccountId },
        ...getAuthHeaders(),
        withCredentials: true,
      });

      setReportData({
        LAST_30_DAYS: { product_details: [], summary_table: [], campaign_list: [], total_products: 0 },
        LAST_60_DAYS: { product_details: [], summary_table: [], campaign_list: [], total_products: 0 },
        LAST_90_DAYS: { product_details: [], summary_table: [], campaign_list: [], total_products: 0 },
      });

      toast({ title: "Cleared", description: "All reports removed" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to clear", variant: "destructive" });
    } finally {
      setIsClearing(false);
    }
  };

  const currentData = reportData[activeTab];

  let filteredData = selectedCampaign === 'all'
    ? currentData.product_details
    : currentData.product_details.filter(p => p.campaign_id === selectedCampaign);

  if (selectedCategory !== 'all') {
    filteredData = filteredData.filter(p => p.category === selectedCategory);
  }

  const getFilteredSummaryTable = (): SummaryData[] => {
    // If backend provided a summary for 'all', use it (fast path)
    if (selectedCampaign === 'all' && currentData.summary_table && currentData.summary_table.length) return currentData.summary_table;

    // Otherwise, compute summary from available product details (either all products or campaign-specific)
    const products = selectedCampaign === 'all'
      ? (currentData.product_details || [])
      : (currentData.product_details || []).filter(p => p.campaign_id === selectedCampaign);

    if (!products.length) return currentData.summary_table || [];

    const categories = ['Zombie', 'Zero-Conversion', 'Profitable', 'Costly', 'Uncategorized'];
    const map = new Map<string, SummaryData>();
    categories.forEach(c => map.set(c, { bucket: c, num_titles: 0, total_cost: 0, total_conversions: 0, total_value: 0, roas: 0 }));

    const total = { num_titles: 0, total_cost: 0, total_conversions: 0, total_value: 0 };

    products.forEach(p => {
      const cat = p.category || 'Uncategorized';
      const s = map.get(cat) || { bucket: cat, num_titles: 0, total_cost: 0, total_conversions: 0, total_value: 0, roas: 0 };
      s.num_titles += 1;
      s.total_cost += Number(p.total_cost || 0);
      s.total_conversions += Number(p.total_conversions || 0);
      s.total_value += Number(p.total_conversion_value || 0);
      map.set(cat, s);

      total.num_titles += 1;
      total.total_cost += Number(p.total_cost || 0);
      total.total_conversions += Number(p.total_conversions || 0);
      total.total_value += Number(p.total_conversion_value || 0);
    });

    const table = Array.from(map.values()).map(s => ({
      ...s,
      roas: s.total_cost === 0 ? 0 : s.total_value / s.total_cost,
    }));

    table.push({
      bucket: 'TOTAL',
      num_titles: total.num_titles,
      total_cost: total.total_cost,
      total_conversions: total.total_conversions,
      total_value: total.total_value,
      roas: total.total_cost === 0 ? 0 : total.total_value / total.total_cost,
    });

    return table;
  };

  const filteredSummaryTable = getFilteredSummaryTable();

  const handleSort = (col: keyof ProductData) => {
    if (sortColumn === col) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('desc');
    }
  };

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortDirection === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const getCategoryBadgeColor = (cat: string) => {
    const map: Record<string, string> = {
      Profitable: 'bg-green-100 text-green-800',
      Costly: 'bg-yellow-100 text-yellow-800',
      'Zero-Conversion': 'bg-red-100 text-red-800',
      Zombie: 'bg-gray-100 text-gray-800',
      Uncategorized: 'bg-blue-100 text-blue-800',
      TOTAL: 'bg-purple-100 text-purple-800 font-bold',
    };
    return map[cat] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(v);

  const formatNumber = (v: number) => new Intl.NumberFormat('en-US').format(Math.round(v));

  const handleDownloadCSV = async () => {
    setIsDownloadingCSV(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/export-csv`,
        {
          user_id: userId,
          customer_id: selectedAccountId,
          report_type: activeTab,
          campaign_id: selectedCampaign !== 'all' ? selectedCampaign : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
        },
        { ...getAuthHeaders(), responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `product-report-${activeTab.toLowerCase()}-${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({ title: "Downloaded", description: "CSV ready!" });
    } catch (err) {
      toast({ title: "Error", description: "CSV download failed", variant: "destructive" });
    } finally {
      setIsDownloadingCSV(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Unified Product Performance Reports</span>
            </CardTitle>
            <CardDescription>
              Comprehensive analytics for {selectedAccountName} ({selectedAccountId})
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {selectedAccountId ? (
          <div className="space-y-6">
            {/* Only show this drill-down when the selected account is an MCC
                with children other than itself. If list-accounts only returns
                the selected account, it's a leaf — no need to ask again. */}
            {childAccounts.filter((a) => a.id !== selectedAccountId).length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Child Account (MCC)
                </label>
                <Select value={selectedChildAccount} onValueChange={setSelectedChildAccount}>
                  <SelectTrigger className="w-full max-w-sm">
                    <SelectValue placeholder="Choose an account..." />
                  </SelectTrigger>
                  <SelectContent>
                      {childAccounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name || account.id}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-2">
                  {isLoadingAccounts ? 'Loading accounts...' : `${childAccounts.length} child account(s) available`}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleGenerateAllReports}
                disabled={isReportGenerationInProgress}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isReportGenerationInProgress ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                Generate Reports
              </Button>

              <Button
                onClick={handleClearAllReports}
                disabled={isClearing || isReportGenerationInProgress}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {isClearing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Clear All Reports
              </Button>
            </div>

            {isReportGenerationInProgress && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-green-600" />
                <span className="text-green-800 font-medium">{reportGenerationMessage}</span>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-3 w-full">
                {reportTabs.map(t => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {reportTabs.map(tab => (
                <TabsContent key={tab.value} value={tab.value} className="space-y-6">
                  {!isReportGenerationInProgress && currentData.product_details.length === 0 && (
                    <div className="text-center py-12">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-medium">No data for {tab.label.toLowerCase()}</p>
                      <p className="text-sm text-gray-500">Click "Generate Reports" to fetch data.</p>
                    </div>
                  )}

                  {InsightsComponent && filteredSummaryTable.length > 0 && (
                    <InsightsComponent
                      reportData={{ ...currentData, summary_table: filteredSummaryTable }}
                      activeTab={activeTab}
                      selectedCampaign={selectedCampaign}
                      onCampaignChange={setSelectedCampaign}
                    />
                  )}

                  {filteredSummaryTable.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          Category Summary — {tab.label}
                          {selectedCampaign !== 'all' && (
                            <span className="text-sm font-normal text-gray-600 ml-2">
                              (Campaign: {currentData.campaign_list.find(c => c.id === selectedCampaign)?.name})
                            </span>
                          )}
                        </h3>
                        <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currentData.campaign_list.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Total Cost</TableHead>
                            <TableHead>Conversions</TableHead>
                            <TableHead>Conv. Value</TableHead>
                            <TableHead>ROAS</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSummaryTable.map((row, i) => (
                            <TableRow key={i} className={row.bucket === 'TOTAL' ? 'bg-purple-50 font-bold' : ''}>
                              <TableCell>
                                <Badge className={getCategoryBadgeColor(row.bucket)}>{row.bucket}</Badge>
                              </TableCell>
                              <TableCell>{row.num_titles}</TableCell>
                              <TableCell>{formatCurrency(row.total_cost)}</TableCell>
                              <TableCell>{formatNumber(row.total_conversions)}</TableCell>
                              <TableCell>{formatCurrency(row.total_value)}</TableCell>
                              <TableCell>{row.roas.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {currentData.product_details.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Product Details — {tab.label}</h3>
                        <div className="flex gap-4">
                          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="All Campaigns" />
                            </SelectTrigger>
                            <SelectContent>
                              {currentData.campaign_list.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select value={rowsPerPage.toString()} onValueChange={v => {
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

                      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
                        <TabsList className="grid grid-cols-6 bg-gray-50">
                          {categoryTabs.map(ct => (
                            <TabsTrigger key={ct.value} value={ct.value}>
                              {ct.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="cursor-pointer min-w-[300px]" onClick={() => handleSort('product_title')}>
                                Product Title {sortColumn === 'product_title' && (sortDirection === 'asc' ? 'Up' : 'Down')}
                              </TableHead>
                              <TableHead className="cursor-pointer min-w-[200px]" onClick={() => handleSort('campaign_name')}>
                                Campaign {sortColumn === 'campaign_name' && (sortDirection === 'asc' ? 'Up' : 'Down')}
                              </TableHead>
                              <TableHead>Channel</TableHead>
                              <TableHead className="cursor-pointer" onClick={() => handleSort('total_impressions')}>
                                Impressions {sortColumn === 'total_impressions' && (sortDirection === 'asc' ? 'Up' : 'Down')}
                              </TableHead>
                              <TableHead className="cursor-pointer" onClick={() => handleSort('total_clicks')}>
                                Clicks {sortColumn === 'total_clicks' && (sortDirection === 'asc' ? 'Up' : 'Down')}
                              </TableHead>
                              <TableHead className="cursor-pointer" onClick={() => handleSort('total_cost')}>
                                Cost {sortColumn === 'total_cost' && (sortDirection === 'asc' ? 'Up' : 'Down')}
                              </TableHead>
                              <TableHead className="cursor-pointer" onClick={() => handleSort('total_conversions')}>
                                Conversions {sortColumn === 'total_conversions' && (sortDirection === 'asc' ? 'Up' : 'Down')}
                              </TableHead>
                              <TableHead className="cursor-pointer" onClick={() => handleSort('total_conversion_value')}>
                                Conv. Value {sortColumn === 'total_conversion_value' && (sortDirection === 'asc' ? 'Up' : 'Down')}
                              </TableHead>
                              <TableHead className="cursor-pointer" onClick={() => handleSort('roas')}>
                                ROAS {sortColumn === 'roas' && (sortDirection === 'asc' ? 'Up' : 'Down')}
                              </TableHead>
                              <TableHead>Category</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedData.map((p, i) => (
                              <TableRow key={`${p.product_item_id}-${p.campaign_id}-${i}`}>
                                <TableCell className="min-w-[300px]">
                                  {p.product_link ? (
                                    <a href={p.product_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                      <span className="truncate max-w-md">{p.product_title}</span>
                                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    </a>
                                  ) : (
                                    <span className="truncate max-w-md">{p.product_title}</span>
                                  )}
                                </TableCell>
                                <TableCell className="min-w-[200px]">{p.campaign_name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {p.channel_type?.replace('_', ' ') || 'Unknown'}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatNumber(p.total_impressions)}</TableCell>
                                <TableCell>{formatNumber(p.total_clicks)}</TableCell>
                                <TableCell>{formatCurrency(p.total_cost)}</TableCell>
                                <TableCell>{formatNumber(p.total_conversions)}</TableCell>
                                <TableCell>{formatCurrency(p.total_conversion_value)}</TableCell>
                                <TableCell className="font-semibold">{p.roas.toFixed(2)}</TableCell>
                                <TableCell>
                                  <Badge className={getCategoryBadgeColor(p.category)}>{p.category}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6 text-sm">
                          <div className="text-gray-600">
                            Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, sortedData.length)} of {sortedData.length}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                              Previous
                            </Button>
                            <span>Page {currentPage} / {totalPages}</span>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                              Next
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end mt-4">
                        <Button
                          onClick={handleDownloadCSV}
                          disabled={isDownloadingCSV || !sortedData.length}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {isDownloadingCSV ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          <span>{isDownloadingCSV ? 'Downloading...' : 'Download CSV'}</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Please select a Google Ads account to view reports.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedOnDemandReport;