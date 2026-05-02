"use client";

import { useState } from "react";

export default function MagicLinkForm({ defaultFrom = "/dashboard" }: { defaultFrom?: string }) {
  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function startCooldown(seconds = 60) {
    setCooldown(seconds);
    const id = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || cooldown > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, from: defaultFrom }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "An error occurred");
        // If rate-limited, start a longer cooldown
        if (res.status === 429) startCooldown(300); // 5 minutes
      } else {
        setSent(true);
        startCooldown(60);
      }
    } catch (err) {
      setError("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-sm">
        <p className="font-medium">Check your email</p>
        <p className="text-muted mt-1">We sent you a sign-in link. It opens straight into Choreo — no password needed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="from" value={defaultFrom} />
      <div>
        <label htmlFor="email" className="label">Email address</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={!!loading || cooldown > 0}>
        {cooldown > 0 ? `Wait ${cooldown}s` : loading ? "Sending…" : "Send sign-in link"}
      </button>
      <p className="text-xs text-muted text-center">We&apos;ll email a one-tap link. No passwords to remember.</p>
    </form>
  );
}
