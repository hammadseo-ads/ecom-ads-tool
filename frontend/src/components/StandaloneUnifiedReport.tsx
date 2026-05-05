import React from 'react';
import { AlertTriangle, CheckCircle, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UnifiedOnDemandReport from './UnifiedOnDemandReport';
import { useToast } from "@/hooks/use-toast";

interface SummaryData {
  bucket: string;
  num_titles: number;
  total_cost: number;
  total_conversions: number;
  total_value: number;
  roas: number;
}

interface StandaloneUnifiedReportProps {
  selectedAccountId: string;
  selectedAccountName: string;
  userId: string; // <-- Now using MongoDB _id (string) from JWT
}

const StandaloneUnifiedReport: React.FC<StandaloneUnifiedReportProps> = ({ 
  selectedAccountId, 
  selectedAccountName, 
  userId 
}) => {
  const { toast } = useToast();

  const handleReportGeneration = () => {
    toast({
      title: "Generating Reports",
      description: "Just wait for a few seconds, you'll see reports in a while.",
    });
  };

  // Same powerful insights generator, unchanged logic
  const generateInsights = (summaryData: SummaryData[], activeTab: string) => {
    if (!summaryData || summaryData.length === 0) return null;

    const totalRow = summaryData.find(item => item.bucket === 'TOTAL');
    const profitableRow = summaryData.find(item => item.bucket === 'Profitable');
    const zombieRow = summaryData.find(item => item.bucket === 'Zombie');
    const zeroCostRow = summaryData.find(item => item.bucket === 'Zero-Conversion');

    if (!totalRow) return null;

    const profitableCost = profitableRow?.total_cost || 0;
    const profitableValue = profitableRow?.total_value || 0;
    const totalCost = totalRow.total_cost;
    const totalValue = totalRow.total_value;
    
    const profitableBudgetPercentage = totalCost > 0 ? (profitableCost / totalCost) * 100 : 0;
    const profitableSalesPercentage = totalValue > 0 ? (profitableValue / totalValue) * 100 : 0;

    const wastedCost = zeroCostRow?.total_cost || 0;
    const wastedPercentage = totalCost > 0 ? (wastedCost / totalCost) * 100 : 0;

    const zombieCount = zombieRow?.num_titles || 0;
    const totalProducts = totalRow.num_titles;
    const untappedPercentage = totalProducts > 0 ? (zombieCount / totalProducts) * 100 : 0;

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(value);
    };

    const formatPercentage = (value: number) => {
      return `${value.toFixed(1)}%`;
    };

    const tabLabel = activeTab === 'LAST_30_DAYS' ? '30 days' : 
                    activeTab === 'LAST_60_DAYS' ? '60 days' : '90 days';

    return (
      <div className="grid gap-6">
        {/* Profitable Budget */}
        {profitableBudgetPercentage > 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
          <div className="flex items-start justify-between mb-4">
            <h4 className="text-lg font-semibold text-green-800">Profitable Budget</h4>
            <div className="bg-green-100 px-3 py-1 rounded-full">
              <span className="text-green-800 font-bold text-lg">{formatPercentage(profitableBudgetPercentage)}</span>
            </div>
          </div>
          <p className="text-green-700 mb-4">
            <strong>{formatPercentage(profitableSalesPercentage)}</strong> of your sales came from just <strong>{formatPercentage(profitableBudgetPercentage)}</strong> of your budget. 
            {profitableCost > 0 && (
              <span> {formatCurrency(profitableCost)} out of {formatCurrency(totalCost)} total spend generated {formatCurrency(profitableValue)} in profitable sales over the past {tabLabel.split(' ')[0]} days.</span>
            )}
          </p>
          <p className="text-green-700 text-sm">
            This demonstrates the 80/20 marketing principle in action. These high-performing products represent your biggest opportunity for growth. Consider increasing budget allocation to these profitable items to maximize your return on ad spend.
          </p>
        </div>
        )}

        {/* Budget Wasted */}
        {wastedPercentage > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
          <div className="flex items-start justify-between mb-4">
            <h4 className="text-lg font-semibold text-red-800">Budget Wasted</h4>
            <div className="bg-red-100 px-3 py-1 rounded-full">
              <span className="text-red-800 font-bold text-lg">{formatPercentage(wastedPercentage)}</span>
            </div>
          </div>
          <p className="text-red-700 mb-4">
            <strong>{formatCurrency(wastedCost)}</strong> out of <strong>{formatCurrency(totalCost)}</strong> total spend went to products that generated zero conversions over the past {tabLabel.split(' ')[0]} days.
          </p>
          <p className="text-red-700 text-sm">
            This represents direct budget waste. Consider pausing or optimizing these zero-conversion products to redirect spend toward your profitable items.
          </p>
        </div>
        )}

        {/* Untapped Products */}
        {untappedPercentage > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
          <div className="flex items-start justify-between mb-4">
            <h4 className="text-lg font-semibold text-yellow-800">Untapped Products</h4>
            <div className="bg-yellow-100 px-3 py-1 rounded-full">
              <span className="text-yellow-800 font-bold text-lg">{formatPercentage(untappedPercentage)}</span>
            </div>
          </div>
          <p className="text-yellow-700 mb-4">
            <strong>{zombieCount}</strong> out of <strong>{totalProducts}</strong> products are classified as "Zombie" products - meaning they have minimal visibility and spend in your campaigns.
          </p>
          <p className="text-yellow-700 text-sm">
            These products represent untapped potential. By strategically increasing spend on these items, you could discover hidden gems that drive additional sales for your store.
          </p>
        </div>
        )}

        {/* No Data Message */}
        {profitableBudgetPercentage === 0 && wastedPercentage === 0 && untappedPercentage === 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
          <h4 className="text-lg font-semibold text-blue-800 mb-2">No Significant Data Available</h4>
          <p className="text-blue-700 text-sm">
            There is currently no data to analyze for this period or campaign. Generate reports to see insights about your campaign performance, budget allocation, and product profitability.
          </p>
        </div>
        )}

        {/* Quick Action Recommendations */}
        {(profitableBudgetPercentage > 0 || wastedPercentage > 0 || untappedPercentage > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="text-lg font-semibold text-gray-900">Quick Action Recommendations:</h4>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-green-700">• Immediate:</span>
              <span>Scale budget on profitable products (ROAS ≥ 3.0) to maximize the 80/20 principle</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-red-700">• Short-term:</span>
              <span>Pause or reduce spend on zero-conversion products to stop budget waste</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-yellow-700">• Long-term:</span>
              <span>Test increased spend on zombie products to uncover hidden opportunities</span>
            </li>
          </ul>
        </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <UnifiedOnDemandReport
        selectedAccountId={selectedAccountId}
        selectedAccountName={selectedAccountName}
        userId={userId} // <-- Now using MongoDB user._id
        InsightsComponent={({ reportData, activeTab, selectedCampaign, onCampaignChange }) => (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {/* <AlertTriangle className="w-5 h-5 text-green-600" /> */}
                <h3 className="text-xl font-bold text-gray-900">
                  What we found from your data? ({activeTab === 'LAST_30_DAYS' ? '30 days' : activeTab === 'LAST_60_DAYS' ? '60 days' : '90 days'})
                </h3>
              </div>
              <div className="flex bg-white  items-center space-x-2">
                {/* <Filter className="w-4 h-4" /> */}
                <Select value={selectedCampaign} onValueChange={onCampaignChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportData.campaign_list?.map((campaign: any) => (
                      <SelectItem key={campaign.id} className='p-2 bg-gray-100' value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {reportData && generateInsights(reportData.summary_table, activeTab)}
          </div>
        )}
        onReportGeneration={handleReportGeneration}
      />
    </div>
  );
};

export default StandaloneUnifiedReport;