import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

const GUIDE = [
  ["#9CBF45", "Green", "starchy and firm. Fry, curry, or pickle."],
  ["#F3CF31", "Yellow", "the snacking sweet spot. Smoothies and quick bites."],
  ["#EFC33B", "Spotty", "sweeter and softer. Pancakes and muffins."],
  ["#C99A45", "Brown", "peak banana bread territory."],
  ["#4A3322", "Nearly black", "bake it into cake or freeze it for nice cream."],
];

export default function AboutPage() {
  return (
    <div className="wrap">
      <div className="page-head"><h1>About Totally Gone Bananas</h1></div>
      <div className="about">
        <div>
          <p className="lede">We&apos;re a home for banana recipes at every stage, from firm and green to spotty and gone. No banana left behind.</p>
          <h2>How it works</h2>
          <p>Browse recipes by category or search for what&apos;s in your kitchen. Every recipe has a servings scaler and an ingredient checklist, and many come with step-by-step photos or video.</p>
          <p>Sign in to save favorites to your Banana Stand, rate what you cook, and share your own recipes. Editors give new submissions a quick look before they go live.</p>
          <p><Link className="btn" href="/recipes/new">Share a recipe</Link></p>
        </div>
        <aside className="panel">
          <h2>Banana ripeness, decoded</h2>
          <ul className="ripe-guide">
            {GUIDE.map(([c, n, t]) => <li key={n}><i style={{ background: c }} /><span><b>{n}:</b> {t}</span></li>)}
          </ul>
        </aside>
      </div>
    </div>
  );
}
