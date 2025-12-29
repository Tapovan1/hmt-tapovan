"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export function TableLoadingFallback() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#4285f4]" />
        <p className="text-sm font-medium text-gray-700">Loading records...</p>
      </div>
    </div>
  );
}

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <Suspense fallback={<TableLoadingFallback />}>
      {children}
    </Suspense>
  );
}
