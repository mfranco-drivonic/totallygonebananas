export const AUTH_NEXT_COOKIE = "tgb-auth-next";

/** Path-only post-login destination, or null if unsafe. */
export function sanitizeAuthNext(raw: string | null | undefined, requestOrigin?: string): string | null {
  if (!raw) return null;
  const decoded = (() => {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();
  if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded;
  if (!requestOrigin) return null;
  try {
    const asUrl = new URL(decoded);
    if (asUrl.origin === requestOrigin) {
      return `${asUrl.pathname}${asUrl.search}` || "/profile";
    }
  } catch {
    /* ignore */
  }
  return null;
}
