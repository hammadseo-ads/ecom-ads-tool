// src/contexts/AppDataContext.tsx ← FINAL 100% WORKING
import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

interface GoogleAdsAccount {
  id: string;
  customer_id: string;
  account_name: string;
  is_manager_account: boolean;
}

interface AccountHierarchy {
  [managerCustomerId: string]: string[];
}

interface CachedData {
  data: unknown;
  timestamp: number;
  expiresIn: number;
}

interface AppDataContextType {
  user: any;
  supabaseUuid: string | null;
  emailVerified: boolean;
  isNewUser: boolean;

  hasConnection: boolean;
  allAccounts: GoogleAdsAccount[];
  managerAccounts: GoogleAdsAccount[];
  clientAccounts: GoogleAdsAccount[];
  hierarchy: AccountHierarchy;

  isLoadingConnection: boolean;
  isLoadingAccounts: boolean;

  refreshConnectionStatus: () => Promise<void>;
  refreshAccounts: (opts?: { force?: boolean }) => Promise<void>;
  clearCache: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const CACHE_KEYS = {
  CONNECTION_STATUS: "googleAds_connection_status",
  ACCOUNTS_DATA: "googleAds_accounts_data",
};

const CACHE_DURATION = {
  CONNECTION_STATUS: 5 * 60 * 1000,
  ACCOUNTS_DATA: 10 * 60 * 1000,
};

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading, userId } = useUser();

  // Debug: trace auth/userId changes
  React.useEffect(() => {
    console.debug('[AppDataContext] auth state change', { authLoading, userId, user });
  }, [authLoading, userId, user]);
  const { toast } = useToast();

  const [supabaseUuid, setSupabaseUuid] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const [hasConnection, setHasConnection] = useState(false);
  const [allAccounts, setAllAccounts] = useState<GoogleAdsAccount[]>([]);
  const [managerAccounts, setManagerAccounts] = useState<GoogleAdsAccount[]>([]);
  const [clientAccounts, setClientAccounts] = useState<GoogleAdsAccount[]>([]);
  const [hierarchy, setHierarchy] = useState<AccountHierarchy>({});

  const [isLoadingConnection, setIsLoadingConnection] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const initDone = useRef(false);

  const setCache = (key: string, data: unknown, expiresIn: number) => {
    const cached: CachedData = { data, timestamp: Date.now(), expiresIn };
    localStorage.setItem(key, JSON.stringify(cached));
  };

  const getCache = (key: string): unknown | null => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      const parsed: CachedData = JSON.parse(cached);
      if (Date.now() - parsed.timestamp > parsed.expiresIn) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  };

  const clearCache = useCallback(() => {
    Object.values(CACHE_KEYS).forEach((key) => localStorage.removeItem(key));
  }, []);

  useEffect(() => {
    const cachedConnection = getCache(CACHE_KEYS.CONNECTION_STATUS);
    if (cachedConnection !== null && typeof cachedConnection === "boolean") {
      setHasConnection(cachedConnection);
    }

    const cachedAccounts = getCache(CACHE_KEYS.ACCOUNTS_DATA);
    if (cachedAccounts && typeof cachedAccounts === "object") {
      const data = cachedAccounts as any;
      setAllAccounts(data.connections || []);
      setClientAccounts(data.clientAccounts || []);
      setHierarchy(data.hierarchy || {});
    }

    setIsInitialized(true);
  }, []);

  const api = async <T,>(endpoint: string, body: Record<string, unknown> = {}): Promise<T> => {
    const res = await fetch(`/api/google-ads${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error ${res.status}: ${errorText}`);
    }
    return res.json();
  };

  const refreshConnectionStatus = useCallback(async () => {
    if (authLoading || !userId) return;
    console.debug('[AppDataContext] refreshConnectionStatus start', { userId });
    setIsLoadingConnection(true);
    try {
      const data = await api<{ hasConnection: boolean }>("/connections");
      console.debug('[AppDataContext] refreshConnectionStatus response', data);
      setHasConnection(data.hasConnection);
      setCache(CACHE_KEYS.CONNECTION_STATUS, data.hasConnection, CACHE_DURATION.CONNECTION_STATUS);
    } catch (e: any) {
      console.debug('[AppDataContext] refreshConnectionStatus error', e?.message || e);
      console.error("Connection check failed:", e.message);
      setHasConnection(false);
    } finally {
      setIsLoadingConnection(false);
    }
  }, [authLoading, userId]);

  const refreshAccounts = useCallback(async (opts?: { force?: boolean }) => {
    if (authLoading || !userId) return;
    console.debug('[AppDataContext] refreshAccounts start', { userId, force: opts?.force });
    setIsLoadingAccounts(true);
    try {
      // Pass refresh:true to bypass the backend's MongoDB cache and re-fetch
      // from Google Ads API. Use sparingly, Google Ads API has tight quotas.
      const body = opts?.force ? { refresh: true } : {};
      const data = await api<any>("/connections", body);
      console.debug('[AppDataContext] refreshAccounts response', { count: (data.connections || []).length, cached: data.cached });
      setAllAccounts(data.connections || []);
      setClientAccounts(data.clientAccounts || []);
      setHierarchy(data.hierarchy || {});
      setCache(CACHE_KEYS.ACCOUNTS_DATA, data, CACHE_DURATION.ACCOUNTS_DATA);
    } catch (e: any) {
      console.debug('[AppDataContext] refreshAccounts error', e?.message || e);
      console.error("Failed to load accounts:", e.message);
      toast?.({
        title: "Error",
        description: "Failed to load Google Ads accounts",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [authLoading, userId, toast]);

  useEffect(() => {
    console.debug('[AppDataContext] init effect', { userId, isInitialized });
    if (userId && !initDone.current && isInitialized) {
      initDone.current = true;
      refreshConnectionStatus();
      refreshAccounts();
    }
  }, [userId, isInitialized, refreshConnectionStatus, refreshAccounts]);

  const value: AppDataContextType = {
    user,
    supabaseUuid,
    emailVerified,
    isNewUser,
    hasConnection,
    allAccounts,
    managerAccounts,
    clientAccounts,
    hierarchy,
    isLoadingConnection,
    isLoadingAccounts,
    refreshConnectionStatus,
    refreshAccounts,
    clearCache,
  };

  return (
    <>
      <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
      <Toaster />
    </>
  );
};

export default AppDataContext;

// Re-export useAppData for convenience
export { useAppData } from './AppData';
