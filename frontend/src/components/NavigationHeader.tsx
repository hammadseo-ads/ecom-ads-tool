// NavigationHeader.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cleanupAuthState } from "@/lib/utils";
import {
  ExternalLink,
  AlertCircle,
  LogOut,
  User,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface GoogleAdsAccount {
  id: string;
  customer_id: string;
  account_name: string;
  is_manager_account: boolean;
  created_at: string;
  updated_at: string;
}

interface AccountHierarchy {
  [managerCustomerId: string]: string[];
}

interface NavigationHeaderProps {
  onAccountSelection: (accountId: string, accountName: string) => void;
  selectedAccountId: string;
  selectedAccountName: string;
}

// VITE_API_URL is the API root (includes /api), e.g. "/api" or "http://localhost:5000/api"
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // send cookies
});

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  onAccountSelection,
  selectedAccountId,
  selectedAccountName,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [allAccounts, setAllAccounts] = useState<GoogleAdsAccount[]>([]);
  const [managerAccounts, setManagerAccounts] = useState<GoogleAdsAccount[]>(
    []
  );
  const [clientAccounts, setClientAccounts] = useState<GoogleAdsAccount[]>([]);
  const [hierarchy, setHierarchy] = useState<AccountHierarchy>({});
  const [hasConnection, setHasConnection] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // New state for MCC flow
  const [selectedTopLevelAccount, setSelectedTopLevelAccount] = useState<string>(
    localStorage.getItem("selectedTopLevelAccountId") || ""
  );
  const [selectedTopLevelAccountName, setSelectedTopLevelAccountName] =
    useState<string>(localStorage.getItem("selectedTopLevelAccountName") || "");
  const [isTopLevelManager, setIsTopLevelManager] = useState(false);
  const [availableClientAccounts, setAvailableClientAccounts] = useState<
    GoogleAdsAccount[]
  >([]);
  const { toast } = useToast();

  // Check connection status (uses cookies or Authorization header)
  const checkConnectionStatus = async () => {
    try {
      const res = await api.get("/google-ads/status", {
        headers: getAuthHeader(),
      });
      setHasConnection(res.data?.hasConnection || false);
    } catch (err:any) {
      console.warn("checkConnectionStatus error", err?.response?.data || err);
      setHasConnection(false);
    }
  };

  // Fetch connections (accounts + managers/clients/hierarchy)
  const fetchConnections = async () => {
    try {
      const res = await api.post(
        "/google-ads/connections",
        {}, // body empty, server should use req.user from protect
        { headers: getAuthHeader() }
      );

      const data = res.data || {};
      const connections: GoogleAdsAccount[] = data.connections || [];
      const managers: GoogleAdsAccount[] = data.managerAccounts || [];
      const clients: GoogleAdsAccount[] = data.clientAccounts || [];
      const hierarchyData: AccountHierarchy = data.hierarchy || {};

      setAllAccounts(connections);
      setManagerAccounts(managers);
      setClientAccounts(clients);
      setHierarchy(hierarchyData);
      setHasConnection(connections.length > 0);

      // If previously selected top-level is no longer present, clear saved selections
      const savedTop = localStorage.getItem("selectedTopLevelAccountId");
      if (savedTop && !connections.find((acc) => acc.customer_id === savedTop)) {
        onAccountSelection("", "");
        setSelectedTopLevelAccount("");
        setSelectedTopLevelAccountName("");
        localStorage.removeItem("selectedTopLevelAccountId");
        localStorage.removeItem("selectedTopLevelAccountName");
        localStorage.removeItem("selectedClientAccountId");
        localStorage.removeItem("selectedClientAccountName");
      }
    } catch (err: any) {
      console.error("Error fetching connections", err?.response?.data || err);
      toast({
        title: "Error",
        description: "Failed to fetch Google Ads connections",
        variant: "destructive",
      });
    }
  };

  // Watch for top-level selection changes to populate client list if MCC
  useEffect(() => {
    console.log("Top-level changed", selectedTopLevelAccount);
    if (!selectedTopLevelAccount) {
      setAvailableClientAccounts([]);
      setIsTopLevelManager(false);
      onAccountSelection("", "");
      return;
    }

    const top = allAccounts.find(
      (acc) => acc.customer_id === selectedTopLevelAccount
    );
    if (!top) {
      setAvailableClientAccounts([]);
      setIsTopLevelManager(false);
      onAccountSelection("", "");
      return;
    }

    if (top.is_manager_account) {
      // find children from hierarchy
      const childIds = hierarchy[selectedTopLevelAccount] || [];
      const childAccounts = allAccounts.filter(
        (acc) => childIds.includes(acc.customer_id) && !acc.is_manager_account
      );
      setAvailableClientAccounts(childAccounts);
      setIsTopLevelManager(true);

      // Restore saved client selection if present and valid
      const savedClientId = localStorage.getItem("selectedClientAccountId");
      if (savedClientId && childIds.includes(savedClientId)) {
        const savedClient = childAccounts.find(
          (acc) => acc.customer_id === savedClientId
        );
        if (savedClient) {
          onAccountSelection(savedClient.customer_id, savedClient.account_name);
        }
      } else if (
        selectedAccountId &&
        !childIds.includes(selectedAccountId)
      ) {
        onAccountSelection("", "");
      }
    } else {
      // selectedTopLevelAccount is a client account itself
      setAvailableClientAccounts([]);
      setIsTopLevelManager(false);
      onAccountSelection(top.customer_id, top.account_name);
      // Save final selection
      localStorage.setItem("selectedClientAccountId", top.customer_id);
      localStorage.setItem("selectedClientAccountName", top.account_name);
    }
  }, [selectedTopLevelAccount, allAccounts, hierarchy]);

  // load initial status + connections
  useEffect(() => {
    (async () => {
      await checkConnectionStatus();
      if (hasConnection === true) {
        await fetchConnections();
      } else {
        // Attempt to fetch connections anyway; backend should respond appropriately
        await fetchConnections();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist top-level selection
  const handleTopLevelAccountChange = (customerId: string) => {
    const account = allAccounts.find((a) => a.customer_id === customerId);
    if (account) {
      setSelectedTopLevelAccount(customerId);
      setSelectedTopLevelAccountName(account.account_name);
      localStorage.setItem("selectedTopLevelAccountId", customerId);
      localStorage.setItem("selectedTopLevelAccountName", account.account_name);
      localStorage.removeItem("selectedClientAccountId");
      localStorage.removeItem("selectedClientAccountName");
    } else {
      setSelectedTopLevelAccount("");
      setSelectedTopLevelAccountName("");
      localStorage.removeItem("selectedTopLevelAccountId");
      localStorage.removeItem("selectedTopLevelAccountName");
      localStorage.removeItem("selectedClientAccountId");
      localStorage.removeItem("selectedClientAccountName");
      onAccountSelection("", "");
    }
    setIsMobileMenuOpen(false);
  };

  const handleClientAccountChange = (customerId: string) => {
    if (!customerId) {
      onAccountSelection("", "");
      localStorage.removeItem("selectedClientAccountId");
      localStorage.removeItem("selectedClientAccountName");
      setIsMobileMenuOpen(false);
      return;
    }
    const selectedClient = availableClientAccounts.find(
      (acc) => acc.customer_id === customerId
    );
    if (selectedClient) {
      onAccountSelection(selectedClient.customer_id, selectedClient.account_name);
      localStorage.setItem("selectedClientAccountId", selectedClient.customer_id);
      localStorage.setItem(
        "selectedClientAccountName",
        selectedClient.account_name
      );
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    // Clear local selections
    localStorage.removeItem("selectedTopLevelAccountId");
    localStorage.removeItem("selectedTopLevelAccountName");
    localStorage.removeItem("selectedClientAccountId");
    localStorage.removeItem("selectedClientAccountName");
    localStorage.removeItem("accessToken"); // if stored

    cleanupAuthState();

    // Tell backend to clear tokens / revoke refresh token
    try {
      await api.post("/auth/logout", {}, { headers: getAuthHeader() });
    } catch (err) {
      console.warn("Logout API error", err);
    }

    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });

    navigate("/");
  };

  const handleAccountPage = () => {
    navigate("/account");
    setIsMobileMenuOpen(false);
  };

  const handleConsultation = () => {
    window.open(
      "https://calendly.com/managingseo-hammad/client-management-and-meetings",
      "_blank"
    );
    setIsMobileMenuOpen(false);
  };

  // Desktop / Mobile UI (kept very close to your original)
  if (isMobile) {
    return (
      <header className="bg-white shadow-sm border-b relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div className="flex items-center">
              <img
                src="/lovable-uploads/ads-analysis-by-managingseo.png"
                alt="Ads Analysis by ManagingSEO"
                className="h-12 w-auto"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {hasConnection && (
            <div className="py-3">
              <div className="space-y-3">
                {allAccounts.length > 0 && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        Google Ads Account
                      </label>
                      <Select
                        value={selectedTopLevelAccount || ""}
                        onValueChange={handleTopLevelAccountChange}
                      >
                        <SelectTrigger className="w-full h-12 text-left">
                          <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent className="z-[100] bg-white border shadow-lg">
                          {allAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.customer_id} className="py-3">
                              <div className="flex flex-col space-y-1 w-full">
                                <span className="font-medium text-sm">{account.account_name}</span>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {account.customer_id}
                                  </Badge>
                                  {account.is_manager_account && (
                                    <Badge variant="secondary" className="text-xs">
                                      MCC
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {isTopLevelManager && availableClientAccounts.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                          Client Account
                        </label>
                        <Select value={selectedAccountId || ""} onValueChange={handleClientAccountChange}>
                          <SelectTrigger className="w-full h-12 text-left">
                            <SelectValue placeholder="Select Client" />
                          </SelectTrigger>
                          <SelectContent className="z-[100] bg-white border shadow-lg">
                            {availableClientAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.customer_id} className="py-3">
                                <div className="flex flex-col space-y-1 w-full">
                                  <span className="font-medium text-sm">{account.account_name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {account.customer_id}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}

                {isTopLevelManager && availableClientAccounts.length === 0 && (
                  <div className="flex items-center space-x-2 text-yellow-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>No client accounts found for this MCC</span>
                  </div>
                )}

                {allAccounts.length > 0 && clientAccounts.length === 0 && !isTopLevelManager && (
                  <div className="flex items-center space-x-2 text-yellow-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Manager accounts only</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[200] bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Menu</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white justify-start h-12" onClick={handleConsultation}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Book Consultation
                  </Button>

                  <Button variant="outline" onClick={handleAccountPage} className="w-full justify-start h-12">
                    <User className="w-4 h-4 mr-2" />
                    Account Settings
                  </Button>
                  <Button variant="outline" onClick={handleLogout} className="w-full justify-start h-12">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  // Desktop layout
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <img
              src="/lovable-uploads/ads-analysis-by-managingseo.png"
              alt="Ads Analysis by ManagingSEO"
              className="h-20 w-auto"
            />
          </div>

          <div className="flex items-center space-x-4 flex-1 justify-center">
            {hasConnection && (
              <div className="flex items-center space-x-3">
                {allAccounts.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <ExternalLink className="w-4 h-4 text-green-600 hidden sm:block" />

                    <Select value={selectedTopLevelAccount || ""} onValueChange={handleTopLevelAccountChange}>
                      <SelectTrigger className="w-48 sm:w-64">
                        <SelectValue placeholder="Select Google Ads Account" />
                      </SelectTrigger>
                      <SelectContent>
                        {allAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.customer_id}>
                            <div className="flex items-center space-x-2">
                              <span className="truncate">{account.account_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {account.customer_id}
                              </Badge>
                              {account.is_manager_account && (
                                <Badge variant="secondary" className="text-xs">
                                  MCC
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {isTopLevelManager && availableClientAccounts.length > 0 && (
                      <>
                        <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                        <Select value={selectedAccountId || ""} onValueChange={handleClientAccountChange}>
                          <SelectTrigger className="w-48 sm:w-64">
                            <SelectValue placeholder="Select Client Account" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableClientAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.customer_id}>
                                <div className="flex items-center space-x-2">
                                  <span className="truncate">{account.account_name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {account.customer_id}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </div>
                )}

                {isTopLevelManager && availableClientAccounts.length === 0 && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">No client accounts found for this MCC</span>
                  </div>
                )}

                {allAccounts.length > 0 && clientAccounts.length === 0 && !isTopLevelManager && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Manager accounts only</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button className="bg-green-600 hover:bg-green-700 text-white hidden sm:flex" onClick={handleConsultation} size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Book Consultation
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white flex sm:hidden" onClick={handleConsultation} size="sm">
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleAccountPage} size="sm">
              <User className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;
