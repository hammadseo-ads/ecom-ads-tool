// src/App.tsx ← FINAL VERSION — YOU WILL BE REDIRECTED TO DASHBOARD AFTER LOGIN
import React from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppDataProvider } from "./contexts/AppDataContext";
import { useUser } from "./hooks/useUser";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardHome from "./pages/DashboardHome";
import ProductsReportPage from "./pages/ProductsReportPage";
import KeywordsReportPage from "./pages/KeywordsReportPage";
import Account from "./pages/Account";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import ContactSuccess from "./pages/ContactSuccess";
import NotFound from "./pages/NotFound";
import GoogleAdsService from "./pages/GoogleAdsService";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Guides
import ZombieProductsGuide from "./pages/ZombieProductsGuide";
import ZeroConversionGuide from "./pages/ZeroConversionGuide";
import CostlyProductsGuide from "./pages/CostlyProductsGuide";
import ProfitableProductsGuide from "./pages/ProfitableProductsGuide";
import GoogleAdsAuditGuide from "./pages/GoogleAdsAuditGuide";
import CampaignStructureGuide from "./pages/CampaignStructureGuide";
import ProductTitleOptimizationGuide from "./pages/ProductTitleOptimizationGuide";
import StrategicNegativeKeywordsGuide from "./pages/StrategicNegativeKeywordsGuide";
import Guides from "./pages/Guides";

// Portfolio
import Portfolio from "./pages/Portfolio";
import MyGreenScapePortfolio from "./pages/MyGreenScapePortfolio";
import PJBoldPortfolio from "./pages/PJBoldPortfolio";
import MathfelPortfolio from "./pages/MathfelPortfolio";
import TopTinyPortfolio from "./pages/TopTinyPortfolio";
import SimpleGoogleAdsSalesFormula from "./pages/SimpleGoogleAdsSalesFormula";

// Components
import Footer from "./components/Footer";

const queryClient = new QueryClient();

// Global redirect after login
const RootRedirect = () => {
  const { user, loading } = useUser();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <GoogleAdsService />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppDataProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<RootRedirect />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  {/* Protected */}
                  <Route path="/dashboard" element={<DashboardHome />} />
                  <Route path="/dashboard/products" element={<ProductsReportPage />} />
                  <Route path="/dashboard/keywords" element={<KeywordsReportPage />} />
                  <Route path="/account" element={<Account />} />

                  {/* Public */}
                  <Route path="/ads-tool" element={<Index />} />
                  <Route path="/guides" element={<Guides />} />
                  <Route path="/guides/zombie-products" element={<ZombieProductsGuide />} />
                  <Route path="/guides/zero-conversion" element={<ZeroConversionGuide />} />
                  <Route path="/guides/costly-products" element={<CostlyProductsGuide />} />
                  <Route path="/guides/profitable-products" element={<ProfitableProductsGuide />} />
                  <Route path="/google-ads-audit-guide" element={<GoogleAdsAuditGuide />} />
                  <Route path="/campaign-structure-guide" element={<CampaignStructureGuide />} />
                  <Route path="/product-title-optimization-guide" element={<ProductTitleOptimizationGuide />} />
                  <Route path="/strategic-negative-keywords-guide" element={<StrategicNegativeKeywordsGuide />} />

                  {/* Portfolio */}
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/case-studies" element={<Portfolio />} />
                  <Route path="/portfolio/mygreen-scape" element={<MyGreenScapePortfolio />} />
                  <Route path="/portfolio/pj-bold" element={<PJBoldPortfolio />} />
                  <Route path="/portfolio/mathfel" element={<MathfelPortfolio />} />
                  <Route path="/portfolio/toptiny" element={<TopTinyPortfolio />} />
                  <Route path="/simple-google-ads-sales-formula" element={<SimpleGoogleAdsSalesFormula />} />
                  <Route path="/google-ads-service" element={<GoogleAdsService />} />

                  {/* Static */}
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/contact-success" element={<ContactSuccess />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </AppDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;