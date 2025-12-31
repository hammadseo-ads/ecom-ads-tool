// src/pages/Dashboard.tsx ← FINAL & FULLY WORKING VERSION
import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import { useAppData } from "@/contexts/AppData";

import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  AlertTriangle,
  Zap,
  Target,
  Plus,
  RefreshCw,
} from "lucide-react";

import OptimizedNavigationHeader from "../components/OptimizedNavigationHeader";
import OptimizedStandaloneUnifiedReport from "../components/OptimizedStandaloneUnifiedReport";
import { WelcomeMessage } from "../components/ui/WelcomeMessage";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();

  const {
    hasConnection,
    // emailVerified,
    isNewUser,
    allAccounts,
    hierarchy,
    refreshConnectionStatus,
    refreshAccounts,
  } = useAppData();

  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedAccountName, setSelectedAccountName] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Load saved account selection
  useEffect(() => {
    const savedId = localStorage.getItem("selectedAccountId");
    const savedName = localStorage.getItem("selectedAccountName");
    if (savedId && savedName) {
      setSelectedAccountId(savedId);
      setSelectedAccountName(savedName);
    }
  }, []);

  // Welcome message for new users
  useEffect(() => {
    if (user && isNewUser) {
      const hasShown = localStorage.getItem("welcome_shown");
      if (!hasShown) {
        setShowWelcome(true);
      }
    }
  }, [user, isNewUser]);

  // CRITICAL: Detect OAuth success and errors, refresh data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");

    if (success === "connected") {
      toast({
        title: "Google Ads Connected!",
        description: "Your account is linked. Loading your Google Ads accounts...",
      });

      // Clean URL
      window.history.replaceState({}, "", "/dashboard");

      // Refresh data from backend
      refreshConnectionStatus();
      refreshAccounts();
    } else if (error) {
      let errorTitle = "Connection Failed";
      let errorDescription = "There was an error connecting your Google Ads account. Please try again.";

      switch (error) {
        case "callback_failed":
          errorTitle = "OAuth Connection Failed";
          errorDescription = "The Google Ads connection process encountered an error. This might be due to invalid credentials or permissions. Please try connecting again.";
          break;
        case "oauth_error":
          errorTitle = "OAuth Error";
          errorDescription = "There was an issue with the OAuth authorization. Please check your permissions and try again.";
          break;
        case "missing_code":
          errorTitle = "Authorization Incomplete";
          errorDescription = "The authorization process was incomplete. Please try connecting your Google Ads account again.";
          break;
        case "invalid_grant":
          errorTitle = "Invalid Authorization";
          errorDescription = "The authorization code has expired or is invalid. Please try connecting your Google Ads account again.";
          break;
        case "access_denied":
          errorTitle = "Access Denied";
          errorDescription = "Access to Google Ads was denied. Please ensure you have the necessary permissions and try again.";
          break;
        case "timeout":
          errorTitle = "Connection Timeout";
          errorDescription = "The connection to Google Ads timed out. Please check your internet connection and try again.";
          break;
        default:
          errorDescription = `Connection error: ${error}. Please try again or contact support if the issue persists.`;
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });

      // Clean URL
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [toast, refreshConnectionStatus, refreshAccounts]);

  const handleWelcomeShown = () => {
    setShowWelcome(false);
    localStorage.setItem("welcome_shown", "true");
    localStorage.setItem("is_new_user", "false");
  };

  const handleConnectGoogleAds = async () => {
  if (!user) {
    toast({ title: "Error", description: "Please log in", variant: "destructive" });
    return;
  }

  setIsConnecting(true);
  try {
    const res = await fetch("http://localhost:5000/api/google-ads/auth-url", {
      method: "POST", // ← WAS GET → WRONG
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user._id }), // ← SEND USER ID
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");

    window.location.href = data.authorizeUrl;
  } catch (error: any) {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  } finally {
    setIsConnecting(false);
  }
};

  const handleAccountSelection = (accountId: string, accountName: string) => {
    setSelectedAccountId(accountId);
    setSelectedAccountName(accountName);
    localStorage.setItem("selectedAccountId", accountId);
    localStorage.setItem("selectedAccountName", accountName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Message */}
      {showWelcome && <WelcomeMessage onShown={handleWelcomeShown} />}

      {/* Navigation Header */}
      <OptimizedNavigationHeader
        onAccountSelection={handleAccountSelection}
        selectedAccountId={selectedAccountId}
        selectedAccountName={selectedAccountName}
        allAccounts={allAccounts}
        hierarchy={hierarchy}
        hasConnection={hasConnection}
      />

      {/* Hero Section - Not Connected */}
      {!hasConnection && (
        <section className="bg-gradient-to-r from-green-25 to-green-50 text-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Connect Your Google Ads Account
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto text-gray-700">
                Get started by connecting your Google Ads account to unlock powerful insights about your product performance.
              </p>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-green-700" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-green-800">Identify Winners</h3>
                  <p className="text-green-700">Scale profitable products</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-green-700" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-green-800">Stop Budget Waste</h3>
                  <p className="text-green-700">Cut underperforming spend</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-green-700" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-green-800">Unlock Hidden Gems</h3>
                  <p className="text-green-700">Discover untapped potential</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={handleConnectGoogleAds}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg"
                  size="lg"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5 mr-2" />
                  )}
                  Connect Google Ads
                </Button>

                {/* <Button
                  onClick={() => navigate("/account")}
                  variant="outline"
                  className="border-green-500 text-green-700 hover:bg-green-50 px-8 py-4 text-lg"
                  size="lg"
                >
                  Go to Account Settings
                </Button> */}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Connected but No Account Selected */}
      {hasConnection && !selectedAccountId && (
        <section className="bg-blue-50 border-b border-blue-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                Connected Already!
              </h2>
              <p className="text-lg text-blue-800 mb-2">
                Select your Google Ads account from the dropdown menu in the navigation bar above
              </p>
              <p className="text-blue-700">
                Once selected, click on the "Generate Reports" button to fetch data from Google Ads and see results for the last 30, 60, and 90 days
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OptimizedStandaloneUnifiedReport
          selectedAccountId={selectedAccountId}
          selectedAccountName={selectedAccountName}
        />
      </main>

      {/* Category Definitions */}
      <section className="mt-16 bg-white rounded-lg shadow-sm border p-8">
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
            <Button
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50"
              onClick={() => navigate("/guides/profitable-products")}
            >
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
            <Button
              variant="outline"
              className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
              onClick={() => navigate("/guides/costly-products")}
            >
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
            <Button
              variant="outline"
              className="border-red-500 text-red-700 hover:bg-red-50"
              onClick={() => navigate("/guides/zero-conversion")}
            >
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
            <Button
              variant="outline"
              className="border-gray-500 text-gray-700 hover:bg-gray-50"
              onClick={() => navigate("/guides/zombie-products")}
            >
              Reactivation Guide
            </Button>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Disclaimer</h3>
            <div className="text-yellow-700 space-y-2">
              <p>
                <strong>Data Scope:</strong> This data calculation is specifically for shopping placements within your Shopping and Performance Max campaigns. If you are using Search Ads, Display Ads, or Video Ads, this data does not include segregation for those campaign types. The analysis exclusively focuses on data from shopping placements in Google Ads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-600 text-center md:text-left">
              <p>© 2024 Google Ads Insights</p>
              <p className="text-sm">
                Powered by{" "}
                <a
                  href="https://managingseo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  ManagingSEO
                </a>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                variant="link"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => window.open("/privacy", "_blank")}
              >
                Privacy Policy
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() =>
                  window.open("https://calendly.com/managingseo-hammad/client-management-and-meetings", "_blank")
                }
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Book a Consultation
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;