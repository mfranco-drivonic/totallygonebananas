/** Cookie that stores invite attribution (utm_content / username) until a recipe is submitted. */
export const REFERRAL_COOKIE = "tgb_ref";

const REF_RE = /^[a-z0-9_-]{1,64}$/i;

export function sanitizeReferral(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim().slice(0, 64);
  return REF_RE.test(value) ? value : null;
}

/** Prefer a stable, readable username in invite UTMs. */
export function referralHandle(profile: { username: string | null; display_name: string | null }, userId: string): string {
  if (profile.username) return profile.username;
  const fromName = (profile.display_name || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
  return fromName || userId;
}
