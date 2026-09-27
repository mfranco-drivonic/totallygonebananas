"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap page-head">
      <h1>Well, that went bananas</h1>
      <p className="lede">Something went wrong loading this page. Please try again.</p>
      <p style={{ marginTop: "1.2rem" }}><button className="btn" onClick={reset}>Try again</button></p>
    </div>
  );
}
