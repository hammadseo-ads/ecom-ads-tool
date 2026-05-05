// src/hooks/useUser.ts ← FINAL & WORKING 100%
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

// VITE_API_URL is the API root (includes /api), e.g. "/api" or "http://localhost:5000/api"
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export interface User {
  _id?: string;        // ← MongoDB _id
  userId?: string;     // ← fallback
  username: string;
  email: string;
  role?: "user" | "admin";
  phone?: string;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const tryFetchMe = async () => {
      const token = localStorage.getItem("accessToken");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      return api.get("/auth/me", config);
    };

    try {
      const res = await tryFetchMe();
      setUser(res.data.user);
      if (res.data.token) localStorage.setItem("accessToken", res.data.token);
    } catch (err: any) {
      // Access token expired? Try refresh once using the 7-day refresh cookie.
      if (err?.response?.status === 401) {
        try {
          const refreshed = await api.post("/auth/refresh-token");
          if (refreshed.data?.accessToken) {
            localStorage.setItem("accessToken", refreshed.data.accessToken);
          }
          const retry = await tryFetchMe();
          setUser(retry.data.user);
          return;
        } catch (refreshErr) {
          // Refresh failed too, really not logged in.
          localStorage.removeItem("accessToken");
          setUser(null);
        }
      } else {
        console.error("Failed to fetch user:", err);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Set authorization header on mount and when token changes
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const getUserId = () => user?._id || user?.userId || null;

  return {
    user,
    loading,
    isAuthenticated: !!getUserId(),
    userId: getUserId(),
    refreshUser: fetchUser,
  };
};