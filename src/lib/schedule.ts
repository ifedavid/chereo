import {
  addDays,
  differenceInCalendarDays,
  isToday,
  startOfDay,
} from "date-fns";
import type { Frequency } from "./types";

export const FREQUENCY_DAYS: Record<Frequency, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
};

/**
 * The date a task is next due, given its frequency and last completion.
 * If never completed, the task is considered due today.
 */
export function nextDueAt(
  frequency: Frequency,
  lastCompletedAt: Date | null,
  now: Date = new Date(),
): Date {
  if (!lastCompletedAt) return startOfDay(now);
  return addDays(startOfDay(lastCompletedAt), FREQUENCY_DAYS[frequency]);
}

export type DueBucket = "overdue" | "today" | "this-week" | "later";

export function bucketFor(due: Date, now: Date = new Date()): DueBucket {
  const today = startOfDay(now);
  const days = differenceInCalendarDays(startOfDay(due), today);
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= 7) return "this-week";
  return "later";
}

export function isDueOrOverdue(due: Date, now: Date = new Date()): boolean {
  const today = startOfDay(now);
  return startOfDay(due).getTime() <= today.getTime();
}

export function relativeDueLabel(due: Date, now: Date = new Date()): string {
  const today = startOfDay(now);
  const days = differenceInCalendarDays(startOfDay(due), today);
  if (isToday(due)) return "Due today";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 1) return "Due tomorrow";
  if (days <= 7) return `Due in ${days}d`;
  return due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
