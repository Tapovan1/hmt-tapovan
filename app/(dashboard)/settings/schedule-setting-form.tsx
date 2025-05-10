"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  Trash2Icon,
  ChevronRightIcon,
  CalendarIcon,
  MapPinIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Import server actions
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "@/lib/action/work-schedule";

import { toast } from "sonner";

interface Schedule {
  id?: string;

  department: string | null;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  workDays: number[];
  isGlobal: boolean;
  isDefault: boolean;
  saturdayStartTime?: string | null;
  saturdayEndTime?: string | null;
  saturdayGraceMinutes?: number | null;
  isModified: boolean;
  latitude?: number | null;
  longitude?: number | null;
  locationRadius?: number | null;
  absentAutomation?: boolean; // Added for absent automation
}

interface ScheduleSettingsFormProps {
  initialSchedules?: Schedule[];
  departments?: string[];
}

const daysOfWeek = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 0, label: "Sunday", short: "Sun" },
];

const departmentOptions = [
  "Accountant",
  "Admin",
  "Computer Operator",
  "Clerk",
  "Primary",
  "SSC",
  "HSC",
  "Foundation",
  "HSC (Ahmd)",
  "GCI",
  "Peon",
  "Security",
  "Guest",
];

const ScheduleSettingsForm = ({
  initialSchedules = [],
}: ScheduleSettingsFormProps) => {
  const [schedules, setSchedules] = useState<Schedule[]>(
    initialSchedules.length > 0
      ? initialSchedules.map((schedule) => ({
          ...schedule,
          id: schedule.id || undefined,
          isModified: false,
          absentAutomation: schedule.absentAutomation || false, // Initialize with existing value or false
        }))
      : [
          {
            department: null,
            startTime: "09:00",
            endTime: "17:00",
            graceMinutes: 5,
            workDays: [1, 2, 3, 4, 5, 6],
            isGlobal: true,
            isDefault: true,
            saturdayStartTime: "09:00",
            saturdayEndTime: "14:00",
            saturdayGraceMinutes: 15,
            isModified: false,
            latitude: null,
            longitude: null,
            locationRadius: 0.05,
            absentAutomation: false, // Default to false
          },
        ]
  );

  // Memoize common functions to reduce re-renders
  const updateScheduleData = useCallback(
    (index: number, field: keyof Schedule, value: unknown) => {
      setSchedules((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [field]: value,
          isModified: true,
        };
        return updated;
      });
    },
    []
  );

  const addSchedule = useCallback(() => {
    setSchedules((prev) => [
      ...prev,
      {
        id: undefined,

        department: null,
        startTime: "09:00",
        endTime: "17:00",
        graceMinutes: 5,
        workDays: [1, 2, 3, 4, 5],
        isGlobal: false,
        isDefault: false,
        isModified: true,
        latitude: null,
        longitude: null,
        locationRadius: null,
        absentAutomation: false, // Default to false for new schedules
      },
    ]);
  }, []);

  const removeSchedule = useCallback(
    async (index: number) => {
      const scheduleToDelete = schedules[index];

      if (scheduleToDelete.id) {
        const result = await deleteSchedule(scheduleToDelete.id);
        if (result.success) {
          toast.success("Schedule deleted successfully!");
        } else {
          toast.error(`Failed to delete schedule: ${result.error}`);
          return;
        }
      }

      setSchedules((prev) => prev.filter((_, i) => i !== index));
    },
    [schedules]
  );

  const toggleWorkDay = useCallback((scheduleIndex: number, day: number) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const schedule = { ...updated[scheduleIndex] };

      if (schedule.workDays.includes(day)) {
        schedule.workDays = schedule.workDays.filter((d) => d !== day);
      } else {
        schedule.workDays = [...schedule.workDays, day].sort();
      }

      updated[scheduleIndex] = {
        ...schedule,
        isModified: true,
      };

      return updated;
    });
  }, []);

  const toggleSaturdaySchedule = useCallback((index: number) => {
    setSchedules((prev) => {
      const updated = [...prev];
      const schedule = { ...updated[index] };

      if (schedule.saturdayStartTime) {
        schedule.saturdayStartTime = null;
        schedule.saturdayEndTime = null;
        schedule.saturdayGraceMinutes = null;
      } else {
        schedule.saturdayStartTime = "09:00";
        schedule.saturdayEndTime = "14:00";
        schedule.saturdayGraceMinutes = 15;
      }

      updated[index] = {
        ...schedule,
        isModified: true,
      };

      return updated;
    });
  }, []);

  const handleSaveRow = useCallback(
    async (schedule: Schedule, index: number) => {
      try {
        const { isModified, ...scheduleData } = schedule;

        const result = schedule.id
          ? await updateSchedule({ ...scheduleData, id: schedule.id })
          : await createSchedule(scheduleData);

        if (result.success) {
          setSchedules((prev) =>
            prev.map((s, i) =>
              i === index
                ? { ...s, isModified: false, id: result.data?.id || s.id }
                : s
            )
          );
          toast.success("Schedule saved successfully!");
        } else {
          toast.error(result.error || "Failed to save schedule");
        }
      } catch (error) {
        console.error("Error saving schedule:", error);
        toast.error("Failed to save schedule");
      }
    },
    []
  );

  const fetchCurrentLocation = useCallback((index: number) => {
    if (navigator.geolocation) {
      toast.info("Fetching your current location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSchedules((prev) => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              locationRadius: 0.05,
              isModified: true,
            };
            return updated;
          });
          toast.success("Location set successfully!");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(
            "Failed to get your location. Please check your browser permissions."
          );
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  }, []);

  const getSelectedDaysText = useCallback((workDays: number[]) => {
    if (workDays.length === 7) return "All days";
    if (workDays.length === 0) return "No days";
    if (workDays.length <= 2) {
      return workDays
        .map((day) => daysOfWeek.find((d) => d.value === day)?.short)
        .join(", ");
    }
    return `${workDays.length} days selected`;
  }, []);

  // Shared components to reduce duplication
  const renderWorkDaysDialog = (schedule: Schedule, index: number) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 justify-between"
        >
          <span>{getSelectedDaysText(schedule.workDays)}</span>
          <CalendarIcon className="h-3 w-3 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Work Days</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {daysOfWeek.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day.value}-${index}`}
                checked={schedule.workDays.includes(day.value)}
                onCheckedChange={() => toggleWorkDay(index, day.value)}
              />
              <Label htmlFor={`day-${day.value}-${index}`}>{day.label}</Label>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderSaturdayDialog = (schedule: Schedule, index: number) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 justify-between"
        >
          {schedule.saturdayStartTime ? "Configured" : "Not Set"}
          <ChevronRightIcon className="h-3 w-3 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Saturday Schedule</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center mb-4">
            <Checkbox
              id={`enable-sat-${index}`}
              checked={!!schedule.saturdayStartTime}
              onCheckedChange={() => toggleSaturdaySchedule(index)}
            />
            <Label htmlFor={`enable-sat-${index}`} className="ml-2">
              Enable Saturday Schedule
            </Label>
          </div>

          {schedule.saturdayStartTime && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={schedule.saturdayStartTime}
                    onChange={(e) =>
                      updateScheduleData(
                        index,
                        "saturdayStartTime",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={schedule.saturdayEndTime || ""}
                    onChange={(e) =>
                      updateScheduleData(
                        index,
                        "saturdayEndTime",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Grace Minutes</Label>
                <Input
                  type="number"
                  value={schedule.saturdayGraceMinutes || 0}
                  onChange={(e) =>
                    updateScheduleData(
                      index,
                      "saturdayGraceMinutes",
                      Number(e.target.value)
                    )
                  }
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderLocationDialog = (schedule: Schedule, index: number) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 justify-between"
        >
          {schedule.latitude ? "Configured" : "Not Set"}
          <MapPinIcon className="h-3 w-3 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Location Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <div className="space-y-1">
            <Label>Latitude</Label>
            <Input
              type="number"
              step="any"
              value={schedule.latitude || ""}
              onChange={(e) =>
                updateScheduleData(
                  index,
                  "latitude",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              placeholder="e.g. 21.1910656"
            />
          </div>
          <div className="space-y-1">
            <Label>Longitude</Label>
            <Input
              type="number"
              step="any"
              value={schedule.longitude || ""}
              onChange={(e) =>
                updateScheduleData(
                  index,
                  "longitude",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              placeholder="e.g. 72.8530944"
            />
          </div>
          <div className="space-y-1">
            <Label>Radius (m)</Label>
            <Input
              type="text"
              value={
                schedule.locationRadius
                  ? (schedule.locationRadius * 1000).toString()
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value;
                updateScheduleData(
                  index,
                  "locationRadius",
                  value ? Number(value) / 1000 : null
                );
              }}
              placeholder="50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter distance in meters (e.g., 50 for 50 meters)
            </p>
          </div>
        </div>
        <div className="mt-2">
          <Button
            variant="default"
            onClick={() => fetchCurrentLocation(index)}
            className="w-full"
          >
            <MapPinIcon className="h-4 w-4 mr-2" /> Get Current Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // New component for the Absent Automation radio buttons
  const renderAbsentAutomationRadio = (schedule: Schedule, index: number) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium">Auto Absent</Label>
      <RadioGroup
        value={schedule.absentAutomation ? "true" : "false"}
        onValueChange={(value) => {
          updateScheduleData(index, "absentAutomation", value === "true");
        }}
        className="flex items-center space-x-4"
      >
        <div className="flex items-center space-x-1">
          <RadioGroupItem value="true" id={`auto-absent-yes-${index}`} />
          <Label htmlFor={`auto-absent-yes-${index}`} className="text-xs">
            Yes
          </Label>
        </div>
        <div className="flex items-center space-x-1">
          <RadioGroupItem value="false" id={`auto-absent-no-${index}`} />
          <Label htmlFor={`auto-absent-no-${index}`} className="text-xs">
            No
          </Label>
        </div>
      </RadioGroup>
    </div>
  );

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="px-4 py-2">
        <div className="space-y-3">
          {/* Mobile View: Card-based layout */}
          <div className="block md:hidden">
            {schedules.map((schedule, index) => (
              <Card key={index} className="mb-3 shadow-sm">
                <CardContent className="p-3 space-y-2">
                  {/* Name and Department */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium">Department</label>
                      <Select
                        value={schedule.department || ""}
                        onValueChange={(value) =>
                          updateScheduleData(index, "department", value)
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentOptions.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Time Settings */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-medium">Start</label>
                      <Input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) =>
                          updateScheduleData(index, "startTime", e.target.value)
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">End</label>
                      <Input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) =>
                          updateScheduleData(index, "endTime", e.target.value)
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Grace Min</label>
                      <Input
                        type="number"
                        value={schedule.graceMinutes}
                        onChange={(e) =>
                          updateScheduleData(
                            index,
                            "graceMinutes",
                            Number(e.target.value)
                          )
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  {/* Work Days */}
                  <div>
                    <label className="text-xs font-medium">Work Days</label>
                    {renderWorkDaysDialog(schedule, index)}
                  </div>

                  {/* Absent Automation */}
                  {renderAbsentAutomationRadio(schedule, index)}

                  {/* Saturday Schedule - Collapsible */}
                  <Collapsible className="border rounded-md">
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-2 text-sm font-medium">
                      <span>Saturday Schedule</span>
                      <ChevronRightIcon className="h-4 w-4 transition-transform duration-200 ui-open:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2 pt-0">
                      <div className="flex items-center mb-2">
                        <Checkbox
                          id={`enable-sat-${index}-mobile`}
                          checked={!!schedule.saturdayStartTime}
                          onCheckedChange={() => toggleSaturdaySchedule(index)}
                        />
                        <Label
                          htmlFor={`enable-sat-${index}-mobile`}
                          className="ml-2 text-xs"
                        >
                          Enable Saturday Schedule
                        </Label>
                      </div>

                      {schedule.saturdayStartTime && (
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs font-medium">Start</label>
                            <Input
                              type="time"
                              value={schedule.saturdayStartTime}
                              onChange={(e) =>
                                updateScheduleData(
                                  index,
                                  "saturdayStartTime",
                                  e.target.value
                                )
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">End</label>
                            <Input
                              type="time"
                              value={schedule.saturdayEndTime || ""}
                              onChange={(e) =>
                                updateScheduleData(
                                  index,
                                  "saturdayEndTime",
                                  e.target.value
                                )
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Grace</label>
                            <Input
                              type="number"
                              value={schedule.saturdayGraceMinutes || 0}
                              onChange={(e) =>
                                updateScheduleData(
                                  index,
                                  "saturdayGraceMinutes",
                                  Number(e.target.value)
                                )
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Location Settings - Collapsible */}
                  <Collapsible className="border rounded-md">
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-2 text-sm font-medium">
                      <span>Location Settings</span>
                      <ChevronRightIcon className="h-4 w-4 transition-transform duration-200 ui-open:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2 pt-0">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs font-medium">
                            Latitude
                          </label>
                          <Input
                            type="number"
                            step="any"
                            value={schedule.latitude || ""}
                            onChange={(e) =>
                              updateScheduleData(
                                index,
                                "latitude",
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            className="h-8 text-sm"
                            placeholder="e.g. 21.19"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">
                            Longitude
                          </label>
                          <Input
                            type="number"
                            step="any"
                            value={schedule.longitude || ""}
                            onChange={(e) =>
                              updateScheduleData(
                                index,
                                "longitude",
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            className="h-8 text-sm"
                            placeholder="e.g. 72.85"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">
                            Radius (m)
                          </label>
                          <Input
                            type="text"
                            value={
                              schedule.locationRadius
                                ? (schedule.locationRadius * 1000).toString()
                                : ""
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              updateScheduleData(
                                index,
                                "locationRadius",
                                value ? Number(value) / 1000 : null
                              );
                            }}
                            className="h-8 text-sm"
                            placeholder="50"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => fetchCurrentLocation(index)}
                        >
                          <MapPinIcon className="h-3 w-3 mr-1" /> Get Current
                          Location
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleSaveRow(schedule, index)}
                      disabled={!schedule.isModified}
                      className="h-7 text-xs"
                    >
                      {schedule.isModified ? "Save" : "Saved"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSchedule(index)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2Icon className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View: Table layout */}
          <div className="hidden md:block">
            <ScrollArea className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Department</TableHead>
                    <TableHead className="w-[100px]">Start Time</TableHead>
                    <TableHead className="w-[100px]">End Time</TableHead>
                    <TableHead className="w-[80px]">Grace Min</TableHead>
                    <TableHead className="w-[120px]">Work Days</TableHead>
                    <TableHead className="w-[100px]">Auto Absent</TableHead>
                    <TableHead className="w-[140px]">
                      Saturday Schedule
                    </TableHead>
                    <TableHead className="w-[140px]">Location</TableHead>
                    <TableHead className="text-right w-[120px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule, index) => (
                    <TableRow
                      key={index}
                      className={schedule.isModified ? "bg-muted/50" : ""}
                    >
                      <TableCell className="py-2">
                        <Select
                          value={schedule.department || ""}
                          onValueChange={(value) =>
                            updateScheduleData(index, "department", value)
                          }
                        >
                          <SelectTrigger className="h-8 text-sm w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {departmentOptions.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) =>
                            updateScheduleData(
                              index,
                              "startTime",
                              e.target.value
                            )
                          }
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) =>
                            updateScheduleData(index, "endTime", e.target.value)
                          }
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          type="number"
                          value={schedule.graceMinutes}
                          onChange={(e) =>
                            updateScheduleData(
                              index,
                              "graceMinutes",
                              Number(e.target.value)
                            )
                          }
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        {renderWorkDaysDialog(schedule, index)}
                      </TableCell>
                      <TableCell className="py-2">
                        <RadioGroup
                          value={schedule.absentAutomation ? "true" : "false"}
                          onValueChange={(value) => {
                            updateScheduleData(
                              index,
                              "absentAutomation",
                              value === "true"
                            );
                          }}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem
                              value="true"
                              id={`auto-absent-yes-desktop-${index}`}
                            />
                            <Label
                              htmlFor={`auto-absent-yes-desktop-${index}`}
                              className="text-xs"
                            >
                              Yes
                            </Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem
                              value="false"
                              id={`auto-absent-no-desktop-${index}`}
                            />
                            <Label
                              htmlFor={`auto-absent-no-desktop-${index}`}
                              className="text-xs"
                            >
                              No
                            </Label>
                          </div>
                        </RadioGroup>
                      </TableCell>
                      <TableCell className="py-2">
                        {renderSaturdayDialog(schedule, index)}
                      </TableCell>
                      <TableCell className="py-2">
                        {renderLocationDialog(schedule, index)}
                      </TableCell>
                      <TableCell className="text-right py-2">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleSaveRow(schedule, index)}
                            disabled={!schedule.isModified}
                            className="h-7 text-xs"
                          >
                            {schedule.isModified ? "Save" : "Saved"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeSchedule(index)}
                            className="h-7 w-7"
                          >
                            <Trash2Icon className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-2">
            <Button onClick={addSchedule} size="sm" className="h-8">
              <PlusIcon className="mr-1 h-3 w-3" /> Add Schedule
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleSettingsForm;
