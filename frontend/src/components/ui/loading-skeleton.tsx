import React from 'react';
import { Skeleton } from './skeleton';

export const LoadingPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header skeleton */}
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Skeleton className="h-12 w-48" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
    
    {/* Main content skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  </div>
);

export const AccountSelectionSkeleton: React.FC = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-12 w-full" />
  </div>
);

export const ReportSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="grid md:grid-cols-3 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  </div>
);