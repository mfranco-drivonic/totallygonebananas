"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next, googleEnabled }: { next: string; googleEnabled: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const callback = () => `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setState("error"); setError("Enter a valid email address."); return; }
    setState("sending");
    const { error } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: callback() } });
    if (error) { setState("error"); setError(error.message); } else setState("sent");
  }

  async function google() {
    await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback() } });
  }

  if (state === "sent") {
    return (
      <div className="panel" role="status">
        <h2>Check your email</h2>
        <p>We sent a sign-in link to <b>{email}</b>. Open it on this device to finish signing in.</p>
        <button type="button" className="linkbtn" onClick={() => setState("idle")}>Use a different email</button>
      </div>
    );
  }

  return (
    <div className="panel stack">
      <form onSubmit={sendLink} className="stack" noValidate>
        <div className="f">
          <label htmlFor="email">Email</label>
          <input id="email" className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={state === "error"} />
        </div>
        {state === "error" && <p className="f-err" role="alert">{error}</p>}
        <button className="btn" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Email me a sign-in link"}</button>
      </form>
      {googleEnabled && (
        <>
          <p className="or"><span>or</span></p>
          <button type="button" className="btn ghost" onClick={google}>Continue with Google</button>
        </>
      )}
      <p className="hint">No password needed. New here? The same link creates your account.</p>
    </div>
  );
}
