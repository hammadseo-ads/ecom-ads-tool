// components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingPage } from "@/components/ui/loading-skeleton";
import {useAppData} from '@/contexts/AppData';
import axios from 'axios';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoading: appDataLoading } = useAppData();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Call your own backend /me endpoint
        await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsAuthenticated(true);
      } catch (error: any) {
        console.log('Token invalid or expired:', error.response?.status);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // 1. Still loading app-wide data (e.g. Google Ads accounts)
  if (appDataLoading) {
    return <LoadingPage />;
  }

  // 2. Still checking authentication
  if (isAuthenticated === null) {
    return <LoadingPage />;
  }

  // 3. Not authenticated → redirect to login (preserve intended destination)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. All good → render protected page
  return <>{children}</>;
};

export default ProtectedRoute;
