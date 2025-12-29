"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

interface HistoryTableWrapperProps {
  children: React.ReactNode;
}

export function HistoryTableWrapper({ children }: HistoryTableWrapperProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Show loading when search params change (pagination)
    setIsLoading(true);
    
    // Hide loading after a short delay
    const timer = setTimeout(() => {
      startTransition(() => {
        setIsLoading(false);
      });
    }, 400);
    
    return () => clearTimeout(timer);
  }, [searchParams, pathname]);

  const showLoading = isLoading || isPending;

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {showLoading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg transition-all duration-300">
          <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-[#4285f4]" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-blue-100 animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-gray-800">Loading records...</p>
              <p className="text-xs text-gray-500">Please wait</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className={showLoading ? "opacity-40 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300"}>
        {children}
      </div>
    </div>
  );
}
