import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { shortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Admin · Referrals" };

export default async function AdminReferralsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recipes")
    .select("id, slug, title, status, referred_by, created_at, author:profiles!recipes_author_id_fkey(display_name, username)")
    .not("referred_by", "is", null)
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as unknown as {
    id: string;
    slug: string;
    title: string;
    status: string;
    referred_by: string;
    created_at: string;
    author: { display_name: string | null; username: string | null } | null;
  }[];

  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.referred_by, (counts.get(r.referred_by) ?? 0) + 1);
  const leaderboard = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      <div className="sec-head">
        <div>
          <h2>Referrals</h2>
          <p>Recipe submissions attributed via invite links (<code>utm_content</code> = username).</p>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="empty">
          <p>No referred submissions yet. Share an invite link from My Banana Stand to start tracking.</p>
        </div>
      ) : (
        <>
          <ul className="admin-stats">
            {leaderboard.slice(0, 8).map(([handle, n]) => (
              <li key={handle} className="stat">
                <b>{n}</b>
                <span>@{handle}</span>
              </li>
            ))}
          </ul>

          <ul className="rows">
            {rows.map((r) => (
              <li key={r.id} className="row">
                <div>
                  <h3><Link href={`/recipes/${r.slug}`}>{r.title}</Link></h3>
                  <p>
                    <span className={`status s-${r.status}`}>{r.status}</span>
                    {" · "}referred by <b>@{r.referred_by}</b>
                    {" · "}author {r.author?.display_name || r.author?.username || "unknown"}
                    {" · "}{shortDate(r.created_at)}
                  </p>
                </div>
                <div className="row-actions">
                  <Link className="btn small ghost" href={`/recipes/${r.slug}`}>View</Link>
                  <Link className="btn small ghost" href={`/recipes/${r.slug}/edit`}>Edit</Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
