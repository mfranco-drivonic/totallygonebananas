"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getViewer } from "@/lib/queries";

const uuid = z.uuid();

export async function toggleSave(recipeId: string): Promise<{ ok: boolean; saved?: boolean; error?: string }> {
  if (!uuid.safeParse(recipeId).success) return { ok: false, error: "Unknown recipe." };
  const { userId } = await getViewer();
  if (!userId) return { ok: false, error: "signin" };
  const supabase = await createClient();
  const { data: existing } = await supabase.from("saves").select("recipe_id").eq("user_id", userId).eq("recipe_id", recipeId).maybeSingle();
  const { error } = existing
    ? await supabase.from("saves").delete().eq("user_id", userId).eq("recipe_id", recipeId)
    : await supabase.from("saves").insert({ user_id: userId, recipe_id: recipeId });
  if (error) return { ok: false, error: "Couldn't update your saves." };
  revalidatePath("/profile");
  return { ok: true, saved: !existing };
}

const cookInput = z.object({
  recipeId: z.uuid(),
  rating: z.number().int().min(1, "Pick a rating from 1 to 5 bananas").max(5),
  tip: z.string().trim().max(280, "Keep tips under 280 characters").default(""),
});

export async function logCook(raw: unknown): Promise<{ ok: boolean; error?: string }> {
  const parsed = cookInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your rating." };
  const { userId } = await getViewer();
  if (!userId) return { ok: false, error: "signin" };
  const supabase = await createClient();
  const { recipeId, rating, tip } = parsed.data;
  const { error } = await supabase.from("cook_logs").insert({ user_id: userId, recipe_id: recipeId, rating, tip: tip || null });
  if (error) return { ok: false, error: "Couldn't save your rating." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCookLog(id: string): Promise<{ ok: boolean }> {
  if (!uuid.safeParse(id).success) return { ok: false };
  const supabase = await createClient();
  const { error } = await supabase.from("cook_logs").delete().eq("id", id);
  revalidatePath("/", "layout");
  return { ok: !error };
}
