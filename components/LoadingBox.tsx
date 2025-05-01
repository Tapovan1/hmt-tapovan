"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LoadingBoxProps {
  className?: string;
  size?: "sm";
  variant?: "spin";
}

export default function LoadingBox({
  className,
  size = "sm",
  variant = "spin",
}: LoadingBoxProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const variantClasses = {
    pulse: "animate-pulse bg-gradient-to-r from-purple-500 to-pink-500",
    spin: "animate-spin bg-gradient-to-r from-emerald-500 to-teal-500",
    gradient:
      "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "rounded-md shadow-lg",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      />
    </div>
  );
}
