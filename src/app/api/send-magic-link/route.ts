import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim();
    const from = String(body.from ?? "/dashboard");

    if (!email) {
      return NextResponse.json({ error: "Please enter an email address" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const supabase = createServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(from)}`,
      },
    });

    if (error) {
      const rawMessage = String(error?.message ?? error ?? "An error occurred");
      // Detect rate-limit and return friendly message
      if (error?.status === 429 || /rate limit|too many requests/i.test(rawMessage)) {
        return NextResponse.json(
          { error: "Too many requests — please wait a few minutes and check your inbox." },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: rawMessage }, { status: error?.status ?? 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
