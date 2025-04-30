"use client";

import type React from "react";
import { useState } from "react";
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
  ChevronDownIcon,
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

// Import server actions
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "@/lib/action/work-schedule";

import { toast } from "sonner";

interface Schedule {
  id?: string;
  name: string;
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

const ScheduleSettingsForm: React.FC<ScheduleSettingsFormProps> = ({
  initialSchedules,
}) => {
  const [schedules, setSchedules] = useState<Schedule[]>(
    initialSchedules && initialSchedules.length > 0
      ? initialSchedules.map((schedule) => ({
          ...schedule,
          id: schedule.id || undefined,
          isModified: false,
        }))
      : [
          {
            name: "Default Schedule",
            department: null,
            startTime: "09:00",
            endTime: "17:00",
            graceMinutes: 15,
            workDays: [1, 2, 3, 4, 5, 6],
            isGlobal: true,
            isDefault: true,
            saturdayStartTime: "09:00",
            saturdayEndTime: "14:00",
            saturdayGraceMinutes: 15,
            isModified: false,
            latitude: null,
            longitude: null,
            locationRadius: 0.1,
          },
        ]
  );

  const [openSaturdayIndex, setOpenSaturdayIndex] = useState<number | null>(
    null
  );
  const [openLocationIndex, setOpenLocationIndex] = useState<number | null>(
    null
  );

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        id: undefined,
        name: "New Schedule",
        department: null,
        startTime: "09:00",
        endTime: "17:00",
        graceMinutes: 15,
        workDays: [1, 2, 3, 4, 5],
        isGlobal: false,
        isDefault: false,
        isModified: true,
        latitude: null,
        longitude: null,
        locationRadius: null,
      },
    ]);
  };

  const updateScheduleData = <K extends keyof Schedule>(
    index: number,
    field: K,
    value: Schedule[K]
  ) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      [field]: value,
      isModified: true,
    };
    setSchedules(updatedSchedules);
  };

  const removeSchedule = async (index: number) => {
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

    const updatedSchedules = schedules.filter((_, i) => i !== index);
    setSchedules(updatedSchedules);
  };

  const toggleWorkDay = (scheduleIndex: number, day: number) => {
    const updatedSchedules = [...schedules];
    const schedule = updatedSchedules[scheduleIndex];

    if (schedule.workDays.includes(day)) {
      schedule.workDays = schedule.workDays.filter((d) => d !== day);
    } else {
      schedule.workDays = [...schedule.workDays, day].sort();
    }

    updatedSchedules[scheduleIndex] = {
      ...schedule,
      isModified: true,
    };
    setSchedules(updatedSchedules);
  };

  const updateSaturdaySchedule = (
    index: number,
    field: string,
    value: string | number | null
  ) => {
    const updatedSchedules = [...schedules];
    const schedule = updatedSchedules[index];

    switch (field) {
      case "startTime":
        schedule.saturdayStartTime = value as string;
        break;
      case "endTime":
        schedule.saturdayEndTime = value as string;
        break;
      case "graceMinutes":
        schedule.saturdayGraceMinutes = value as number;
        break;
    }

    updatedSchedules[index] = {
      ...schedule,
      isModified: true,
    };
    setSchedules(updatedSchedules);
  };

  const toggleSaturdaySchedule = (index: number) => {
    const updatedSchedules = [...schedules];
    const schedule = updatedSchedules[index];

    if (schedule.saturdayStartTime) {
      // Disable Saturday schedule
      schedule.saturdayStartTime = null;
      schedule.saturdayEndTime = null;
      schedule.saturdayGraceMinutes = null;
    } else {
      // Enable Saturday schedule
      schedule.saturdayStartTime = "09:00";
      schedule.saturdayEndTime = "14:00";
      schedule.saturdayGraceMinutes = 15;
    }

    updatedSchedules[index] = {
      ...schedule,
      isModified: true,
    };
    setSchedules(updatedSchedules);
  };

  const handleSaveRow = async (schedule: Schedule, index: number) => {
    try {
      // Remove isModified from the data before saving
      const { isModified, ...scheduleData } = schedule;

      let result;
      if (schedule.id) {
        result = await updateSchedule({
          ...scheduleData,
          id: schedule.id,
        });
      } else {
        result = await createSchedule(scheduleData);
      }

      if (result.success) {
        // Update only this schedule's modified state
        setSchedules((prevSchedules) =>
          prevSchedules.map((s, i) =>
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
  };

  const getSelectedDaysText = (workDays: number[]) => {
    if (workDays.length === 7) return "All days";
    if (workDays.length === 0) return "No days";
    if (workDays.length <= 2) {
      return workDays
        .map((day) => daysOfWeek.find((d) => d.value === day)?.short)
        .join(", ");
    }
    return `${workDays.length} days selected`;
  };

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
                      <label className="text-xs font-medium">Name</label>
                      <Input
                        type="text"
                        value={schedule.name}
                        onChange={(e) =>
                          updateScheduleData(index, "name", e.target.value)
                        }
                        className="h-8 text-sm"
                      />
                    </div>
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
                          <SelectItem value="Accountant">Accountant</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Computer Operator">
                            Computer Operator
                          </SelectItem>
                          <SelectItem value="Clerk">Clerk</SelectItem>
                          <SelectItem value="Primary">Primary</SelectItem>
                          <SelectItem value="SSC">SSC</SelectItem>
                          <SelectItem value="HSC">HSC</SelectItem>
                          <SelectItem value="Foundation">Foundation</SelectItem>
                          <SelectItem value="HSC (Ahmd)">HSC (Ahmd)</SelectItem>
                          <SelectItem value="GCI">GCI</SelectItem>
                          <SelectItem value="Peon">Peon</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="Guest">Guest</SelectItem>
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

                  {/* Work Days - Dialog */}
                  <div>
                    <label className="text-xs font-medium">Work Days</label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 mt-1 justify-between"
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
                            <div
                              key={day.value}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`day-${day.value}-${index}`}
                                checked={schedule.workDays.includes(day.value)}
                                onCheckedChange={() =>
                                  toggleWorkDay(index, day.value)
                                }
                              />
                              <Label htmlFor={`day-${day.value}-${index}`}>
                                {day.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Saturday Schedule - Collapsible */}
                  <Collapsible
                    open={openSaturdayIndex === index}
                    onOpenChange={() =>
                      setOpenSaturdayIndex(
                        openSaturdayIndex === index ? null : index
                      )
                    }
                    className="border rounded-md"
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-2 text-sm font-medium">
                      <span>Saturday Schedule</span>
                      {openSaturdayIndex === index ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2 pt-0">
                      <div className="flex items-center mb-2">
                        <Checkbox
                          id={`enable-sat-${index}`}
                          checked={!!schedule.saturdayStartTime}
                          onCheckedChange={() => toggleSaturdaySchedule(index)}
                        />
                        <Label
                          htmlFor={`enable-sat-${index}`}
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
                                updateSaturdaySchedule(
                                  index,
                                  "startTime",
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
                                updateSaturdaySchedule(
                                  index,
                                  "endTime",
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
                                updateSaturdaySchedule(
                                  index,
                                  "graceMinutes",
                                  Number.parseInt(e.target.value)
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
                  <Collapsible
                    open={openLocationIndex === index}
                    onOpenChange={() =>
                      setOpenLocationIndex(
                        openLocationIndex === index ? null : index
                      )
                    }
                    className="border rounded-md"
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-2 text-sm font-medium">
                      <span>Location Settings</span>
                      {openLocationIndex === index ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
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
                                e.target.value
                                  ? Number.parseFloat(e.target.value)
                                  : null
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
                                e.target.value
                                  ? Number.parseFloat(e.target.value)
                                  : null
                              )
                            }
                            className="h-8 text-sm"
                            placeholder="e.g. 72.85"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">
                            Radius (km)
                          </label>
                          <Input
                            type="number"
                            step="0.1"
                            value={schedule.locationRadius || ""}
                            onChange={(e) =>
                              updateScheduleData(
                                index,
                                "locationRadius",
                                e.target.value
                                  ? Number.parseFloat(e.target.value)
                                  : null
                              )
                            }
                            className="h-8 text-sm"
                            placeholder="e.g. 0.1"
                          />
                        </div>
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
                    <TableHead className="w-[140px]">Name</TableHead>
                    <TableHead className="w-[140px]">Department</TableHead>
                    <TableHead className="w-[100px]">Start Time</TableHead>
                    <TableHead className="w-[100px]">End Time</TableHead>
                    <TableHead className="w-[80px]">Grace Min</TableHead>
                    <TableHead className="w-[120px]">Work Days</TableHead>
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
                        <Input
                          type="text"
                          value={schedule.name}
                          onChange={(e) =>
                            updateScheduleData(index, "name", e.target.value)
                          }
                          className="h-8 text-sm"
                        />
                      </TableCell>
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
                            <SelectItem value="Department 1">
                              Department 1
                            </SelectItem>
                            <SelectItem value="Department 2">
                              Department 2
                            </SelectItem>
                            <SelectItem value="Department 3">
                              Department 3
                            </SelectItem>
                            <SelectItem value="Department 4">
                              Department 4
                            </SelectItem>
                            <SelectItem value="Department 5">
                              Department 5
                            </SelectItem>
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
                        {/* Work Days - Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-8 justify-between"
                            >
                              <span>
                                {getSelectedDaysText(schedule.workDays)}
                              </span>
                              <CalendarIcon className="h-3 w-3 ml-2" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Select Work Days</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-2 py-4">
                              {daysOfWeek.map((day) => (
                                <div
                                  key={day.value}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`day-${day.value}-${index}-desktop`}
                                    checked={schedule.workDays.includes(
                                      day.value
                                    )}
                                    onCheckedChange={() =>
                                      toggleWorkDay(index, day.value)
                                    }
                                  />
                                  <Label
                                    htmlFor={`day-${day.value}-${index}-desktop`}
                                  >
                                    {day.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="py-2">
                        {/* Saturday Schedule - Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-8 justify-between"
                            >
                              {schedule.saturdayStartTime
                                ? "Configured"
                                : "Not Set"}
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
                                  id={`enable-sat-${index}-desktop`}
                                  checked={!!schedule.saturdayStartTime}
                                  onCheckedChange={() =>
                                    toggleSaturdaySchedule(index)
                                  }
                                />
                                <Label
                                  htmlFor={`enable-sat-${index}-desktop`}
                                  className="ml-2"
                                >
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
                                          updateSaturdaySchedule(
                                            index,
                                            "startTime",
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
                                          updateSaturdaySchedule(
                                            index,
                                            "endTime",
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
                                        updateSaturdaySchedule(
                                          index,
                                          "graceMinutes",
                                          Number.parseInt(e.target.value)
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="py-2">
                        {/* Location Settings - Dialog */}
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
                                      e.target.value
                                        ? Number.parseFloat(e.target.value)
                                        : null
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
                                      e.target.value
                                        ? Number.parseFloat(e.target.value)
                                        : null
                                    )
                                  }
                                  placeholder="e.g. 72.8530944"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Radius (km)</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={schedule.locationRadius || ""}
                                  onChange={(e) =>
                                    updateScheduleData(
                                      index,
                                      "locationRadius",
                                      e.target.value
                                        ? Number.parseFloat(e.target.value)
                                        : null
                                    )
                                  }
                                  placeholder="e.g. 0.1"
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
