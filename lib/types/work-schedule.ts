export interface WorkScheduleTime {
  startTime: string;
  endTime: string;
  graceMinutes: number;
}

export interface WorkSchedule {
  id?: string;
  name?: string;
  department?: string | null;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  workDays: number[];
  saturdayStartTime?: string | null;
  saturdayEndTime?: string | null;
  saturdayGraceMinutes?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  locationRadius?: number | null;
}
