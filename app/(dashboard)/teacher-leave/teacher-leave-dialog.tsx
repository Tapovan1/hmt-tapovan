"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createTeacherLeave,
  updateTeacherLeave,
} from "@/lib/action/teacherLeave.action";

const formSchema = z
  .object({
    id: z.string().optional(),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    reason: z.string().min(1, "Reason is required"),
  })
  .refine(
    (data) => {
      return data.endDate >= data.startDate;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

type TeacherLeaveFormValues = z.infer<typeof formSchema>;

export function TeacherLeaveDialog({
  children,
  leave,
}: {
  children?: React.ReactNode;
  leave?: any;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Initialize the form with only the required fields
  const form = useForm<TeacherLeaveFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: leave?.startDate ? new Date(leave.startDate) : undefined,
      endDate: leave?.endDate ? new Date(leave.endDate) : undefined,
      reason: leave?.reason || "",
      id: leave?.id,
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      if (!leave) {
        form.reset({
          startDate: undefined,
          endDate: undefined,
          reason: "",
        });
      }
    }
  }, [open, form, leave]);

  async function onSubmit(data: TeacherLeaveFormValues) {
    try {
      if (data.id) {
        await updateTeacherLeave(data);
      } else {
        await createTeacherLeave(data);
      }
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Failed to save teacher leave:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Request Leave
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-4 sm:p-0 sticky top-0 bg-background z-10">
          <DialogTitle>
            {leave ? "Edit Leave Request" : "New Leave Request"}
          </DialogTitle>
          <DialogDescription>
            {leave
              ? "Update your leave request details."
              : "Fill in the details to request a leave."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-4 sm:p-0"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Leave</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter reason for leave"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 sm:pt-0 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {leave ? "Update" : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
