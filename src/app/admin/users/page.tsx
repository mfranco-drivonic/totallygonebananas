import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer, isAdminRole, listProfiles } from "@/lib/queries";
import { UserRoleSelect } from "@/components/UserRoleSelect";
import { shortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Admin · Users" };

export default async function AdminUsersPage() {
  const { userId, profile } = await getViewer();
  if (!isAdminRole(profile)) redirect("/admin");
  const profiles = await listProfiles();

  return (
    <>
      <div className="sec-head">
        <div>
          <h2>Users & roles</h2>
          <p>Admins can promote editors. Members submit recipes for review; editors can publish.</p>
        </div>
      </div>
      {profiles.length === 0 ? (
        <div className="empty"><p>No members yet. Sign in once to create your profile, then come back.</p></div>
      ) : (
        <ul className="rows">
          {profiles.map((p) => (
            <li key={p.id} className="row">
              <div>
                <h3>{p.display_name || p.username || "Unnamed"}</h3>
                <p className="muted">{p.username ? `@${p.username}` : p.id.slice(0, 8)} · joined {shortDate(p.created_at)}</p>
              </div>
              <UserRoleSelect profile={p} disabled={p.id === userId} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
