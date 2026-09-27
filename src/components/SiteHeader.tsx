import Image from "next/image";
import Link from "next/link";
import { getViewer } from "@/lib/queries";
import { publicUrl, AVATAR_BUCKET } from "@/lib/media";
import { NavLinks } from "@/components/NavLinks";

export async function SiteHeader() {
  const { userId, profile } = await getViewer();
  const avatar = publicUrl(profile?.avatar_path, AVATAR_BUCKET);
  const name = profile?.display_name || "You";
  return (
    <header className="top">
      <div className="wrap">
        <NavLinks side="left" />
        <Link className="brand" href="/" aria-label="Totally Gone Bananas home">
          <Image src="/logo.png" alt="" width={186} height={201} priority />
        </Link>
        <div className="top-end">
          <NavLinks side="right" />
          <div className="top-actions">
            {userId ? (
              <>
                <Link className="btn small" href="/recipes/new">Add a recipe</Link>
                <Link className="avatar-link" href="/profile" aria-label={`Your profile, ${name}`}>
                  {avatar ? <Image src={avatar} alt="" width={40} height={40} unoptimized /> : <span aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>}
                </Link>
              </>
            ) : (
              <Link className="btn small ghost" href="/login">Sign in</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
