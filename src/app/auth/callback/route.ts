import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

/** Finishes sign-in for magic links and OAuth, then sends the user where they were headed. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const rawNext = url.searchParams.get("next") ?? "/profile";
  const decoded = (() => {
    try {
      return decodeURIComponent(rawNext);
    } catch {
      return rawNext;
    }
  })();
  const next = decoded.startsWith("/") && !decoded.startsWith("//") ? decoded : "/profile";

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  // Build the redirect response first so session cookies are written onto it
  // (cookies().set alone can be dropped on a bare redirect in App Router).
  let response = NextResponse.redirect(new URL(next, url.origin));
  const { url: supabaseUrl, key } = getSupabaseEnv();

  const supabase = createServerClient(supabaseUrl, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.redirect(new URL(next, url.origin));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing code") };

  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth", url.origin));
  }
  return response;
}
