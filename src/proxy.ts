import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|mp4|webm)$).*)"],
};
