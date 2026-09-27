"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/queries";
import { fieldErrors, profileInput } from "@/lib/validation";

export async function updateProfile(raw: unknown): Promise<{ ok: true } | { ok: false; errors: Record<string, string> }> {
  const parsed = profileInput.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const { userId } = await getViewer();
  if (!userId) return { ok: false, errors: { form: "Please sign in again." } };
  const { displayName, username, bio, avatarPath } = parsed.data;
  if (avatarPath && !avatarPath.startsWith(`${userId}/`)) return { ok: false, errors: { avatarPath: "Upload your photo again." } };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, username: username || null, bio: bio || null, avatar_path: avatarPath })
    .eq("id", userId);
  if (error) {
    if (error.code === "23505") return { ok: false, errors: { username: "That username is taken." } };
    return { ok: false, errors: { form: "Couldn't save your profile." } };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
