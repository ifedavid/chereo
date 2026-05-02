import { createServerClient } from "@/lib/supabase/server";

/**
 * Returns the current user's household ID, creating one on first sign-in.
 * Throws if there is no logged-in user.
 */
export async function getOrCreateHouseholdId(): Promise<string> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Already a member?
  const { data: existing } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existing?.household_id) return existing.household_id;

  // Create a new household + add the user as owner
  const { data: hh, error: hhErr } = await supabase
    .from("households")
    .insert({
      name: defaultHouseholdName(user.email ?? ""),
      owner_id: user.id,
    })
    .select("id")
    .single();
  if (hhErr || !hh) throw hhErr ?? new Error("Could not create household");

  const { error: memErr } = await supabase
    .from("household_members")
    .insert({
      household_id: hh.id,
      user_id: user.id,
      role: "owner",
    });
  if (memErr) throw memErr;

  // Seed a default "Me" person so something is assignable from minute one
  await supabase
    .from("people")
    .insert({
      household_id: hh.id,
      name: defaultPersonName(user.email ?? ""),
      color: "#0ea5e9",
    });

  return hh.id;
}

function defaultHouseholdName(email: string) {
  const handle = email.split("@")[0]?.split(".")[0] ?? "My";
  return `${capitalize(handle)}'s home`;
}

function defaultPersonName(email: string) {
  const handle = email.split("@")[0]?.split(".")[0] ?? "Me";
  return capitalize(handle);
}

function capitalize(s: string) {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}
