// Shared scaffolding for every dashboard page (/dashboard, /dashboard/products,
// /dashboard/keywords). Owns: nav header, OAuth callback handling, connection
// state, account selection.
import { useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import { useAppData } from "@/contexts/AppData";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Zap,
  Target,
  Plus,
  RefreshCw,
} from "lucide-react";
import OptimizedNavigationHeader from "./OptimizedNavigationHeader";
import { WelcomeMessage } from "./ui/WelcomeMessage";

interface DashboardShellProps {
  // (selectedAccountId, selectedAccountName), render-prop so children get the
  // current selection without each page maintaining its own state.
  children: (ctx: { selectedAccountId: string; selectedAccountName: string }) => ReactNode;
  // Hide the "select an account" prompt on pages that don't need an account
  // (e.g., the tool picker can show its empty-state instead).
  requireAccount?: boolean;
}

const DashboardShell = ({ children, requireAccount = true }: DashboardShellProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const {
    hasConnection,
    isNewUser,
    allAccounts,
    hierarchy,
    refreshConnectionStatus,
    refreshAccounts,
  } = useAppData();

  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedAccountName, setSelectedAccountName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Restore last-selected account from localStorage
  useEffect(() => {
    const id = localStorage.getItem("selectedAccountId");
    const name = localStorage.getItem("selectedAccountName");
    if (id && name) {
      setSelectedAccountId(id);
      setSelectedAccountName(name);
    }
  }, []);

  // First-time welcome
  useEffect(() => {
    if (user && isNewUser && !localStorage.getItem("welcome_shown")) {
      setShowWelcome(true);
    }
  }, [user, isNewUser]);

  // Handle OAuth callback (?success=connected or ?error=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");

    if (success === "connected") {
      toast({
        title: "Google Ads Connected!",
        description: "Loading your accounts...",
      });
      window.history.replaceState({}, "", window.location.pathname);
      refreshConnectionStatus();
      refreshAccounts();
    } else if (error) {
      const labels: Record<string, [string, string]> = {
        callback_failed: ["OAuth Connection Failed", "The Google Ads connection process encountered an error. Please try again."],
        oauth_error: ["OAuth Error", "There was an issue with the OAuth authorization. Please check your permissions."],
        missing_code: ["Authorization Incomplete", "The authorization process was incomplete. Please try again."],
        invalid_grant: ["Invalid Authorization", "The authorization code has expired. Please reconnect."],
        access_denied: ["Access Denied", "Access to Google Ads was denied. Please ensure you have permissions."],
        timeout: ["Connection Timeout", "Check your internet connection and try again."],
      };
      const [title, description] = labels[error] || ["Connection Failed", `Connection error: ${error}`];
      toast({ title, description, variant: "destructive" });
      window.history.replaceState({}, "", window.location.pathname);
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
      const res = await fetch(
        `${import.meta.env.VITE_API_GOOGLE_ADS_URL || "http://localhost:5000/api/google-ads"}/auth-url`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user._id }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      window.location.href = data.authorizeUrl;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
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
      {showWelcome && <WelcomeMessage onShown={handleWelcomeShown} />}

      <OptimizedNavigationHeader
        onAccountSelection={handleAccountSelection}
        selectedAccountId={selectedAccountId}
        selectedAccountName={selectedAccountName}
        allAccounts={allAccounts}
        hierarchy={hierarchy}
        hasConnection={hasConnection}
      />

      {!hasConnection && (
        <section className="bg-gradient-to-r from-green-25 to-green-50 text-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Connect Your Google Ads Account
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto text-gray-700">
                Get started by connecting your Google Ads account to unlock powerful insights.
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
            </div>
          </div>
        </section>
      )}

      {hasConnection && requireAccount && !selectedAccountId && (
        <section className="bg-emerald-50 border-b border-emerald-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">Connected Already!</h2>
              <p className="text-lg text-emerald-800 mb-2">
                Select your Google Ads account from the dropdown above to continue.
              </p>
              <Button onClick={() => navigate("/dashboard")} variant="outline" className="mt-4">
                Back to tools
              </Button>
            </div>
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children({ selectedAccountId, selectedAccountName })}
      </main>
    </div>
  );
};

export default DashboardShell;
