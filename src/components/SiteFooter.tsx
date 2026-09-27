import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <Image src="/logo.png" alt="" width={84} height={90} />
        <p>Totally Gone Bananas. Recipes for every banana, from green to gone.</p>
        <nav aria-label="Footer">
          <Link href="/recipes">Recipes</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/recipes/new">Share a recipe</Link>
          <Link href="/profile">My Banana Stand</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
    </footer>
  );
}
