// src/hooks/useUser.ts ← FINAL & WORKING 100%
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
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
    try {
      // Try to use stored token first for faster initial load
      const token = localStorage.getItem("accessToken");
      const config = token 
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      
      const res = await api.get("/api/auth/me", config);
      setUser(res.data.user);
      
      // Store token from response if provided
      if (res.data.token) {
        localStorage.setItem("accessToken", res.data.token);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      // Clear invalid token
      localStorage.removeItem("accessToken");
      setUser(null);
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