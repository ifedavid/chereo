"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const from = String(formData.get("from") ?? "/dashboard");
  if (!email) {
    redirect("/login?error=Please+enter+an+email+address");
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const supabase = createServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(from)}`,
    },
  });

  if (error) {
    const rawMessage = String(error?.message ?? error ?? "An error occurred");
    // Detect rate-limit / too-many-requests and show a friendly message
    if (error?.status === 429 || /rate limit|too many requests/i.test(rawMessage)) {
      const rateMsg = encodeURIComponent(
        "Too many requests — please wait a few minutes and check your inbox."
      );
      redirect(`/login?error=${rateMsg}`);
    }

    redirect(`/login?error=${encodeURIComponent(rawMessage)}`);
  }
  const infoMessage = encodeURIComponent("Check your inbox for the magic link.");
  redirect(`/login?sent=1&message=${infoMessage}`);
}
