import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page-head">
      <h1>This page slipped on a peel</h1>
      <p className="lede">We couldn&apos;t find that page. It may have been moved or removed.</p>
      <p style={{ marginTop: "1.2rem" }}><Link className="btn" href="/">Back to the homepage</Link></p>
    </div>
  );
}
