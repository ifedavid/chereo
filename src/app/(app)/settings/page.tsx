import PageHeader from "@/components/PageHeader";
import { createServerClient } from "@/lib/supabase/server";
import { getOrCreateHouseholdId } from "@/lib/household";
import { updateHouseholdName } from "@/app/(app)/_actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const householdId = await getOrCreateHouseholdId();
  const supabase = createServerClient();
  const [{ data: hh }, userRes] = await Promise.all([
    supabase.from("households").select("*").eq("id", householdId).single(),
    supabase.auth.getUser(),
  ]);

  return (
    <>
      <PageHeader title="Settings" />

      <form action={updateHouseholdName} className="card p-4 mb-6 space-y-3">
        <input type="hidden" name="id" value={householdId} />
        <div>
          <label className="label" htmlFor="name">
            Household name
          </label>
          <input
            id="name"
            name="name"
            defaultValue={hh?.name ?? ""}
            className="input"
          />
        </div>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </form>

      <div className="card p-4 space-y-2">
        <div>
          <div className="text-xs text-muted uppercase tracking-wide">
            Signed in as
          </div>
          <div className="font-medium">{userRes.data.user?.email}</div>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="btn-ghost mt-2">
            Sign out
          </button>
        </form>
      </div>

      <p className="text-xs text-muted text-center mt-8">
        Choreo · v0.1
      </p>
    </>
  );
}
