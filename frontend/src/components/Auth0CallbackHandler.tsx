// src/components/AuthCallbackHandler.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { pushToDataLayer } from "@/libs/utils";
import axios from "axios";

const AuthCallbackHandler: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, user, isLoading: authLoading } = useAuth();
  const hasProcessedRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    // === 1. OAuth Error ===
    if (error === "access_denied") {
      const msg = "A verification email has been sent. Please check your inbox.";
      navigate(`/login?error=email_verification_required&message=${encodeURIComponent(msg)}`, { replace: true });
      return;
    }

    // === 2. OAuth Success ===
    if (code) {
      const exchangeCode = async () => {
        try {
          setIsProcessing(true);
          const res = await axios.post("/api/auth/callback", { code });
          const { accessToken, userId, username, email, supabaseUuid, emailVerified, isNewUser } = res.data;

          // Store
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("supabase_user_uuid", supabaseUuid);
          localStorage.setItem("email_verified", String(emailVerified));
          localStorage.setItem("is_new_user", String(isNewUser));
          localStorage.setItem("user", JSON.stringify({ id: userId, username, email }));

          // Update context
          setUser({ id: userId, username, email });
          axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

          // Analytics
          pushToDataLayer({
            event: isNewUser ? "signup" : "login",
            user_id: supabaseUuid,
            email_verified: emailVerified,
            is_new_user: isNewUser,
          });

          // Clean URL & redirect
          navigate("/dashboard", { replace: true });
          window.history.replaceState({}, "", "/dashboard");
        } catch (err: any) {
          const msg = err.response?.data?.message || "Authentication failed";
          navigate(`/login?error=auth_failed&details=${encodeURIComponent(msg)}`, { replace: true });
        } finally {
          setIsProcessing(false);
        }
      };

      exchangeCode();
      return;
    }

    // === 3. Already logged in ===
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // === 4. Default: go to login ===
    navigate("/login", { replace: true });
  }, [authLoading, user, navigate, setUser]); // ← Fixed deps

  // === UI ===
  if (isProcessing || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Completing login...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallbackHandler;