import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Empty from "@/components/Empty";
import TaskRow from "@/components/TaskRow";
import { getOrCreateHouseholdId } from "@/lib/household";
import { loadTasksForHousehold } from "@/lib/queries";
import { bucketFor, nextDueAt, type DueBucket } from "@/lib/schedule";
import type { Person } from "@/lib/types";

const BUCKET_TITLE: Record<DueBucket, string> = {
  overdue: "Overdue",
  today: "Today",
  "this-week": "This week",
  later: "Later",
};

const BUCKET_ORDER: DueBucket[] = ["overdue", "today", "this-week", "later"];

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const householdId = await getOrCreateHouseholdId();
  const { tasks, rooms, people, doneTodayTaskIds } =
    await loadTasksForHousehold(householdId);

  const peopleById = new Map<string, Person>(people.map((p) => [p.id, p]));

  if (rooms.length === 0) {
    return (
      <>
        <PageHeader title="Today" subtitle="What needs doing right now." />
        <Empty
          title="Set up your home"
          hint="Add a room and a task or two to start tracking what's due."
          action={
            <Link href="/rooms" className="btn-primary">
              Add your first room
            </Link>
          }
        />
      </>
    );
  }

  if (tasks.length === 0) {
    return (
      <>
        <PageHeader title="Today" subtitle="What needs doing right now." />
        <Empty
          title="No tasks yet"
          hint="Open a room and add a task. We'll roll it up here when it's due."
          action={
            <Link href="/rooms" className="btn-primary">
              Browse rooms
            </Link>
          }
        />
      </>
    );
  }

  const now = new Date();
  // Items "done today" appear in their own little stack at the top with undo.
  const doneToday = tasks.filter((t) => doneTodayTaskIds.has(t.id));
  const pending = tasks.filter((t) => !doneTodayTaskIds.has(t.id));

  const grouped: Record<DueBucket, typeof tasks> = {
    overdue: [],
    today: [],
    "this-week": [],
    later: [],
  };
  for (const t of pending) {
    const due = nextDueAt(t.frequency, t.lastCompletedAt, now);
    grouped[bucketFor(due, now)].push(t);
  }

  const totalActionable =
    grouped.overdue.length + grouped.today.length + grouped["this-week"].length;

  return (
    <>
      <PageHeader
        title="Today"
        subtitle={
          totalActionable === 0
            ? "All caught up. 🎉"
            : `${totalActionable} task${totalActionable === 1 ? "" : "s"} to do this week`
        }
      />

      <div className="space-y-6">
        {BUCKET_ORDER.map((bucket) => {
          const list = grouped[bucket];
          if (list.length === 0) return null;
          return (
            <section key={bucket}>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
                {BUCKET_TITLE[bucket]}
              </h2>
              <div className="card divide-y divide-line">
                {list.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    assignee={t.assigned_to ? peopleById.get(t.assigned_to) ?? null : null}
                    lastCompletedAt={t.lastCompletedAt}
                    nextDue={nextDueAt(t.frequency, t.lastCompletedAt, now)}
                    showRoom
                  />
                ))}
              </div>
            </section>
          );
        })}

        {doneToday.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
              Done today
            </h2>
            <div className="card divide-y divide-line">
              {doneToday.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  assignee={t.assigned_to ? peopleById.get(t.assigned_to) ?? null : null}
                  lastCompletedAt={t.lastCompletedAt}
                  nextDue={nextDueAt(t.frequency, t.lastCompletedAt, now)}
                  showRoom
                  doneRecently
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
