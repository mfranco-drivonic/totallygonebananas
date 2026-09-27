import type { RecipeCardData } from "@/lib/queries";
import { getCategories, getRatings, getSavedIds, getViewer } from "@/lib/queries";
import { RecipeCard } from "@/components/RecipeCard";

/** Loads ratings and the viewer's saves for a list of recipes, then renders cards. */
export async function RecipeGrid({ recipes, showCategory = true, empty }: { recipes: RecipeCardData[]; showCategory?: boolean; empty?: React.ReactNode }) {
  const [categories, ratings, viewer] = await Promise.all([getCategories(), getRatings(recipes.map((r) => r.id)), getViewer()]);
  const saved = await getSavedIds(viewer.userId);
  if (!recipes.length) return <>{empty}</>;
  return (
    <div className="grid">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} categories={categories} rating={ratings.get(r.id)} saved={saved.has(r.id)} signedIn={!!viewer.userId} showCategory={showCategory} />
      ))}
    </div>
  );
}
