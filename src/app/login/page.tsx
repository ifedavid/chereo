import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import MagicLinkForm from "@/components/MagicLinkForm";

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
          <MagicLinkForm defaultFrom={searchParams.from ?? "/dashboard"} />
          {searchParams.error && (
            <p className="text-sm text-red-600 mt-3">{searchParams.error}</p>
          )}
        </div>
      </div>
    </main>
  );
}
