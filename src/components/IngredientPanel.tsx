"use client";

import { useState } from "react";
import { scaleLine } from "@/lib/scale";

export function IngredientPanel({ ingredients, servings }: { ingredients: string[]; servings: number | null }) {
  const [serv, setServ] = useState(servings ?? 0);
  const [mult, setMult] = useState(1);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const k = servings ? serv / servings : mult;

  const toggle = (i: number) => setChecked((c) => { const n = new Set(c); if (n.has(i)) n.delete(i); else n.add(i); return n; });

  return (
    <aside className="panel ing-panel" aria-labelledby="ing-title">
      <h2 id="ing-title">Ingredients</h2>
      <p>Tick things off as you shop or cook.</p>
      <div className="scale">
        {servings ? (
          <>
            <span id="serv-label">Servings</span>
            <span className="stepper" role="group" aria-labelledby="serv-label">
              <button type="button" aria-label="Fewer servings" disabled={serv <= 1} onClick={() => setServ((s) => Math.max(1, s - 1))}>−</button>
              <output aria-live="polite">{serv}</output>
              <button type="button" aria-label="More servings" onClick={() => setServ((s) => Math.min(200, s + 1))}>+</button>
            </span>
          </>
        ) : (
          <>
            <span>Batch</span>
            {[0.5, 1, 2, 3].map((m) => (
              <button key={m} type="button" className="chip" aria-pressed={mult === m} onClick={() => setMult(m)}>{m === 0.5 ? "½" : m}×</button>
            ))}
          </>
        )}
      </div>
      <ul className="checks">
        {ingredients.map((line, i) => {
          const [q, rest] = scaleLine(line, k);
          return (
            <li key={i}>
              <label>
                <input type="checkbox" checked={checked.has(i)} onChange={() => toggle(i)} />
                <span>{q && <b className="scaled">{q}</b>}{rest}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {checked.size > 0 && <button type="button" className="btn ghost small" onClick={() => setChecked(new Set())}>Uncheck all</button>}
    </aside>
  );
}
