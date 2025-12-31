// src/components/OptimizedStandaloneUnifiedReport.tsx ← FINAL & WORKING
import React from 'react';
import StandaloneUnifiedReport from './StandaloneUnifiedReport';
import { ReportSkeleton } from '@/components/ui/loading-skeleton';
import { useUser } from '@/hooks/useUser'; // ← YOUR REAL MERN AUTH

interface OptimizedStandaloneUnifiedReportProps {
  selectedAccountId: string;
  selectedAccountName: string;
}

const OptimizedStandaloneUnifiedReport: React.FC<OptimizedStandaloneUnifiedReportProps> = ({
  selectedAccountId,
  selectedAccountName
}) => {
  const { user, loading: isLoading, userId } = useUser(); // ← REAL USER

  // Wait until we know the user's auth + id; UnifiedOnDemandReport requires a non-empty userId
  if (isLoading || !user || !userId) {
    return <ReportSkeleton />;
  }

  return (
    <StandaloneUnifiedReport
      selectedAccountId={selectedAccountId}
      selectedAccountName={selectedAccountName}
      userId={userId}
    />
  );
};

export default OptimizedStandaloneUnifiedReport;