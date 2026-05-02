import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Map some common Supabase error messages to friendlier text
    const raw = String(error?.message ?? error ?? "An error occurred");
    let message = raw;
    if (/invalid|expired|access denied|session expired/i.test(raw)) {
      message = "Access denied or expired link — request a new sign-in link.";
    }
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
  }

  return NextResponse.redirect(`${origin}/login?error=Missing+code`);
}
