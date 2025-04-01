"use client";

import type React from "react";
import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2Icon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}

interface ScheduleSettingsFormProps {
  initialSchedules?: Schedule[];
  departments?: string[];
}

const daysOfWeek = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
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
          },
        ]
  );

  const [isPending, startTransition] = useTransition();

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
    console.log("Deleting schedule:", scheduleToDelete);

    if (scheduleToDelete.id) {
      console.log("Calling deleteSchedule...");
      const result = await deleteSchedule(scheduleToDelete.id);
      console.log("Result:", result);
      if (result.success) {
        alert("Schedule deleted successfully!");
      } else {
        alert(`Failed to delete schedule: ${result.error}`);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Settings</CardTitle>
        <CardDescription>
          Manage your organization&apos;s work schedules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mobile View: Card-based layout */}
          <div className="block md:hidden">
            {schedules.map((schedule, index) => (
              <Card key={index} className="mb-4">
                <CardContent className="p-4 space-y-3">
                  {/* Name and Department */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      type="text"
                      value={schedule.name}
                      onChange={(e) =>
                        updateScheduleData(index, "name", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Department</label>
                    <Select
                      value={schedule.department || ""}
                      onValueChange={(value) =>
                        updateScheduleData(index, "department", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
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
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time Settings */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Time</label>
                      <Input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) =>
                          updateScheduleData(index, "startTime", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Time</label>
                      <Input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) =>
                          updateScheduleData(index, "endTime", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Grace Minutes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grace Minutes</label>
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
                    />
                  </div>

                  {/* Work Days */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Work Days</label>
                    <div className="flex flex-wrap gap-1">
                      {daysOfWeek.map((day) => (
                        <Button
                          key={day.value}
                          variant={
                            schedule.workDays.includes(day.value)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => toggleWorkDay(index, day.value)}
                          className="w-10"
                        >
                          {day.label.substring(0, 1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Saturday Schedule */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSaturdaySchedule(index)}
                      className="w-full"
                    >
                      {schedule.saturdayStartTime ? "Disable" : "Enable"}{" "}
                      Saturday Schedule
                    </Button>

                    {schedule.saturdayStartTime && (
                      <div className="space-y-2 pt-2">
                        <div className="grid grid-cols-2 gap-2">
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
                        <Input
                          type="number"
                          value={schedule.saturdayGraceMinutes || 0}
                          onChange={(e) =>
                            updateSaturdaySchedule(
                              index,
                              "graceMinutes",
                              parseInt(e.target.value)
                            )
                          }
                          placeholder="Grace minutes"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleSaveRow(schedule, index)}
                      disabled={!schedule.isModified}
                    >
                      {schedule.isModified ? "Save Changes" : "Saved"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSchedule(index)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View: Table layout */}
          <div className="hidden md:block">
            <ScrollArea>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Grace Minutes</TableHead>
                    <TableHead>Work Days</TableHead>
                    <TableHead>Saturday Schedule</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule, index) => (
                    <TableRow
                      key={index}
                      className={schedule.isModified ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <Input
                          type="text"
                          value={schedule.name}
                          onChange={(e) =>
                            updateScheduleData(index, "name", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={schedule.department || ""}
                          onValueChange={(value) =>
                            updateScheduleData(index, "department", value)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Department" />
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
                      <TableCell>
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
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) =>
                            updateScheduleData(index, "endTime", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
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
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {daysOfWeek.map((day) => (
                            <Button
                              key={day.value}
                              variant={
                                schedule.workDays.includes(day.value)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => toggleWorkDay(index, day.value)}
                            >
                              {day.label.substring(0, 3)}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSaturdaySchedule(index)}
                          >
                            {schedule.saturdayStartTime ? "Disable" : "Enable"}{" "}
                            Saturday Schedule
                          </Button>

                          {schedule.saturdayStartTime && (
                            <div className="space-y-2">
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
                              <Input
                                type="number"
                                value={schedule.saturdayGraceMinutes || 0}
                                onChange={(e) =>
                                  updateSaturdaySchedule(
                                    index,
                                    "graceMinutes",
                                    parseInt(e.target.value)
                                  )
                                }
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleSaveRow(schedule, index)}
                            disabled={!schedule.isModified}
                          >
                            {schedule.isModified ? "Save" : "Saved"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeSchedule(index)}
                          >
                            <Trash2Icon className="h-4 w-4" />
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
          <div className="flex justify-end pt-4">
            <Button onClick={addSchedule}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Schedule
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleSettingsForm;
