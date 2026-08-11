import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext"; // Your MERN JWT context
import { Download, RefreshCw, Calendar, TrendingUp } from "lucide-react";
import axios from 'axios';

interface ProductPerformanceSectionProps {
  selectedAccountId: string;
  selectedAccountName: string;
}

const ProductPerformanceSection: React.FC<ProductPerformanceSectionProps> = ({
  selectedAccountId,
  selectedAccountName
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isFetching, setIsFetching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [fetchStatus, setFetchStatus] = useState<string>('');

  // Helper: Get date range (last 30 days including today)
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  };

  // Poll status from our MERN backend
  const pollFetchStatus = async () => {
    if (!user?.id || !selectedAccountId) return;

    try {
      const res = await axios.get('/api/reports/status', {
        params: {
          user_id: user.id,
          customer_id: selectedAccountId
        }
      });

      const status = res.data.status;

      if (status === 'COMPLETED') {
        setFetchProgress(100);
        setFetchStatus('Data fetch complete. CSV ready for download.');
        setIsFetching(false);
        toast({
          title: "Success",
          description: "Successfully fetched 30 days of product performance data",
        });
      } else if (status === 'PENDING' || status === 'PROCESSING') {
        // You can enhance this later with real progress from backend
        setFetchProgress(65);
        setFetchStatus('Processing your data... This may take 1-3 minutes.');
      }
    } catch (err: any) {
      console.error('Polling error:', err);
      if (err.response?.status === 404) {
        // No active job
        setFetchStatus('Ready to fetch data');
      }
    }
  };

  // Poll every 3 seconds when fetching
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isFetching) {
      interval = setInterval(pollFetchStatus, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFetching, user, selectedAccountId]);

  const handleFetchProductData = async () => {
    if (!user?._id || !selectedAccountId) {
      toast({
        title: "Error",
        description: "Please select a Google Ads account first",
        variant: "destructive",
      });
      return;
    }

    setIsFetching(true);
    setFetchProgress(10);
    setFetchStatus('Starting data fetch for last 30 days...');

    const { start_date, end_date } = getDateRange();

    try {
      await axios.post('/api/reports/generate', {
        customer_id: selectedAccountId,
        user_id: user.id,
        // Optional: specify date range if your backend supports it
        // start_date,
        // end_date
      });

      setFetchStatus('Fetching product data from Google Ads...');
      setFetchProgress(35);

      toast({
        title: "Fetching Started",
        description: "We're pulling your last 30 days of product data. This takes 1-3 minutes.",
      });
    } catch (err: any) {
      console.error('Fetch failed:', err);
      setIsFetching(false);
      setFetchProgress(0);
      setFetchStatus('');
      toast({
        title: "Failed",
        description: err.response?.data?.error || "Could not start data fetch",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCSV = async () => {
    if (!user?.id || !selectedAccountId) {
      toast({
        title: "Error",
        description: "No account selected",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const res = await axios.post('/api/reports/export-csv', {
        user_id: user.id,
        customer_id: selectedAccountId,
        report_type: 'LAST_30_DAYS',
        campaign_id: 'all',
        category: 'all'
      }, {
        responseType: 'blob' // Important for file download
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `product-performance-${selectedAccountId}-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Downloaded!",
        description: "Your 30-day product performance report is ready",
      });
    } catch (err: any) {
      console.error('Download failed:', err);
      toast({
        title: "Download Failed",
        description: err.response?.data?.error || "Could not download CSV",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span>Product Performance Data</span>
        </CardTitle>
        <CardDescription>
          Fetch and download detailed product performance data for the last 30 days
          {selectedAccountName && ` - ${selectedAccountName}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleFetchProductData}
              disabled={!selectedAccountId || isFetching}
              className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white"
            >
              {isFetching ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-2" />
              )}
              Fetch Product Data (Last 30 Days)
            </Button>

            <Button
              onClick={handleDownloadCSV}
              disabled={!selectedAccountId || isExporting || isFetching}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download CSV Report
            </Button>
          </div>

          {/* Progress Bar */}
          {isFetching && (
            <div className="space-y-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-emerald-900">{fetchStatus}</span>
                <span className="text-emerald-700">{Math.round(fetchProgress)}%</span>
              </div>
              <Progress value={fetchProgress} className="h-3" />
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gradient-to-br from-indigo-50 to-emerald-50 p-5 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-3">How to Use:</h4>
            <ol className="space-y-2 text-sm text-indigo-800 list-decimal list-inside">
              <li>Select your Google Ads account from the header above</li>
              <li>Click <strong>"Fetch Product Data"</strong> → waits 1–3 minutes</li>
              <li>Once complete, click <strong>"Download CSV Report"</strong></li>
              <li>Use the downloaded file in Excel/Google Sheets for deep analysis</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPerformanceSection;