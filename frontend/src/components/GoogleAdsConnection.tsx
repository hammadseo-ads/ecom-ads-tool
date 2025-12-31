import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser"; // Consistent auth hook
import {
  Plus,
  RefreshCw,
  ExternalLink,
  Unlink,
  AlertCircle,
} from "lucide-react";

import ProductPerformanceSection from "./ProductPerformanceSection";
import EnhancedAggregatedPerformanceOverview from "./EnhancedAggregatedPerformanceOverview";
import NewFeatureSection from "./NewFeatureSection";

/* ------------------- Types ------------------- */
interface GoogleAdsAccount {
  id: string;
  customer_id: string;
  account_name: string;
  is_manager_account: boolean;
  created_at: string;
  updated_at: string;
}
interface Campaign {
  campaign: {
    id: string;
    name: string;
    status: string;
    start_date?: string;
    end_date?: string;
    advertising_channel_type: string;
    serving_status: string;
  };
}
interface GoogleAdsConnectionProps {
  onAccountSelection?: (accountId: string, accountName: string) => void;
}

/* ------------------- Component ------------------- */
const GoogleAdsConnection: React.FC<GoogleAdsConnectionProps> = ({
  onAccountSelection,
}) => {
  const { user, userId } = useUser(); // MERN user: { userId, email, ... }
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
  const [clientAccounts, setClientAccounts] = useState<GoogleAdsAccount[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedAccountName, setSelectedAccountName] = useState<string>("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [hasConnection, setHasConnection] = useState(false);

  const initDone = useRef(false);

  /* ---------- API Helper ---------- */
  const api = async function <T>(endpoint: string, body?: any): Promise<T> {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No access token");

    const res = await fetch(`/api/google-ads${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "API error");
    return json;
  };

  /* ---------- Connection Status ---------- */
  const checkConnectionStatus = async () => {
    if (!userId) return;
    try {
      const { hasConnection } = await api<{ hasConnection: boolean }>("/check-connection", {
        user_id: userId,
      });
      setHasConnection(hasConnection);
    } catch (e) {
      console.error("Check connection failed:", e);
    }
  };

  const fetchConnections = async () => {
    if (!userId) return;
    try {
      const { connections, clientAccounts: clientList } = await api<{
        connections: GoogleAdsAccount[];
        clientAccounts: GoogleAdsAccount[];
      }>("/connections", { user_id: userId });

      setAccounts(connections);
      setClientAccounts(clientList);
      setHasConnection(connections.length > 0);

      // If no client accounts but manager accounts exist, auto-select first manager and fetch its children
      if ((clientList?.length || 0) === 0) {
        const managers = connections.filter(c => c.is_manager_account);
        if (managers.length > 0) {
          const firstManagerId = managers[0].customer_id;
          setSelectedManagerId(firstManagerId);
          await fetchConnectionsForManager(firstManagerId);
        }
      }

      if (
        selectedAccountId &&
        !clientList.find((a) => a.customer_id === selectedAccountId)
      ) {
        setSelectedAccountId("");
        setCampaigns([]);
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: "Failed to load Google Ads accounts",
        variant: "destructive",
      });
    }
  };

  const fetchConnectionsForManager = async (managerId: string) => {
    if (!userId) return;
    try {
      const { connections, clientAccounts: clientList } = await api<{
        connections: GoogleAdsAccount[];
        clientAccounts: GoogleAdsAccount[];
      }>("/connections", { user_id: userId, manager_id: managerId });

      setAccounts(connections);
      setClientAccounts(clientList);
      setHasConnection(connections.length > 0);
      // reset campaigns and auto-select a child client if present so campaigns/reports display
      setCampaigns([]);
      if (clientList && clientList.length > 0) {
        const firstClientId = clientList[0].customer_id;
        setSelectedAccountId(firstClientId);
        const acc = clientList.find(a => a.customer_id === firstClientId);
        const name = acc?.account_name ?? "";
        setSelectedAccountName(name);
        onAccountSelection?.(firstClientId, name);
        // fetch campaigns for the first child account so reports are populated
        await fetchCampaigns(firstClientId);
      } else {
        // no clients available for this manager
        setSelectedAccountId("");
        setSelectedAccountName("");
      }
    } catch (e: any) {
      toast({ title: "Error", description: "Failed to load accounts for manager", variant: "destructive" });
    }
  };

  /* ---------- OAuth Flow ---------- */
  const handleConnectGoogleAds = async () => {
    console.log("User:", user);
    console.log("UserId:", userId);
    console.log("IsAuthenticated:", !!userId);
    if (!userId) {
      console.error("User not authenticated - showing login error");
      toast({ title: "Error", description: "Please log in to connect Google Ads", variant: "destructive" });
      return;
    }
    setIsConnecting(true);
    try {
      const { authorizeUrl } = await api<{ authorizeUrl: string }>("/auth-url", {
        user_id: userId,
      });
      window.location.href = authorizeUrl;
    } catch (e: any) {
      toast({
        title: "Connection Failed",
        description: e.message || "Could not start Google Ads login",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogleAds = async () => {
    if (!userId) return;
    setIsDisconnecting(true);
    try {
      await api("/disconnect", { user_id: userId });
      setAccounts([]);
      setClientAccounts([]);
      setSelectedAccountId("");
      setCampaigns([]);
      setHasConnection(false);
      setSelectedAccountName("");
      toast({ title: "Success", description: "Google Ads disconnected" });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to disconnect",
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  /* ---------- Campaigns ---------- */
  const fetchCampaigns = async (customerId: string) => {
    if (!userId) return;
    setIsLoading(true);
    setCampaigns([]);
    try {
      const { campaigns: list, accountName } = await api<{
        campaigns: Campaign[];
        accountName: string;
      }>("/campaigns", {
        user_id: userId,
        customer_id: customerId,
      });

      setCampaigns(list);
      setSelectedAccountName(accountName);
      toast({
        title: "Success",
        description: `Found ${list.length} campaigns`,
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to load campaigns",
        variant: "destructive",
      });
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountChange = (customerId: string) => {
    setSelectedAccountId(customerId);
    const acc = clientAccounts.find((a) => a.customer_id === customerId);
    const name = acc?.account_name ?? "";
    setSelectedAccountName(name);
    onAccountSelection?.(customerId, name);

    if (customerId) fetchCampaigns(customerId);
    else {
      setCampaigns([]);
      onAccountSelection?.("", "");
    }
  };

  /* ---------- OAuth Callback Handler ---------- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");

    if (success === "connected") {
      toast({ title: "Connected!", description: "Google Ads linked successfully" });
      fetchConnections();
      checkConnectionStatus();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      toast({
        title: "Connection Failed",
        description: `Error: ${error}`,
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  /* ---------- Initial Load ---------- */
  useEffect(() => {
    if (userId && !initDone.current) {
      initDone.current = true;
      fetchConnections();
      checkConnectionStatus();
    }
  }, [userId]);

  /* ---------- Badge Helpers ---------- */
  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      ENABLED: "bg-green-100 text-green-800",
      PAUSED: "bg-yellow-100 text-yellow-800",
      REMOVED: "bg-red-100 text-red-800",
    };
    return <Badge className={map[s] ?? "bg-gray-100 text-gray-800"}>{s}</Badge>;
  };

  const servingBadge = (s: string) => {
    const map: Record<string, string> = {
      SERVING: "bg-green-100 text-green-800",
      ENDED: "bg-gray-100 text-gray-800",
      PENDING: "bg-blue-100 text-blue-800",
      SUSPENDED: "bg-red-100 text-red-800",
    };
    return <Badge className={map[s] ?? "bg-gray-100 text-gray-800"}>{s}</Badge>;
  };

  /* ------------------- UI ------------------- */
  return (
    <div className="space-y-8">
      {/* ==== CONNECTION CARD ==== */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="w-5 h-5 text-blue-600" />
                <span>Google Ads Connections</span>
              </CardTitle>
              <CardDescription>
                Connect and manage your Google Ads accounts
              </CardDescription>
            </div>

            {!hasConnection ? (
              <Button
                onClick={handleConnectGoogleAds}
                disabled={isConnecting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isConnecting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Connect Google Ads
              </Button>
            ) : (
              <Button
                onClick={handleDisconnectGoogleAds}
                disabled={isDisconnecting}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                {isDisconnecting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Unlink className="w-4 h-4 mr-2" />
                )}
                Disconnect
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {clientAccounts.length === 0 && accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ExternalLink className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No Google Ads accounts connected yet.</p>
              <p className="text-sm">Click “Connect Google Ads” to start.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.length > 0 && clientAccounts.length === 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Only manager accounts found. You need client account access.
                    </p>
                  </div>
                </div>
              )}

              {/* Manager select: show if there are manager accounts present */}
              {accounts.filter(a => a.is_manager_account).length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Select Manager Account:</label>
                  <Select value={selectedManagerId} onValueChange={(v) => {
                    setSelectedManagerId(v);
                    fetchConnectionsForManager(v);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter(a => a.is_manager_account).map(m => (
                        <SelectItem key={m.id} value={m.customer_id}>
                          <div className="flex items-center space-x-2">
                            <span>{m.account_name}</span>
                            <Badge variant="outline">{m.customer_id}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {clientAccounts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Client Account:
                  </label>
                  <Select value={selectedAccountId} onValueChange={handleAccountChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose account" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientAccounts.map((a) => (
                        <SelectItem key={a.id} value={a.customer_id}>
                          <div className="flex items-center space-x-2">
                            <span>{a.account_name}</span>
                            <Badge variant="outline">{a.customer_id}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==== NEW FEATURE SECTION ==== */}
      {selectedAccountId && (
        <NewFeatureSection
          selectedAccountId={selectedAccountId}
          selectedAccountName={selectedAccountName}
        />
      )}

      {/* ==== CAMPAIGNS CARD ==== */}
      {selectedAccountId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Campaigns – {selectedAccountName}</span>
              {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
            </CardTitle>
            <CardDescription>
              Account ID: {selectedAccountId}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-5 h-5 animate-spin inline mr-2" />
                Loading campaigns…
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium">No campaigns found.</p>
                <p className="text-sm mt-1">
                  This account may have no active campaigns.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Found {campaigns.length} campaigns
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Serving</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((c, i) => {
                        const camp = c.campaign;
                        if (!camp) return null;
                        return (
                          <TableRow key={camp.id ?? i}>
                            <TableCell className="font-medium text-blue-600">
                              {camp.name || "Unnamed"}
                            </TableCell>
                            <TableCell>{statusBadge(camp.status)}</TableCell>
                            <TableCell>{servingBadge(camp.serving_status)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {camp.advertising_channel_type?.replace(/_/g, " ") || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell>{camp.start_date || "N/A"}</TableCell>
                            <TableCell>{camp.end_date || "N/A"}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ==== PRODUCT PERFORMANCE ==== */}
      {selectedAccountId && (
        <ProductPerformanceSection
          selectedAccountId={selectedAccountId}
          selectedAccountName={selectedAccountName}
        />
      )}

      {/* ==== ENHANCED AGGREGATED OVERVIEW ==== */}
      {selectedAccountId && (
        <EnhancedAggregatedPerformanceOverview
          selectedAccountId={selectedAccountId}
          selectedAccountName={selectedAccountName}
          campaigns={campaigns}
        />
      )}
    </div>
  );
};

export default GoogleAdsConnection;