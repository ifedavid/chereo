import PageHeader from "@/components/PageHeader";
import Empty from "@/components/Empty";
import PersonAvatar from "@/components/PersonAvatar";
import { getOrCreateHouseholdId } from "@/lib/household";
import { loadTasksForHousehold } from "@/lib/queries";
import { createPerson, deletePerson } from "@/app/(app)/_actions";

const COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
];

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const householdId = await getOrCreateHouseholdId();
  const { people, tasks } = await loadTasksForHousehold(householdId);

  const taskCount = new Map<string, number>();
  for (const t of tasks) {
    if (t.assigned_to) {
      taskCount.set(t.assigned_to, (taskCount.get(t.assigned_to) ?? 0) + 1);
    }
  }

  return (
    <>
      <PageHeader
        title="People"
        subtitle="Who lives here. Anyone listed can be assigned tasks."
      />

      <form action={createPerson} className="card p-4 mb-6 space-y-3">
        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="e.g. Mum, Dad, Tobi"
            className="input"
          />
        </div>
        <div>
          <span className="label">Colour</span>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c, i) => (
              <label
                key={c}
                className="cursor-pointer"
                style={{ display: "inline-block" }}
              >
                <input
                  type="radio"
                  name="color"
                  value={c}
                  defaultChecked={i === 0}
                  className="sr-only peer"
                />
                <span
                  className="block h-7 w-7 rounded-full ring-2 ring-transparent peer-checked:ring-ink"
                  style={{ backgroundColor: c }}
                />
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="btn-primary">
          Add person
        </button>
      </form>

      {people.length === 0 ? (
        <Empty title="No people yet" hint="Add at least one to assign tasks." />
      ) : (
        <div className="card divide-y divide-line">
          {people.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <PersonAvatar person={p} size={36} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-muted">
                  {taskCount.get(p.id) ?? 0} task
                  {(taskCount.get(p.id) ?? 0) === 1 ? "" : "s"} assigned
                </div>
              </div>
              <form action={deletePerson}>
                <input type="hidden" name="id" value={p.id} />
                <button
                  type="submit"
                  aria-label="Remove person"
                  className="text-muted hover:text-red-600 text-sm"
                >
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
