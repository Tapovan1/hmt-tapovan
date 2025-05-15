"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type LoadingVariant = "dots" | "spinner" | "pulse" | "bounce" | "wave";

export interface LoadingProps {
  /** Additional class names to apply */
  className?: string;
  /** Size of the loading indicator (sm, md, lg) */
  size?: "sm" | "md" | "lg";
  /** Animation style */
  variant?: LoadingVariant;
  /** Text to display with the loading indicator */
  text?: string;
}

export function LoadingBox({
  className,
  size = "md",
  variant = "dots",
  text,
}: LoadingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const renderLoading = () => {
    switch (variant) {
      case "pulse":
        return (
          <div className={cn("flex flex-col items-center gap-2", className)}>
            <div
              className={cn(
                "rounded-full animate-pulse bg-[#4285f4]",
                sizeClasses[size]
              )}
            />
            {text && (
              <p
                className={cn(
                  "animate-pulse text-[#4285f4]",
                  textSizeClasses[size]
                )}
              >
                {text}
              </p>
            )}
          </div>
        );

      case "bounce":
        return (
          <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className="flex space-x-1">
              <div
                className={cn(
                  "rounded-full animate-bounce bg-[#4285f4]",
                  "w-2 h-2"
                )}
                style={{ animationDelay: "0ms" }}
              />
              <div
                className={cn(
                  "rounded-full animate-bounce bg-[#4285f4]",
                  "w-2 h-2"
                )}
                style={{ animationDelay: "150ms" }}
              />
              <div
                className={cn(
                  "rounded-full animate-bounce bg-[#4285f4]",
                  "w-2 h-2"
                )}
                style={{ animationDelay: "300ms" }}
              />
            </div>
            {text && (
              <p className={cn("text-[#4285f4]", textSizeClasses[size])}>
                {text}
              </p>
            )}
          </div>
        );

      case "dots":
        return (
          <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 rounded-full animate-pulse bg-[#4285f4]"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 rounded-full animate-pulse bg-[#4285f4]"
                style={{ animationDelay: "300ms" }}
              />
              <div
                className="w-2 h-2 rounded-full animate-pulse bg-[#4285f4]"
                style={{ animationDelay: "600ms" }}
              />
            </div>
            {text && (
              <p className={cn("text-[#4285f4]", textSizeClasses[size])}>
                {text}
              </p>
            )}
          </div>
        );

      case "spinner":
        return (
          <div className={cn("flex flex-col items-center gap-2", className)}>
            <div
              className={cn(
                "border-2 rounded-full animate-spin",
                sizeClasses[size],
                "border-t-transparent border-[#4285f4]"
              )}
            />
            {text && (
              <p className={cn("text-[#4285f4]", textSizeClasses[size])}>
                {text}
              </p>
            )}
          </div>
        );

      case "wave":
        return (
          <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className="flex items-center space-x-1 h-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-[#4285f4] animate-wave"
                  style={{
                    animationDelay: `${i * 100}ms`,
                    height: `${Math.max(3, (i + 1) * 4)}px`,
                  }}
                />
              ))}
            </div>
            {text && (
              <p className={cn("text-[#4285f4]", textSizeClasses[size])}>
                {text}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className={cn("flex flex-col items-center gap-2", className)}>
            <div
              className={cn(
                "rounded-full animate-pulse bg-[#4285f4]",
                sizeClasses[size]
              )}
            />
            {text && (
              <p className={cn("text-[#4285f4]", textSizeClasses[size])}>
                {text}
              </p>
            )}
          </div>
        );
    }
  };

  return renderLoading();
}
