import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { listPosts } from "@/lib/queries";
import { shortDate } from "@/lib/format";
import { publicUrl } from "@/lib/media";

export const metadata: Metadata = {
  title: "Blog",
  description: "Stories, tips, and banana news from Totally Gone Bananas.",
};

export default async function BlogPage() {
  const posts = await listPosts({ publishedOnly: true });

  return (
    <div className="wrap">
      <div className="page-head">
        <h1>Blog</h1>
        <p className="lede">Stories, tips, and peel-worthy news.</p>
      </div>
      {posts.length === 0 ? (
        <div className="empty"><p>No posts yet. Check back soon.</p></div>
      ) : (
        <ul className="blog-grid">
          {posts.map((p) => {
            const cover = publicUrl(p.cover_path);
            return (
              <li key={p.id} className="blog-card">
                {cover && (
                  <Link href={`/blog/${p.slug}`} className="blog-card-media" tabIndex={-1} aria-hidden>
                    <Image src={cover} alt="" width={640} height={360} unoptimized />
                  </Link>
                )}
                <div className="blog-card-body">
                  <h2><Link href={`/blog/${p.slug}`}>{p.title}</Link></h2>
                  {p.excerpt && <p>{p.excerpt}</p>}
                  {p.published_at && <p className="muted">{shortDate(p.published_at)}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div style={{ height: "3rem" }} />
    </div>
  );
}
