import Link from "next/link";
import { completeTask, uncompleteTask } from "@/app/(app)/_actions";
import FrequencyChip from "./FrequencyChip";
import PersonAvatar from "./PersonAvatar";
import type { Person, Task } from "@/lib/types";
import { relativeDueLabel, isDueOrOverdue } from "@/lib/schedule";

export type TaskRowProps = {
  task: Task & { roomName?: string };
  assignee: Person | null;
  lastCompletedAt: Date | null;
  nextDue: Date;
  showRoom?: boolean;
  doneRecently?: boolean;
};

export default function TaskRow({
  task,
  assignee,
  nextDue,
  showRoom,
  doneRecently,
}: TaskRowProps) {
  const due = isDueOrOverdue(nextDue);

  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <form action={doneRecently ? uncompleteTask : completeTask}>
        <input type="hidden" name="id" value={task.id} />
        <button
          type="submit"
          aria-label={doneRecently ? "Undo complete" : "Mark complete"}
          className={`h-6 w-6 shrink-0 rounded-full border-2 grid place-items-center transition ${
            doneRecently
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-line hover:border-accent"
          }`}
        >
          {doneRecently && (
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 011.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </form>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-medium truncate ${
              doneRecently ? "line-through text-muted" : ""
            }`}
          >
            {task.title}
          </span>
          <FrequencyChip frequency={task.frequency} />
          {showRoom && task.roomName && (
            <Link
              href={`/rooms/${task.room_id}`}
              className="text-xs text-muted hover:text-ink"
            >
              · {task.roomName}
            </Link>
          )}
        </div>
        <div className="text-xs text-muted mt-0.5 flex items-center gap-2">
          <span className={due && !doneRecently ? "text-red-600 font-medium" : ""}>
            {doneRecently ? "Done today" : relativeDueLabel(nextDue)}
          </span>
          {assignee && (
            <span className="flex items-center gap-1">
              · <PersonAvatar person={assignee} size={16} />{" "}
              <span>{assignee.name}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
