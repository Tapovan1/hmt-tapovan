"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles } from "lucide-react";

const STORAGE_KEY = "teacher-insights-nudge-count";
const MAX_VIEWS = 3;

export function TeacherInsightsNudge() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number.parseInt(raw, 10) : 0;

    if (Number.isNaN(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    if (parsed < MAX_VIEWS) {
      setOpen(true);
      window.localStorage.setItem(STORAGE_KEY, String(parsed + 1));
    }
  }, []);

  const handleExplore = () => {
    setOpen(false);
    router.push("/teacher-analytics");
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#4285f4]">
            <TrendingUp className="h-5 w-5" />
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle>New Teacher Insights page</DialogTitle>
          <DialogDescription>
            Explore punctuality trends, rule breaks, and personalized
            recommendations in one dashboard.
          </DialogDescription>
        </DialogHeader>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>Rank teachers by late arrivals and early exits</li>
          <li>See automated coaching recommendations</li>
          <li>Filter by month, department, and category</li>
        </ul>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Maybe later
          </Button>
          <Button onClick={handleExplore} className="bg-[#4285f4] text-white">
            Visit insights
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

