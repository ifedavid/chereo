export type Frequency = "daily" | "weekly" | "monthly" | "quarterly";

export type Person = {
  id: string;
  household_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type Room = {
  id: string;
  household_id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type Task = {
  id: string;
  household_id: string;
  room_id: string;
  title: string;
  frequency: Frequency;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
};

export type TaskCompletion = {
  id: string;
  task_id: string;
  completed_at: string;
  completed_by: string | null;
  household_id: string;
};

export type Household = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
};

export const FREQUENCIES: Frequency[] = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
];

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Every 3 months",
};
