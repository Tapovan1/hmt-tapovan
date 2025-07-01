"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/date-picker";
import {
  createHoliday,
  updateHoliday,
  type Holiday,
} from "@/lib/action/holiday.action";
import { toast } from "sonner";

interface HolidayDialogProps {
  children?: React.ReactNode;
  holiday?: Holiday;
}

export function HolidayDialog({ children, holiday }: HolidayDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [name, setName] = useState(holiday?.name || "");
  const [date, setDate] = useState<Date | undefined>(
    holiday?.date ? new Date(holiday.date) : undefined
  );
  const [type, setType] = useState(holiday?.type || "SCHOOL");
  const [description, setDescription] = useState(holiday?.description || "");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    if (!holiday) {
      setName("");
      setDate(undefined);
      setType("SCHOOL");
      setDescription("");
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a holiday name");
      return;
    }

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    setIsSubmitting(true);

    const holidayData = {
      name: name.trim(),
      date,
      type: type as "NATIONAL" | "RELIGIOUS" | "SCHOOL" | "LOCAL",
      description: description.trim() || undefined,
    };

    try {
      let result;
      if (holiday) {
        result = await updateHoliday({ ...holidayData, id: holiday.id });
      } else {
        result = await createHoliday(holidayData);
      }

      if (result.success) {
        toast.success(
          holiday
            ? "Holiday updated successfully"
            : "Holiday created successfully"
        );
        setOpen(false);
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save holiday");
      }
    } catch (error) {
      console.error("Failed to save holiday:", error);
      toast.error("Failed to save holiday. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold text-center">
            {holiday ? "Edit Holiday" : "Add New Holiday"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {holiday
              ? "Update the holiday details below."
              : "Add a new holiday to prevent unnecessary attendance marking."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 p-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              Holiday Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter holiday name"
              className="border-gray-200 focus:border-[#4285f4] focus:ring-[#4285f4]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                Date <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                date={date}
                setDate={setDate}
                placeholder="Select date"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Holiday Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="border-gray-200 focus:ring-[#4285f4] focus:border-[#4285f4]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NATIONAL">National Holiday</SelectItem>
                  <SelectItem value="RELIGIOUS">Religious Holiday</SelectItem>
                  <SelectItem value="SCHOOL">School Holiday</SelectItem>
                  <SelectItem value="LOCAL">Local Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter holiday description (optional)"
              className="resize-none min-h-[80px] border-gray-200 focus:border-[#4285f4] focus:ring-[#4285f4]"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto border-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-[#4285f4] hover:bg-[#3b78e7] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : holiday
                ? "Update Holiday"
                : "Add Holiday"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
