"use client"; // Error boundaries must be Client Components

import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-gray-50">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-red-600 p-4 flex items-center">
              <AlertCircle className="h-6 w-6 text-white mr-2" />
              <h2 className="text-lg font-semibold text-white">
                Critical Application Errors
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-4 text-sm text-gray-600 border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                {error.message ||
                  "A critical error occurred in the application."}
              </div>
              <p className="text-sm text-gray-600 mb-6">
                The error has been logged. Please try refreshing the page or
                contact support if the issue persists.
              </p>
              <button
                onClick={() => reset()}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
