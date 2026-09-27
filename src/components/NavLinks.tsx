"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LEFT = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  { href: "/recipes", label: "Recipes", match: (p: string) => p.startsWith("/recipes") && p !== "/recipes/new" },
];

const RIGHT = [
  { href: "/profile", label: "My Banana Stand", match: (p: string) => p.startsWith("/profile") },
  { href: "/about", label: "About", match: (p: string) => p === "/about" },
];

export function NavLinks({
  side,
  showReview = false,
}: {
  side: "left" | "right";
  showReview?: boolean;
}) {
  const path = usePathname();
  const links =
    side === "left"
      ? [
          ...LEFT,
          ...(showReview
            ? [{ href: "/admin/review", label: "Review queue", match: (p: string) => p.startsWith("/admin") }]
            : []),
        ]
      : RIGHT;

  return (
    <nav className={`main ${side}`} aria-label={side === "left" ? "Main" : "Account"}>
      {links.map((l) => (
        <Link key={l.href} href={l.href} aria-current={l.match(path) ? "page" : undefined}>{l.label}</Link>
      ))}
    </nav>
  );
}
