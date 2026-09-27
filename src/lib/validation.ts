import { z } from "zod";
import { MEDIA_PATH_RE } from "@/lib/media";
import { TAGS } from "@/lib/types";

const mediaRef = z.object({
  kind: z.enum(["image", "video"]),
  path: z.string().regex(MEDIA_PATH_RE, "Invalid media path"),
});

const optionalInt = (min: number, max: number, label: string) =>
  z
    .number()
    .int()
    .min(min, `${label} must be at least ${min}`)
    .max(max, `${label} must be ${max} or less`)
    .nullable();

export const recipeInput = z.object({
  title: z.string().trim().min(2, "Give your recipe a name").max(100, "Keep the name under 100 characters"),
  description: z.string().trim().max(300, "Keep the description under 300 characters").default(""),
  categoryId: z.string().min(1, "Pick a category"),
  newCategory: z
    .object({ name: z.string().trim().min(2, "Name the new category").max(40), emoji: z.string().trim().max(8).default("") })
    .nullable()
    .default(null),
  emoji: z.string().trim().max(8).default(""),
  totalMinutes: optionalInt(1, 2880, "Time"),
  timeNote: z.string().trim().max(40).default(""),
  servings: optionalInt(1, 200, "Servings"),
  difficulty: z.number().int().min(1).max(5).default(2),
  tags: z.array(z.enum(TAGS)).max(TAGS.length).default([]),
  ingredients: z
    .array(z.string().trim().min(1).max(200, "Each ingredient must be under 200 characters"))
    .min(1, "Add at least one ingredient")
    .max(80, "That's a lot of ingredients! Keep it to 80"),
  steps: z
    .array(z.object({ text: z.string().trim().min(1, "Steps can't be empty").max(1500), media: mediaRef.nullable().default(null) }))
    .min(1, "Add at least one step")
    .max(60),
  gallery: z.array(mediaRef.extend({ caption: z.string().trim().max(140).default("") })).max(12, "Up to 12 photos and videos"),
  intent: z.enum(["draft", "submit", "publish"]),
});

export type RecipeInput = z.input<typeof recipeInput>;

export const profileInput = z.object({
  displayName: z.string().trim().min(1, "Add a display name").max(60),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,24}$/, "Usernames are 3 to 24 letters, numbers, or underscores")
    .or(z.literal("")),
  bio: z.string().trim().max(280, "Keep your bio under 280 characters").default(""),
  avatarPath: z.string().regex(MEDIA_PATH_RE).nullable(),
});

export type ProfileInput = z.input<typeof profileInput>;

/** Turns zod issues into { "steps.2.text": "message" } for inline form errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
