import Link from "next/link";
import { getCategories, listRecipes } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { CategoryStickers } from "@/components/CategoryStickers";
import { RecipeGrid } from "@/components/RecipeGrid";
import { HeroSlide } from "@/components/HeroSlide";
import { MediaView } from "@/components/MediaView";
import { timeLabel } from "@/lib/format";
import { getDarkMainSliderImages, getMainSliderImages, pickRandomSlide } from "@/lib/main-slider";

/** Recipe of the day: the same pick for everyone for 24 hours (UTC). */
function recipeOfTheDay<T>(list: T[]): T | null {
  if (!list.length) return null;
  const day = Math.floor(new Date().getTime() / 864e5);
  return list[(day * 7 + 3) % list.length];
}

async function categoryCounts() {
  const supabase = await createClient();
  const { data } = await supabase.from("recipes").select("category_id").eq("status", "published");
  const m = new Map<string, number>();
  data?.forEach((r) => r.category_id && m.set(r.category_id, (m.get(r.category_id) ?? 0) + 1));
  return m;
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const active = typeof sp.category === "string" ? sp.category : undefined;
  const [categories, counts, latest, all, lightSlides, darkSlides] = await Promise.all([
    getCategories(),
    categoryCounts(),
    listRecipes({ category: active, limit: 8 }),
    listRecipes({ limit: 200, sort: "az" }),
    getMainSliderImages(),
    getDarkMainSliderImages(),
  ]);
  const cat = categories.find((c) => c.id === active);
  const heroLight = pickRandomSlide(lightSlides);
  const heroDark = pickRandomSlide(darkSlides);

  const rotd = recipeOfTheDay(all);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>What are we going bananas for today?</h1>
            <p className="lede">Pick a craving and dig in. New recipes land here all the time, so check back often.</p>
            <CategoryStickers categories={categories.filter((c) => counts.get(c.id))} counts={counts} active={active} hrefFor={(id) => (id ? `/?category=${id}#latest` : "/#latest")} />
          </div>
          <div className="mascot-wrap">
            <div className="bubble">
              <strong>{cat ? cat.name : "All recipes"}</strong>
              <span>{cat?.tagline ?? `${all.length} ways to go bananas.`}</span>
            </div>
            <HeroSlide lightSrc={heroLight} darkSrc={heroDark} />
          </div>
        </div>
      </section>

      <section className="block" id="latest" aria-labelledby="latest-h">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <h2 id="latest-h">{cat ? cat.name : "Fresh from the kitchen"}</h2>
              <p>{cat ? cat.tagline : "The newest recipes on the site."}</p>
            </div>
            <Link className="btn ghost" href={cat ? `/recipes?category=${cat.id}` : "/recipes"}>Browse and filter</Link>
          </div>
          <RecipeGrid recipes={latest} showCategory={!cat} empty={<div className="empty"><span className="big">🍌</span><p>No recipes here yet.</p><Link className="btn" href="/recipes/new">Share the first one</Link></div>} />
        </div>
      </section>

      {rotd && (
        <section className="block" aria-labelledby="rotd-h" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <article className="rotd">
              <div className="emo" aria-hidden="true">
                {rotd.cover_path ? <MediaView path={rotd.cover_path} alt="" sizes="160px" /> : rotd.emoji || "🍌"}
              </div>
              <div>
                <p className="kicker">Recipe of the day</p>
                <h2 id="rotd-h">{rotd.title}</h2>
                {rotd.description && <p>{rotd.description}</p>}
                <div className="actions">
                  <Link className="btn dark" href={`/recipes/${rotd.slug}`}>See the recipe</Link>
                  {timeLabel(rotd.total_minutes, rotd.time_note) && <span className="pill">{timeLabel(rotd.total_minutes, rotd.time_note)}</span>}
                </div>
              </div>
            </article>
          </div>
        </section>
      )}
    </>
  );
}
