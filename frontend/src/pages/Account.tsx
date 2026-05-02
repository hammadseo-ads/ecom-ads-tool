// src/pages/Account.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import { useAppData } from "@/contexts/AppData";
import { ArrowLeft, User, Link, Unlink2, RefreshCw, CheckCircle, AlertCircle, Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Account = () => {
  const { user, loading: userLoading, refreshUser } = useUser();
  const { refreshConnectionStatus, refreshAccounts, clearCache } = useAppData();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasConnection, setHasConnection] = useState(false);
  const [isLoadingConnection, setIsLoadingConnection] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const getToken = () => localStorage.getItem("accessToken") || "";

  // Load user data into form
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.username.split(" ")[0] || "",
        lastName: user.username.split(" ").slice(1).join(" ") || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Check Google Ads connection status
  useEffect(() => {
    const checkConnection = async () => {
      if (!user?._id) return;

      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/google-ads/status`, {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        setHasConnection(data.hasConnection || false);
      } catch (err) {
        console.error("Failed to check connection", err);
        setHasConnection(false);
      } finally {
        setIsLoadingConnection(false);
      }
    };

    checkConnection();
  }, [user]);

  // Handle OAuth callback (success/error)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");

    if (success === "connected") {
      toast({
        title: "Connected!",
        description: "Google Ads linked successfully.",
      });
      setHasConnection(true);
    }

    if (error) {
      toast({
        title: "Connection Failed",
        description: `Error: ${error}`,
        variant: "destructive",
      });
    }

    if (success || error) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  // Handle form changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Profile update (dummy)
  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated.",
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Connect Google Ads
  const handleConnectGoogleAds = async () => {
  setIsConnecting(true);
  try {
    const res = await fetch(`${import.meta.env.VITE_API_GOOGLE_ADS_URL || "http://localhost:5000/api/google-ads"}/auth-url`, {
      method: "POST", // ← WAS GET → WRONG
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user?._id }), // ← SEND USER ID
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");

    window.location.href = data.authorizeUrl;
  } catch (err: any) {
    toast({
      title: "Connection Error",
      description: err.message || "Failed to connect Google Ads.",
      variant: "destructive",
    });
  } finally {
    setIsConnecting(false);
  }
};

  // Disconnect Google Ads
  const handleDisconnectGoogleAds = async () => {
    setIsDisconnecting(true);
    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/google-ads/disconnect`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to disconnect Google Ads");

      localStorage.removeItem("selectedAccountId");
      localStorage.removeItem("selectedAccountName");
      localStorage.removeItem("selectedTopLevelAccountId");
      localStorage.removeItem("selectedTopLevelAccountName");
      localStorage.removeItem("selectedClientAccountId");
      localStorage.removeItem("selectedClientAccountName");

      setHasConnection(false);

      toast({
        title: "Disconnected",
        description: "Google Ads account disconnected successfully.",
      });
      // Refresh global app state so dashboard updates immediately
      try {
        clearCache();
      } catch (e) {
        // ignore
      }
      try {
        await refreshConnectionStatus();
        await refreshAccounts();
      } catch (err) {
        console.warn("Failed to refresh app data after disconnect", err);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to disconnect",
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Delete all generated report data (keeps Google Ads connection intact)
  const handleDeleteAllData = async () => {
    if (!confirm("Delete all generated report data for every account? This cannot be undone. Your Google Ads connection will stay intact.")) {
      return;
    }
    setIsDeletingData(true);
    try {
      const token = getToken();
      const opts = {
        method: "DELETE",
        credentials: "include" as const,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      };
      // Wipe both product reports AND keyword reports for this user.
      const [prodRes, kwRes] = await Promise.all([
        fetch(`${API_URL}/on-demand-report/clear`, opts),
        fetch(`${API_URL}/keyword-report/clear`, opts),
      ]);
      if (!prodRes.ok && !kwRes.ok) throw new Error("Failed to delete data");
      const prod = prodRes.ok ? await prodRes.json() : { deleted: 0 };
      const kw = kwRes.ok ? await kwRes.json() : { deleted: 0 };
      try { clearCache(); } catch {}
      toast({
        title: "Deleted",
        description: `Removed ${prod.deleted ?? 0} product + ${kw.deleted ?? 0} keyword reports.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete data",
        variant: "destructive",
      });
    } finally {
      setIsDeletingData(false);
    }
  };

  // Redirect if not logged in
  if (!userLoading && !user?._id) {
    navigate("/login");
    return null;
  }

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-64 w-full max-w-2xl mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences.
          </p>
        </div>

        {/* PROFILE CARD */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input value={user.email} disabled className="bg-gray-50" />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <User className="w-4 h-4 mr-2" />}
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* GOOGLE ADS SECTION */}
        <Card className="mt-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                {hasConnection ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                )}
                Google Ads Connect Status
              </div>

              {isLoadingConnection ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    hasConnection
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {hasConnection ? "Connected" : "Not Connected"}
                </div>
              )}
            </CardTitle>

            <CardDescription>
              {hasConnection
                ? "Your Google Ads account is connected."
                : "Connect your Google Ads account to access data."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLoadingConnection ? (
              <div>
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                {hasConnection ? (
                  <>
                    <Button
                      onClick={handleDisconnectGoogleAds}
                      disabled={isDisconnecting}
                      variant="destructive"
                      className="w-full"
                    >
                      {isDisconnecting ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Unlink2 className="w-4 h-4 mr-2" />
                      )}
                      Disconnect Google Ads Account
                    </Button>
                    <p className="text-xs text-gray-500 -mt-2">
                      Disconnecting also removes all stored report data for your account.
                    </p>

                    <Button
                      onClick={handleDeleteAllData}
                      disabled={isDeletingData}
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    >
                      {isDeletingData ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete All Report Data
                    </Button>
                    <p className="text-xs text-gray-500 -mt-2">
                      Wipes generated reports for every account but keeps the Google Ads connection.
                    </p>
                  </>
                ) : (
                  <Button
                    onClick={handleConnectGoogleAds}
                    disabled={isConnecting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isConnecting ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Link className="w-4 h-4 mr-2" />
                    )}
                    Connect Google Ads Account
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
