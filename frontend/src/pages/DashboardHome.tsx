import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, ArrowRight, Layout } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

const DashboardHome = () => {
  const navigate = useNavigate();

  return (
    <DashboardShell>
      {({ selectedAccountId, selectedAccountName }) => (
        selectedAccountId ? (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Choose your analysis
              </h1>
              <p className="text-gray-600 mt-2">
                Analytics for <span className="font-semibold">{selectedAccountName}</span>{" "}
                <span className="text-gray-400">({selectedAccountId})</span>
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Products tool */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-400" onClick={() => navigate("/dashboard/products")}>
                <CardHeader>
                  <div className="bg-emerald-100 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-7 h-7 text-emerald-700" />
                  </div>
                  <CardTitle className="text-2xl">Budget Wastage by Products</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Find profitable, costly, zero-conversion, and zombie products in your
                    Shopping & Performance Max campaigns.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Open Product Analysis <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Keywords tool */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-500" onClick={() => navigate("/dashboard/keywords")}>
                <CardHeader>
                  <div className="bg-emerald-50 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-emerald-700" />
                  </div>
                  <CardTitle className="text-2xl">Budget Wastage by Keywords</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Surface Performance Max search terms that may be wasting budget — and
                    find candidates for negative keywords.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-emerald-700 hover:bg-emerald-800">
                    Open Keyword Analysis <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Manual CRO Audit (no Google connection) */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500" onClick={() => navigate("/guides/ecommerce-cro-audit")}>
                <CardHeader>
                  <div className="bg-green-100 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                    <Layout className="w-7 h-7 text-green-700" />
                  </div>
                  <CardTitle className="text-2xl">Website CRO Audit</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Manual checklist — open your store and audit it section by section.
                    No Google Ads connection needed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Start Manual Audit <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null
      )}
    </DashboardShell>
  );
};

export default DashboardHome;
