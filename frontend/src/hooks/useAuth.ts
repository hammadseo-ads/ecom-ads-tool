// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_AUTH_URL || "http://localhost:5000/api/auth",
  withCredentials: true, // Critical for cookies
});

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await api.post("/refresh-token");
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    api.get("/me")
      .then(res => setUser(res.data.user))
      .catch(() => refresh())
      .finally(() => setLoading(false));
  }, []);

  const signIn = (email: string, password: string) => api.post("/login", { email, password });
  const signUp = (username: string, email: string, password: string) => api.post("/register", { username, email, password });
  const signOut = () => api.post("/logout").then(() => window.location.href = "/login");
  const googleLogin = () => window.location.href = `${import.meta.env.VITE_API_AUTH_URL || "http://localhost:5000/api/auth"}/google`;

  return { user, loading, signIn, signUp, signOut, googleLogin, refresh };
};