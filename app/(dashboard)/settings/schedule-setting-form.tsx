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
  Clock,
  Save,
  AlertTriangle,
  Info,
  CheckCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  saturdayStartTime?: string | null;
  saturdayEndTime?: string | null;
  saturdayGraceMinutes?: number | null;
  isModified: boolean;
  latitude?: number | null;
  longitude?: number | null;
  locationRadius?: number | null;
  absentAutomation?: boolean;
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
          absentAutomation: schedule.absentAutomation || false,
        }))
      : [
          {
            department: null,
            startTime: "09:00",
            endTime: "17:00",
            graceMinutes: 5,
            workDays: [1, 2, 3, 4, 5, 6],
            saturdayStartTime: "09:00",
            saturdayEndTime: "14:00",
            saturdayGraceMinutes: 15,
            isModified: false,
            latitude: null,
            longitude: null,
            locationRadius: 0.05,
            absentAutomation: false,
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
        isModified: true,
        latitude: null,
        longitude: null,
        locationRadius: null,
        absentAutomation: false,
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
          className="w-full h-9 justify-between"
        >
          <span>{getSelectedDaysText(schedule.workDays)}</span>
          <CalendarIcon className="h-4 w-4 ml-2 text-gray-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Work Days</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {daysOfWeek.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day.value}-${index}`}
                checked={schedule.workDays.includes(day.value)}
                onCheckedChange={() => toggleWorkDay(index, day.value)}
                className="text-[#4285f4] border-gray-300"
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
          className="w-full h-9 justify-between"
        >
          {schedule.saturdayStartTime ? "Configured" : "Not Set"}
          <ChevronRightIcon className="h-4 w-4 ml-2 text-gray-500" />
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
              className="text-[#4285f4] border-gray-300"
            />
            <Label htmlFor={`enable-sat-${index}`} className="ml-2">
              Enable Saturday Schedule
            </Label>
          </div>

          {schedule.saturdayStartTime && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
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
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
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
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
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
          className="w-full h-9 justify-between"
        >
          {schedule.latitude ? "Configured" : "Not Set"}
          <MapPinIcon className="h-4 w-4 ml-2 text-gray-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Location Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Alert variant="outline" className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700 text-sm">
              Set the location where attendance can be marked. Only users within
              the specified radius will be able to mark attendance.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label>Radius (meters)</Label>
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
            <p className="text-xs text-gray-500 mt-1">
              Enter distance in meters (e.g., 50 for 50 meters)
            </p>
          </div>
        </div>
        <div className="mt-2">
          <Button
            variant="default"
            onClick={() => fetchCurrentLocation(index)}
            className="w-full bg-[#4285f4] hover:bg-[#3b78e7]"
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
      <Label className="text-sm font-medium">Auto Absent</Label>
      <RadioGroup
        value={schedule.absentAutomation ? "true" : "false"}
        onValueChange={(value) => {
          updateScheduleData(index, "absentAutomation", value === "true");
        }}
        className="flex items-center space-x-4"
      >
        <div className="flex items-center space-x-1">
          <RadioGroupItem
            value="true"
            id={`auto-absent-yes-${index}`}
            className="text-[#4285f4]"
          />
          <Label htmlFor={`auto-absent-yes-${index}`} className="text-sm">
            Yes
          </Label>
        </div>
        <div className="flex items-center space-x-1">
          <RadioGroupItem
            value="false"
            id={`auto-absent-no-${index}`}
            className="text-[#4285f4]"
          />
          <Label htmlFor={`auto-absent-no-${index}`} className="text-sm">
            No
          </Label>
        </div>
      </RadioGroup>
    </div>
  );

  return (
    <div className="space-y-4 p-0">
      <Alert variant="outline" className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-800">
          Changes to work schedules will affect attendance marking and
          reporting. Make sure to save your changes.
        </AlertDescription>
      </Alert>

      {/* Mobile View: Card-based layout with tabs */}
      <div className="block lg:hidden">
        {schedules.map((schedule, index) => (
          <Card key={index} className="shadow-sm border-gray-200">
            <CardContent className="p-4 space-y-4">
              {/* Header with Department */}
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <Label className="text-sm font-medium mb-1 block">
                    Department
                  </Label>
                  <Select
                    value={schedule.department || ""}
                    onValueChange={(value) =>
                      updateScheduleData(index, "department", value)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm border-gray-200">
                      <SelectValue placeholder="Select Department" />
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
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    Start Time
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) =>
                        updateScheduleData(index, "startTime", e.target.value)
                      }
                      className="h-9 text-sm pl-9 border-gray-200"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    End Time
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) =>
                        updateScheduleData(index, "endTime", e.target.value)
                      }
                      className="h-9 text-sm pl-9 border-gray-200"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    Grace Min
                  </Label>
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
                    className="h-9 text-sm border-gray-200"
                  />
                </div>
              </div>

              {/* Work Days */}
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Work Days
                </Label>
                {renderWorkDaysDialog(schedule, index)}
              </div>

              {/* Absent Automation */}
              {renderAbsentAutomationRadio(schedule, index)}

              {/* Collapsible Sections */}
              <div className="space-y-3">
                {/* Saturday Schedule */}
                <Collapsible className="border border-gray-200 rounded-md">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-3 text-sm font-medium">
                    <span>Saturday Schedule</span>
                    <ChevronRightIcon className="h-4 w-4 transition-transform duration-200 ui-open:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-3 pt-0 border-t border-gray-200">
                    <div className="flex items-center mb-3">
                      <Checkbox
                        id={`enable-sat-${index}-mobile`}
                        checked={!!schedule.saturdayStartTime}
                        onCheckedChange={() => toggleSaturdaySchedule(index)}
                        className="text-[#4285f4] border-gray-300"
                      />
                      <Label
                        htmlFor={`enable-sat-${index}-mobile`}
                        className="ml-2 text-sm"
                      >
                        Enable Saturday Schedule
                      </Label>
                    </div>

                    {schedule.saturdayStartTime && (
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs font-medium mb-1 block">
                            Start
                          </Label>
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
                            className="h-9 text-sm border-gray-200"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium mb-1 block">
                            End
                          </Label>
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
                            className="h-9 text-sm border-gray-200"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium mb-1 block">
                            Grace
                          </Label>
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
                            className="h-9 text-sm border-gray-200"
                          />
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Location Settings */}
                <Collapsible className="border border-gray-200 rounded-md">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-3 text-sm font-medium">
                    <span>Location Settings</span>
                    <ChevronRightIcon className="h-4 w-4 transition-transform duration-200 ui-open:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-3 pt-0 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <Label className="text-xs font-medium mb-1 block">
                          Latitude
                        </Label>
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
                          className="h-9 text-sm border-gray-200"
                          placeholder="e.g. 21.19"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium mb-1 block">
                          Longitude
                        </Label>
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
                          className="h-9 text-sm border-gray-200"
                          placeholder="e.g. 72.85"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium mb-1 block">
                          Radius (m)
                        </Label>
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
                          className="h-9 text-sm border-gray-200"
                          placeholder="50"
                        />
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full text-sm bg-[#4285f4] hover:bg-[#3b78e7]"
                      onClick={() => fetchCurrentLocation(index)}
                    >
                      <MapPinIcon className="h-4 w-4 mr-2" /> Get Current
                      Location
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleSaveRow(schedule, index)}
                  disabled={!schedule.isModified}
                  className={`h-9 ${
                    schedule.isModified
                      ? "bg-[#4285f4] hover:bg-[#3b78e7]"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {schedule.isModified ? (
                    <>
                      <Save className="h-4 w-4 mr-2" /> Save
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" /> Saved
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSchedule(index)}
                  className="h-9"
                >
                  <Trash2Icon className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-4">
            <Button
              onClick={addSchedule}
              className="w-full bg-[#4285f4] hover:bg-[#3b78e7]"
            >
              <PlusIcon className="mr-2 h-4 w-4" /> Add New Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Desktop View: Table layout */}
      <div className="hidden lg:block">
        <ScrollArea className="border border-gray-200 rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[140px] py-3 font-medium text-gray-700">
                  Department
                </TableHead>
                <TableHead className="w-[100px] py-3 font-medium text-gray-700">
                  Start Time
                </TableHead>
                <TableHead className="w-[100px] py-3 font-medium text-gray-700">
                  End Time
                </TableHead>
                <TableHead className="w-[80px] py-3 font-medium text-gray-700">
                  Grace Min
                </TableHead>
                <TableHead className="w-[120px] py-3 font-medium text-gray-700">
                  Work Days
                </TableHead>
                <TableHead className="w-[100px] py-3 font-medium text-gray-700">
                  Auto Absent
                </TableHead>
                <TableHead className="w-[140px] py-3 font-medium text-gray-700">
                  Saturday Schedule
                </TableHead>
                <TableHead className="w-[140px] py-3 font-medium text-gray-700">
                  Location
                </TableHead>
                <TableHead className="text-right w-[160px] py-3 font-medium text-gray-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule, index) => (
                <TableRow
                  key={index}
                  className={`border-b border-gray-100 ${
                    schedule.isModified ? "bg-blue-50/30" : ""
                  }`}
                >
                  <TableCell className="py-3">
                    <Select
                      value={schedule.department || ""}
                      onValueChange={(value) =>
                        updateScheduleData(index, "department", value)
                      }
                    >
                      <SelectTrigger className="h-9 text-sm w-full border-gray-200">
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
                  <TableCell className="py-3">
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) =>
                          updateScheduleData(index, "startTime", e.target.value)
                        }
                        className="h-9 text-sm pl-9 border-gray-200"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) =>
                          updateScheduleData(index, "endTime", e.target.value)
                        }
                        className="h-9 text-sm pl-9 border-gray-200"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
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
                      className="h-9 text-sm border-gray-200"
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    {renderWorkDaysDialog(schedule, index)}
                  </TableCell>
                  <TableCell className="py-3">
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
                          className="text-[#4285f4]"
                        />
                        <Label
                          htmlFor={`auto-absent-yes-desktop-${index}`}
                          className="text-sm"
                        >
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem
                          value="false"
                          id={`auto-absent-no-desktop-${index}`}
                          className="text-[#4285f4]"
                        />
                        <Label
                          htmlFor={`auto-absent-no-desktop-${index}`}
                          className="text-sm"
                        >
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </TableCell>
                  <TableCell className="py-3">
                    {renderSaturdayDialog(schedule, index)}
                  </TableCell>
                  <TableCell className="py-3">
                    {renderLocationDialog(schedule, index)}
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSaveRow(schedule, index)}
                        disabled={!schedule.isModified}
                        className={`h-9 ${
                          schedule.isModified
                            ? "bg-[#4285f4] hover:bg-[#3b78e7]"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {schedule.isModified ? (
                          <>
                            <Save className="h-4 w-4 mr-2" /> Save
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" /> Saved
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSchedule(index)}
                        className="h-9"
                      >
                        <Trash2Icon className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Add Schedule Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={addSchedule}
            className="bg-[#4285f4] hover:bg-[#3b78e7]"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Add New Schedule
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSettingsForm;
