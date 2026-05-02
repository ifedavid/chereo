import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import TaskRow from "@/components/TaskRow";
import Empty from "@/components/Empty";
import {
  createTask,
  deleteRoom,
  deleteTask,
} from "@/app/(app)/_actions";
import { getOrCreateHouseholdId } from "@/lib/household";
import { loadTasksForHousehold } from "@/lib/queries";
import { nextDueAt } from "@/lib/schedule";
import { FREQUENCIES, FREQUENCY_LABEL, type Person } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  const householdId = await getOrCreateHouseholdId();
  const { rooms, tasks, people, doneTodayTaskIds } =
    await loadTasksForHousehold(householdId);

  const room = rooms.find((r) => r.id === params.roomId);
  if (!room) notFound();

  const peopleById = new Map<string, Person>(people.map((p) => [p.id, p]));
  const roomTasks = tasks.filter((t) => t.room_id === room.id);
  const now = new Date();

  return (
    <>
      <div className="mb-1">
        <Link href="/rooms" className="text-sm text-muted hover:text-ink">
          ← Rooms
        </Link>
      </div>
      <PageHeader
        title={room.name}
        subtitle={`${roomTasks.length} task${
          roomTasks.length === 1 ? "" : "s"
        }`}
        action={
          <form action={deleteRoom}>
            <input type="hidden" name="id" value={room.id} />
            <button
              type="submit"
              className="btn-danger text-sm"
              aria-label="Delete room"
            >
              Delete room
            </button>
          </form>
        }
      />

      <details className="card p-4 mb-6 group">
        <summary className="cursor-pointer font-medium select-none flex items-center justify-between">
          <span>Add a task</span>
          <span className="text-muted text-sm group-open:rotate-90 transition">
            ›
          </span>
        </summary>
        <form action={createTask} className="mt-4 space-y-3">
          <input type="hidden" name="room_id" value={room.id} />
          <div>
            <label className="label" htmlFor="title">
              What needs doing?
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="e.g. Hoover the floors"
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="frequency">
                How often?
              </label>
              <select
                id="frequency"
                name="frequency"
                defaultValue="weekly"
                className="input"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {FREQUENCY_LABEL[f]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="assigned_to">
                Assign to
              </label>
              <select
                id="assigned_to"
                name="assigned_to"
                defaultValue=""
                className="input"
              >
                <option value="">— Anyone —</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="notes">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Wet wipe, then dry flannel."
              className="input"
            />
          </div>
          <button type="submit" className="btn-primary">
            Add task
          </button>
        </form>
      </details>

      {roomTasks.length === 0 ? (
        <Empty
          title="No tasks in this room yet"
          hint="Use the form above to add your first one."
        />
      ) : (
        <div className="card divide-y divide-line">
          {roomTasks.map((t) => (
            <div key={t.id}>
              <div className="flex items-stretch">
                <div className="flex-1 min-w-0">
                  <TaskRow
                    task={t}
                    assignee={
                      t.assigned_to
                        ? peopleById.get(t.assigned_to) ?? null
                        : null
                    }
                    lastCompletedAt={t.lastCompletedAt}
                    nextDue={nextDueAt(t.frequency, t.lastCompletedAt, now)}
                    doneRecently={doneTodayTaskIds.has(t.id)}
                  />
                </div>
                <form action={deleteTask} className="flex items-center pr-3">
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="room_id" value={room.id} />
                  <button
                    type="submit"
                    aria-label="Delete task"
                    className="text-muted hover:text-red-600 text-sm px-1"
                  >
                    ✕
                  </button>
                </form>
              </div>
              {t.notes && (
                <p className="px-12 pb-3 -mt-1 text-sm text-muted">
                  {t.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
