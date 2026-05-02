import type { Person } from "@/lib/types";

export default function PersonAvatar({
  person,
  size = 24,
}: {
  person: Pick<Person, "name" | "color">;
  size?: number;
}) {
  const initials = person.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white font-semibold"
      style={{
        backgroundColor: person.color,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
      }}
      aria-label={person.name}
    >
      {initials}
    </span>
  );
}
