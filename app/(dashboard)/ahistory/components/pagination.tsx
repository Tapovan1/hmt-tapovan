"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/ahistory?${params.toString()}`);
  };

  // Calculate the range of pages to show
  const getPageRange = () => {
    const range = 2; // Number of pages to show on each side of current page
    let start = Math.max(1, currentPage - range);
    let end = Math.min(totalPages, currentPage + range);

    // Adjust if we're near the start or end
    if (currentPage - range <= 1) {
      end = Math.min(totalPages, 1 + range * 2);
    }
    if (currentPage + range >= totalPages) {
      start = Math.max(1, totalPages - range * 2);
    }

    return { start, end };
  };

  const { start, end } = getPageRange();

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* First page */}
      {start > 1 && (
        <>
          <Button
            variant={currentPage === 1 ? "default" : "outline"}
            size="icon"
            onClick={() => handlePageChange(1)}
          >
            1
          </Button>
          {start > 2 && <MoreHorizontal className="h-4 w-4" />}
        </>
      )}

      {/* Middle pages */}
      {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
        (page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        )
      )}

      {/* Last page */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <MoreHorizontal className="h-4 w-4" />}
          <Button
            variant={currentPage === totalPages ? "default" : "outline"}
            size="icon"
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
