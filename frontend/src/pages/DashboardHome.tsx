import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, ArrowRight } from "lucide-react";
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

            <div className="grid md:grid-cols-2 gap-6">
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
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-400" onClick={() => navigate("/dashboard/keywords")}>
                <CardHeader>
                  <div className="bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-blue-700" />
                  </div>
                  <CardTitle className="text-2xl">Budget Wastage by Keywords</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Surface Performance Max search terms that may be wasting budget — and
                    find candidates for negative keywords.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Open Keyword Analysis <ArrowRight className="w-4 h-4 ml-2" />
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
