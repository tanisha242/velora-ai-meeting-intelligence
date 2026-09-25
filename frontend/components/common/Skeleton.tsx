import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-[#E3DED4]/60 rounded-lg ${className}`} />
);

export const MeetingCardSkeleton: React.FC = () => (
  <div className="p-5 rounded-2xl bg-[#FFFEFB] border border-[#E3DED4] space-y-4 shadow-sm font-sans-ui">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-14 w-full" />
    <div className="flex items-center justify-between pt-2">
      <div className="flex -space-x-2">
        <Skeleton className="w-7 h-7 rounded-full" />
        <Skeleton className="w-7 h-7 rounded-full" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  </div>
);
