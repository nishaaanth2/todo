// File: app/utils/types.ts

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Task {
  id: string;
  title: string;
  type: "constant" | "temporary";
  allocatedMins: number;
  date: string; // e.g., "2025-07-18"
  actualMins: number;
  notes?: string;
}

export interface ConstantTask {
  id: string;
  title: string;
  allocatedMins: number;
  daysOfWeek: DayOfWeek[];
}

export interface UserSettings {
  constantTasks: ConstantTask[];
}
