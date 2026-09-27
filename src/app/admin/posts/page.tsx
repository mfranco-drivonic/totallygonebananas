import type { Metadata } from "next";
import Link from "next/link";
import { getViewer, isAdminRole, listPosts } from "@/lib/queries";
import { shortDate } from "@/lib/format";
import { AdminBulkList } from "@/components/AdminBulkList";

export const metadata: Metadata = { title: "Admin · Blog" };

export default async function AdminPostsPage() {
  const [{ profile }, posts] = await Promise.all([getViewer(), listPosts()]);
  const admin = isAdminRole(profile);

  return (
    <>
      <div className="sec-head">
        <div>
          <h2>Blog posts</h2>
          <p>
            Write updates, stories, and tips. Published posts appear on /blog.
            {admin ? " Select one or many to edit status, clone, or delete." : ""}
          </p>
        </div>
        <Link className="btn small" href="/admin/posts/new">New post</Link>
      </div>
      {posts.length === 0 ? (
        <div className="empty"><p>No posts yet.</p><Link className="btn" href="/admin/posts/new">Write the first one</Link></div>
      ) : (
        <AdminBulkList
          kind="post"
          isAdmin={admin}
          items={posts.map((p) => ({
            id: p.id,
            name: p.title,
            editHref: `/admin/posts/${p.id}/edit`,
            viewHref: p.status === "published" ? `/blog/${p.slug}` : undefined,
            status: p.status,
            detail: p.published_at ? `published ${shortDate(p.published_at)}` : `updated ${shortDate(p.updated_at)}`,
          }))}
        />
      )}
    </>
  );
}
