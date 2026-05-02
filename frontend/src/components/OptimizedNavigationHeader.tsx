// src/components/OptimizedNavigationHeader.tsx ← FINAL & WORKING 100%
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser"; // ← YOUR MERN JWT AUTH
import { ExternalLink, LogOut, User, ChevronRight, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile, useIsTabletOrMobile } from "@/hooks/use-mobile";
import { AccountSelectionSkeleton } from "@/components/ui/loading-skeleton";

interface GoogleAdsAccount {
  id: string;
  customer_id: string;
  account_name: string;
  is_manager_account: boolean;
}

interface NavigationHeaderProps {
  onAccountSelection: (accountId: string, accountName: string) => void;
  selectedAccountId: string;
  selectedAccountName: string;
  allAccounts: GoogleAdsAccount[];
  hierarchy: Record<string, string[]>;
  isLoadingAccounts?: boolean;
  hasConnection: boolean;
}

const OptimizedNavigationHeader: React.FC<NavigationHeaderProps> = ({
  onAccountSelection,
  selectedAccountId,
  selectedAccountName,
  allAccounts,
  hierarchy,
  isLoadingAccounts = false,
  hasConnection,
}) => {
  const { user } = useUser(); // ← YOUR REAL MERN USER
  const navigate = useNavigate();
  const isTabletOrMobile = useIsTabletOrMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const [selectedTopLevelAccount, setSelectedTopLevelAccount] = useState<string>('');
  const [selectedTopLevelAccountName, setSelectedTopLevelAccountName] = useState<string>('');
  const [isTopLevelManager, setIsTopLevelManager] = useState(false);
  const [availableClientAccounts, setAvailableClientAccounts] = useState<GoogleAdsAccount[]>([]);

  // Load saved top-level account
  useEffect(() => {
    const savedId = localStorage.getItem('selectedTopLevelAccountId');
    const savedName = localStorage.getItem('selectedTopLevelAccountName');
    if (savedId && savedName) {
      setSelectedTopLevelAccount(savedId);
      setSelectedTopLevelAccountName(savedName);
    }
  }, []);

  // Update client accounts when top-level changes
  useEffect(() => {
    if (!selectedTopLevelAccount || allAccounts.length === 0) {
      setAvailableClientAccounts([]);
      setIsTopLevelManager(false);
      return;
    }

    const topLevelAcc = allAccounts.find(a => a.customer_id === selectedTopLevelAccount);
    if (!topLevelAcc) return;

    if (topLevelAcc.is_manager_account) {
      const childIds = hierarchy[selectedTopLevelAccount] || [];
      const clients = allAccounts.filter(acc =>
        childIds.includes(acc.customer_id) && !acc.is_manager_account
      );

      setAvailableClientAccounts(clients);
      setIsTopLevelManager(true);

      // Restore saved client selection
      const savedClientId = localStorage.getItem('selectedClientAccountId');
      if (savedClientId && childIds.includes(savedClientId)) {
        const client = clients.find(c => c.customer_id === savedClientId);
        if (client) onAccountSelection(client.customer_id, client.account_name);
      } else if (selectedAccountId && !childIds.includes(selectedAccountId)) {
        onAccountSelection('', '');
      }
    } else {
      setAvailableClientAccounts([]);
      setIsTopLevelManager(false);
      onAccountSelection(topLevelAcc.customer_id, topLevelAcc.account_name);
    }
  }, [selectedTopLevelAccount, allAccounts, hierarchy, selectedAccountId, onAccountSelection]);

  const handleTopLevelAccountChange = (customerId: string) => {
    const account = allAccounts.find(a => a.customer_id === customerId);
    if (!account) return;

    setSelectedTopLevelAccount(customerId);
    setSelectedTopLevelAccountName(account.account_name);
    localStorage.setItem('selectedTopLevelAccountId', customerId);
    localStorage.setItem('selectedTopLevelAccountName', account.account_name);
    localStorage.removeItem('selectedClientAccountId');
    localStorage.removeItem('selectedClientAccountName');

    if (!account.is_manager_account) {
      onAccountSelection(customerId, account.account_name);
    } else {
      onAccountSelection('', '');
    }

    setIsMobileMenuOpen(false);
  };

  const handleClientAccountChange = (customerId: string) => {
    if (!customerId) {
      onAccountSelection('', '');
      localStorage.removeItem('selectedClientAccountId');
      localStorage.removeItem('selectedClientAccountName');
      return;
    }

    const client = availableClientAccounts.find(a => a.customer_id === customerId);
    if (client) {
      onAccountSelection(client.customer_id, client.account_name);
      localStorage.setItem('selectedClientAccountId', client.customer_id);
      localStorage.setItem('selectedClientAccountName', client.account_name);
    }

    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_AUTH_URL || "http://localhost:5000/api/auth"}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    }

    localStorage.clear();
    toast({ title: "Logged out", description: "See you soon!" });
    navigate("/");
  };

  const goToAccount = () => {
    navigate("/account");
    setIsMobileMenuOpen(false);
  };

  const openConsultation = () => {
    window.open('https://calendly.com/managingseo-hammad/client-management-and-meetings', '_blank');
    setIsMobileMenuOpen(false);
  };

  // Mobile
  if (isTabletOrMobile) {
    return (
      <header className="bg-white shadow-sm border-b relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <img src="/lovable-uploads/051b9e52-0e07-481f-80e2-9769a32180b0.png" alt="Logo" className="h-12 w-auto" />
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {hasConnection && (
            <div className="py-3">
              {isLoadingAccounts ? <AccountSelectionSkeleton /> : (
                <>
                  <Select value={selectedTopLevelAccount} onValueChange={handleTopLevelAccountChange}>
                    <SelectTrigger className="w-full h-12 mt-1">
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {allAccounts.map(acc => (
                        <SelectItem key={acc.customer_id} value={acc.customer_id}>
                          <div className="space-y-1">
                            <div className="font-medium">{acc.account_name}</div>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">{acc.customer_id}</Badge>
                              {acc.is_manager_account && <Badge variant="secondary" className="text-xs">MCC</Badge>}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {isTopLevelManager && availableClientAccounts.length > 0 && (
                    <Select value={selectedAccountId} onValueChange={handleClientAccountChange} className="mt-3">
                      <SelectTrigger className="w-full h-12 mt-1">
                        <SelectValue placeholder="Select Client" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClientAccounts.map(client => (
                          <SelectItem key={client.customer_id} value={client.customer_id}>
                            <div className="space-y-1">
                              <div className="font-medium">{client.account_name}</div>
                              <Badge variant="outline" className="text-xs">{client.customer_id}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {isMobileMenuOpen && user && (
          <div className="absolute top-full left-0 right-0 bg-white border-t shadow-lg z-50">
            <div className="px-4 py-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={openConsultation}>
                <ExternalLink className="w-4 h-4 mr-2" /> Book Consultation
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={goToAccount}>
                <User className="w-4 h-4 mr-2" /> Account Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>
        )}
      </header>
    );
  }

  // Desktop
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <img src="/lovable-uploads/051b9e52-0e07-481f-80e2-9769a32180b0.png" alt="Logo" className="h-12 w-auto" />

          {hasConnection && (
            <div className="flex-1 max-w-2xl mx-8">
              {isLoadingAccounts ? <AccountSelectionSkeleton /> : (
                <div className="flex items-center gap-6">
                  <Select value={selectedTopLevelAccount} onValueChange={handleTopLevelAccountChange}>
                    <SelectTrigger className="w-80">
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {allAccounts.map(acc => (
                        <SelectItem key={acc.customer_id} value={acc.customer_id}>
                          <div className="flex justify-between pr-2">
                            <span className="font-medium">{acc.account_name}</span>
                            <div className="flex gap-2">
                              <Badge variant="outline">{acc.customer_id}</Badge>
                              {acc.is_manager_account && <Badge variant="secondary">MCC</Badge>}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {isTopLevelManager && availableClientAccounts.length > 0 && (
                    <>
                      <ChevronRight className="text-gray-400" />
                      <Select value={selectedAccountId} onValueChange={handleClientAccountChange}>
                        <SelectTrigger className="w-80">
                          <SelectValue placeholder="Select Client" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableClientAccounts.map(client => (
                            <SelectItem key={client.customer_id} value={client.customer_id}>
                              {client.account_name} <Badge variant="outline">{client.customer_id}</Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={openConsultation}>
              <ExternalLink className="w-4 h-4 mr-2" /> Book Consultation
            </Button>

            {user ? (
              <>
                <Button variant="ghost" size="icon" onClick={goToAccount}>
                  <User className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="w-5 h-5 text-red-600" />
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/login")}>Sign In</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default OptimizedNavigationHeader;