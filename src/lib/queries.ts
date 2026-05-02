import { createServerClient } from "@/lib/supabase/server";
import type { Person, Room, Task, TaskCompletion } from "@/lib/types";
import { startOfDay } from "date-fns";

export type TaskWithMeta = Task & {
  roomName: string;
  lastCompletedAt: Date | null;
};

/**
 * Load every task for the household alongside its room name and the
 * latest completion timestamp (so we can compute next-due locally).
 */
export async function loadTasksForHousehold(householdId: string): Promise<{
  tasks: TaskWithMeta[];
  rooms: Room[];
  people: Person[];
  doneTodayTaskIds: Set<string>;
}> {
  const supabase = createServerClient();

  const [
    { data: rooms = [] },
    { data: tasks = [] },
    { data: people = [] },
    { data: completions = [] },
  ] = await Promise.all([
    supabase
      .from("rooms")
      .select("*")
      .eq("household_id", householdId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("tasks")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
    supabase
      .from("people")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
    supabase
      .from("task_completions")
      .select("task_id, completed_at")
      .eq("household_id", householdId)
      .order("completed_at", { ascending: false })
      .limit(1000),
  ]);

  // task_id -> latest completion
  const latest = new Map<string, Date>();
  for (const c of (completions ?? []) as Pick<
    TaskCompletion,
    "task_id" | "completed_at"
  >[]) {
    if (!latest.has(c.task_id)) {
      latest.set(c.task_id, new Date(c.completed_at));
    }
  }

  const roomMap = new Map<string, Room>();
  for (const r of (rooms ?? []) as Room[]) roomMap.set(r.id, r);

  const today = startOfDay(new Date()).getTime();
  const doneTodayTaskIds = new Set<string>();
  for (const [id, when] of latest) {
    if (startOfDay(when).getTime() === today) doneTodayTaskIds.add(id);
  }

  const decorated: TaskWithMeta[] = (tasks ?? []).map((t: Task) => ({
    ...t,
    roomName: roomMap.get(t.room_id)?.name ?? "—",
    lastCompletedAt: latest.get(t.id) ?? null,
  }));

  return {
    tasks: decorated,
    rooms: (rooms ?? []) as Room[],
    people: (people ?? []) as Person[],
    doneTodayTaskIds,
  };
}
