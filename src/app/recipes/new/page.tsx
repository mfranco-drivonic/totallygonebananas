import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCategories, getViewer, isEditorRole } from "@/lib/queries";
import { RecipeForm } from "@/components/RecipeForm";

export const metadata: Metadata = { title: "Share a recipe" };

export default async function NewRecipePage() {
  const [{ userId, profile }, categories] = await Promise.all([getViewer(), getCategories()]);
  if (!userId) redirect("/login?next=/recipes/new");
  const editor = isEditorRole(profile);
  return (
    <div className="wrap narrow">
      <div className="page-head">
        <h1>Share a recipe</h1>
        <p className="lede">
          Add photos or a video, list the ingredients, and walk us through the steps.
          {editor ? " As an editor, you can publish it straight away." : " An editor gives it a quick look before it goes live."}
        </p>
      </div>
      <RecipeForm userId={userId} isEditor={editor} categories={categories} />
    </div>
  );
}
