import { readdir } from "fs/promises";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";

const IMAGE_EXT = /\.(webp|png|jpe?g|gif|avif)$/i;

async function listSliderImages(subdir: string, urlPrefix: string): Promise<string[]> {
  const dir = path.join(process.cwd(), "public", "main-slider", subdir);
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && IMAGE_EXT.test(entry.name) && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b))
      .map((file) => `${urlPrefix}/${file}`);
  } catch {
    return [];
  }
}

/** Images in /public/main-slider (top level only — not /dark). Auto-includes new files. */
export async function getMainSliderImages(): Promise<string[]> {
  noStore();
  return listSliderImages("", "/main-slider");
}

/** Images in /public/main-slider/dark. Auto-includes new files. */
export async function getDarkMainSliderImages(): Promise<string[]> {
  noStore();
  return listSliderImages("dark", "/main-slider/dark");
}

/** Pick one path at random for this request (changes on refresh). */
export function pickRandomSlide(slides: string[]): string | null {
  if (!slides.length) return null;
  return slides[Math.floor(Math.random() * slides.length)] ?? null;
}
