import { headers } from "next/headers";
export { plural, shortDate } from "@/lib/format";

/** The site's own origin, from NEXT_PUBLIC_SITE_URL or the current request. */
export async function siteUrlSafe() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
