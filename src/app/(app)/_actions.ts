"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getOrCreateHouseholdId } from "@/lib/household";
import type { Frequency } from "@/lib/types";
import { FREQUENCIES } from "@/lib/types";
import { SAMPLE_ROOMS } from "@/lib/seed";

function asFrequency(v: FormDataEntryValue | null): Frequency {
  const s = String(v ?? "");
  if ((FREQUENCIES as string[]).includes(s)) return s as Frequency;
  return "weekly";
}

// ---- Rooms --------------------------------------------------------------

export async function createRoom(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const supabase = createServerClient();
  const householdId = await getOrCreateHouseholdId();
  await supabase.from("rooms").insert({ household_id: householdId, name });
  revalidatePath("/rooms");
  revalidatePath("/dashboard");
}

export async function deleteRoom(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createServerClient();
  await supabase.from("rooms").delete().eq("id", id);
  revalidatePath("/rooms");
  revalidatePath("/dashboard");
  redirect("/rooms");
}

// ---- People -------------------------------------------------------------

const PALETTE = [
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
];

export async function createPerson(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "");
  if (!name) return;
  const supabase = createServerClient();
  const householdId = await getOrCreateHouseholdId();
  const finalColor =
    color && /^#[0-9a-f]{6}$/i.test(color)
      ? color
      : PALETTE[Math.floor(Math.random() * PALETTE.length)];
  await supabase
    .from("people")
    .insert({ household_id: householdId, name, color: finalColor });
  revalidatePath("/members");
  revalidatePath("/dashboard");
}

export async function deletePerson(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createServerClient();
  await supabase.from("people").delete().eq("id", id);
  revalidatePath("/members");
  revalidatePath("/dashboard");
}

// ---- Tasks --------------------------------------------------------------

export async function createTask(formData: FormData) {
  const room_id = String(formData.get("room_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const frequency = asFrequency(formData.get("frequency"));
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const assigned_to = String(formData.get("assigned_to") ?? "") || null;
  if (!room_id || !title) return;
  const supabase = createServerClient();
  const householdId = await getOrCreateHouseholdId();
  await supabase.from("tasks").insert({
    household_id: householdId,
    room_id,
    title,
    frequency,
    notes,
    assigned_to,
  });
  revalidatePath(`/rooms/${room_id}`);
  revalidatePath("/dashboard");
}

export async function updateTask(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const frequency = asFrequency(formData.get("frequency"));
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const assigned_to = String(formData.get("assigned_to") ?? "") || null;
  if (!id || !title) return;
  const supabase = createServerClient();
  const { data } = await supabase
    .from("tasks")
    .update({ title, frequency, notes, assigned_to })
    .eq("id", id)
    .select("room_id")
    .single();
  if (data?.room_id) revalidatePath(`/rooms/${data.room_id}`);
  revalidatePath("/dashboard");
}

export async function deleteTask(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const room_id = String(formData.get("room_id") ?? "");
  if (!id) return;
  const supabase = createServerClient();
  await supabase.from("tasks").delete().eq("id", id);
  revalidatePath(`/rooms/${room_id}`);
  revalidatePath("/dashboard");
}

export async function completeTask(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createServerClient();
  const householdId = await getOrCreateHouseholdId();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("task_completions").insert({
    task_id: id,
    household_id: householdId,
    completed_by: user?.id ?? null,
  });
  revalidatePath("/dashboard");
  // also revalidate any room page – cheap broad invalidation
  revalidatePath("/rooms", "layout");
}

export async function uncompleteTask(formData: FormData) {
  // Removes the most recent completion for this task (undo button)
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createServerClient();
  const { data: latest } = await supabase
    .from("task_completions")
    .select("id")
    .eq("task_id", id)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest?.id) {
    await supabase.from("task_completions").delete().eq("id", latest.id);
  }
  revalidatePath("/dashboard");
  revalidatePath("/rooms", "layout");
}

// ---- Seed sample data ---------------------------------------------------

/**
 * Inserts the starter rooms + tasks into the user's household.
 * Skips rooms that already exist (matched by name).
 */
export async function seedSampleData() {
  const supabase = createServerClient();
  const householdId = await getOrCreateHouseholdId();

  const { data: existingRooms = [] } = await supabase
    .from("rooms")
    .select("id, name")
    .eq("household_id", householdId);
  const have = new Set((existingRooms ?? []).map((r) => r.name.toLowerCase()));

  for (const room of SAMPLE_ROOMS) {
    if (have.has(room.name.toLowerCase())) continue;
    const { data: r, error: rErr } = await supabase
      .from("rooms")
      .insert({ household_id: householdId, name: room.name })
      .select("id")
      .single();
    if (rErr || !r) continue;
    if (room.tasks.length === 0) continue;
    await supabase.from("tasks").insert(
      room.tasks.map((t) => ({
        household_id: householdId,
        room_id: r.id,
        title: t.title,
        frequency: t.frequency,
        notes: t.notes ?? null,
      })),
    );
  }
  revalidatePath("/rooms");
  revalidatePath("/dashboard");
}

// ---- Household ----------------------------------------------------------

export async function updateHouseholdName(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;
  const supabase = createServerClient();
  await supabase.from("households").update({ name }).eq("id", id);
  revalidatePath("/settings");
}
