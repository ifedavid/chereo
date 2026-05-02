"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Today", icon: "🏠" },
  { href: "/rooms", label: "Rooms", icon: "🚪" },
  { href: "/members", label: "People", icon: "👥" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <>
      {/* Top bar (desktop) */}
      <header className="hidden md:flex sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-line">
        <div className="max-w-3xl mx-auto w-full px-6 py-3 flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="h-7 w-7 rounded-lg bg-accent text-white grid place-items-center text-sm">
              C
            </span>
            Choreo
          </Link>
          <nav className="flex gap-1 ml-4">
            {items.map((it) => {
              const active = pathname.startsWith(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    active
                      ? "bg-bgsoft text-ink font-medium"
                      : "text-muted hover:text-ink hover:bg-bgsoft"
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Bottom tab bar (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-line pb-[env(safe-area-inset-bottom)]">
        <ul className="grid grid-cols-4">
          {items.map((it) => {
            const active = pathname.startsWith(it.href);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {it.icon}
                  </span>
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
