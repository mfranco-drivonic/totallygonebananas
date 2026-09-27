import type { Metadata } from "next";
import { getCategories, getViewer, isAdminRole } from "@/lib/queries";
import { CategoryAdmin } from "@/components/CategoryAdmin";

export const metadata: Metadata = { title: "Admin · Categories" };

export default async function AdminCategoriesPage() {
  const [{ profile }, categories] = await Promise.all([getViewer(), getCategories()]);
  return (
    <>
      <div className="sec-head">
        <div>
          <h2>Categories</h2>
          <p>Organize recipes. Edits save when you leave a field.{isAdminRole(profile) ? " Select one or many to edit, clone, or delete." : ""}</p>
        </div>
      </div>
      <CategoryAdmin categories={categories} isAdmin={isAdminRole(profile)} />
    </>
  );
}
