import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import OptimizedStandaloneUnifiedReport from "@/components/OptimizedStandaloneUnifiedReport";

const ProductsReportPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardShell>
      {({ selectedAccountId, selectedAccountName }) => (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to tools
          </Button>

          <OptimizedStandaloneUnifiedReport
            selectedAccountId={selectedAccountId}
            selectedAccountName={selectedAccountName}
          />

          {/* Category Definitions */}
          <section className="mt-12 bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Definitions</h2>
              <p className="text-gray-600">Understanding your product performance categories</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <h3 className="text-lg font-semibold text-green-800">Profitable</h3>
                </div>
                <p className="text-green-700 mb-4">
                  Products with ROAS ≥ 3.0, generating strong returns on ad spend.
                </p>
                <Button variant="outline" className="border-green-500 text-green-700 hover:bg-green-50" onClick={() => navigate("/guides/profitable-products")}>
                  Learn How to Scale
                </Button>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <h3 className="text-lg font-semibold text-yellow-800">Costly</h3>
                </div>
                <p className="text-yellow-700 mb-4">
                  Products with ROAS between 0.0-3.0, breaking even but room for improvement.
                </p>
                <Button variant="outline" className="border-yellow-500 text-yellow-700 hover:bg-yellow-50" onClick={() => navigate("/guides/costly-products")}>
                  Optimization Guide
                </Button>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <h3 className="text-lg font-semibold text-red-800">Zero-Conversion</h3>
                </div>
                <p className="text-red-700 mb-4">
                  Products spending money but generating no conversions. Consider pausing or optimizing.
                </p>
                <Button variant="outline" className="border-red-500 text-red-700 hover:bg-red-50" onClick={() => navigate("/guides/zero-conversion")}>
                  Diagnostic Guide
                </Button>
              </div>

              <div className="bg-gray-50 border-l-4 border-gray-500 p-6 rounded-r-lg">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                  <h3 className="text-lg font-semibold text-gray-800">Zombie</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Products with zero cost but present in campaigns. May need review or activation.
                </p>
                <Button variant="outline" className="border-gray-500 text-gray-700 hover:bg-gray-50" onClick={() => navigate("/guides/zombie-products")}>
                  Reactivation Guide
                </Button>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Disclaimer</h3>
                <p className="text-yellow-700">
                  <strong>Data Scope:</strong> This data calculation is specifically for shopping placements within your Shopping and Performance Max campaigns. If you are using Search Ads, Display Ads, or Video Ads, this data does not include segregation for those campaign types.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </DashboardShell>
  );
};

export default ProductsReportPage;
