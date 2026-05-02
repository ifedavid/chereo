import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { sendMagicLink } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { sent?: string; error?: string; from?: string };
}) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const sent = searchParams.sent === "1";

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-accent text-white grid place-items-center text-2xl font-bold">
            C
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Choreo</h1>
          <p className="text-muted text-sm mt-1">
            Household chores, organised.
          </p>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="text-sm">
              <p className="font-medium">Check your email</p>
              <p className="text-muted mt-1">
                We sent you a sign-in link. It opens straight into Choreo — no
                password needed.
              </p>
            </div>
          ) : (
            <form action={sendMagicLink} className="space-y-4">
              <input
                type="hidden"
                name="from"
                value={searchParams.from ?? "/dashboard"}
              />
              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input"
                  placeholder="you@example.com"
                />
              </div>
              {searchParams.error && (
                <p className="text-sm text-red-600">{searchParams.error}</p>
              )}
              <button type="submit" className="btn-primary w-full">
                Send sign-in link
              </button>
              <p className="text-xs text-muted text-center">
                We&apos;ll email a one-tap link. No passwords to remember.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
