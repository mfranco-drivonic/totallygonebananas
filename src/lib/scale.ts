// Ingredient scaling and step-timer detection, ported from the prototype.

const FRAC: [number, string][] = [[0, ""], [1 / 8, "1/8"], [1 / 4, "1/4"], [1 / 3, "1/3"], [1 / 2, "1/2"], [2 / 3, "2/3"], [3 / 4, "3/4"], [1, ""]];

export function fmtQty(x: number): string {
  if (x >= 10) return String(Math.round(x));
  let whole = Math.floor(x);
  const f = x - whole;
  let best = FRAC[0];
  let d = 9;
  for (const fr of FRAC) {
    const dd = Math.abs(f - fr[0]);
    if (dd < d) { d = dd; best = fr; }
  }
  if (best[0] === 1) { whole += 1; best = FRAC[0]; }
  if (!whole && !best[1]) return String(Math.round(x * 100) / 100);
  return (whole ? String(whole) + (best[1] ? " " : "") : "") + best[1];
}

const NUM = "(\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?)";
const QTY = new RegExp("^" + NUM + "(?:(\\s*(?:to|-|–)\\s*)" + NUM + ")?");
const MEASURED = /^\s*(cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|ml|l|liters?|litres?|quarts?|pints?|sticks?|pinch(es)?|dash(es)?)\b/i;

const toNum = (s: string) =>
  s.trim().split(/\s+/).reduce((a, p) => a + (p.includes("/") ? Number(p.split("/")[0]) / Number(p.split("/")[1]) : Number(p)), 0);

/** Scales the leading quantity of an ingredient line. Returns [scaledQty | null, restOfLine]. */
export function scaleLine(line: string, k: number): [string | null, string] {
  if (Math.abs(k - 1) < 1e-9) return [null, line];
  const m = line.match(QTY);
  if (!m) return [null, line];
  const rest = line.slice(m[0].length);
  const measured = MEASURED.test(rest);
  // Whole items (eggs, bananas) round to halves or wholes; measured amounts keep fractions.
  const fmt = (x: number) => (measured ? fmtQty(x) : x < 2 ? fmtQty(Math.max(0.5, Math.round(x * 2) / 2)) : String(Math.round(x)));
  let q = fmt(toNum(m[1]) * k);
  if (m[3]) q += m[2] + fmt(toNum(m[3]) * k);
  return [q, rest];
}

const TIME_RE = /(\d+)(?:\s*(?:to|-|–)\s*(\d+))?\s*(hours?|hrs?|minutes?|mins?)\b/gi;

/** Finds durations like "20 to 25 minutes" in a step so the UI can offer timers. */
export function timersIn(text: string): { minutes: number; label: string }[] {
  const out: { minutes: number; label: string }[] = [];
  for (const m of text.matchAll(TIME_RE)) {
    const hr = /^h/i.test(m[3]);
    const minutes = Number(m[1]) * (hr ? 60 : 1);
    if (minutes > 0 && minutes <= 24 * 60) out.push({ minutes, label: `${m[1]}${m[2] ? "–" + m[2] : ""} ${hr ? "hr" : "min"}` });
  }
  return out;
}
