import React from 'react';
import { cn } from '../../types';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
}) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-100',
        variant === 'circular' ? 'rounded-full' : 'rounded-2xl',
        className
      )}
    />
  );
};

export const SkeletonCard = () => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" className="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
);
