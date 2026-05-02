import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Empty from "@/components/Empty";
import { getOrCreateHouseholdId } from "@/lib/household";
import { loadTasksForHousehold } from "@/lib/queries";
import { createRoom, seedSampleData } from "@/app/(app)/_actions";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const householdId = await getOrCreateHouseholdId();
  const { rooms, tasks } = await loadTasksForHousehold(householdId);

  const counts = new Map<string, number>();
  for (const t of tasks) {
    counts.set(t.room_id, (counts.get(t.room_id) ?? 0) + 1);
  }

  return (
    <>
      <PageHeader title="Rooms" subtitle="Organise tasks by where they live." />

      <form action={createRoom} className="card p-4 mb-6 flex gap-2">
        <input
          name="name"
          required
          placeholder="Add a room (e.g. Sitting Room)"
          className="input"
        />
        <button type="submit" className="btn-primary">
          Add
        </button>
      </form>

      {rooms.length === 0 ? (
        <div className="space-y-3">
          <Empty
            title="No rooms yet"
            hint="Add a room above, or start from a template."
          />
          <form action={seedSampleData} className="text-center">
            <button type="submit" className="btn-ghost">
              Use sample tasks (Sitting Room, Kitchen, Bathroom)
            </button>
          </form>
        </div>
      ) : (
        <div className="card divide-y divide-line">
          {rooms.map((r) => (
            <Link
              key={r.id}
              href={`/rooms/${r.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-bgsoft"
            >
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted">
                  {counts.get(r.id) ?? 0} task
                  {(counts.get(r.id) ?? 0) === 1 ? "" : "s"}
                </div>
              </div>
              <span className="text-muted">›</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
