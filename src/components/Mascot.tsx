const BODY = "M58 72 C110 142 318 142 360 64 C366 52 382 56 376 74 C334 214 90 214 38 88 C33 75 49 61 58 72 Z";

/** The sunglasses banana. `level` adds gear: 1 cap, 2 skateboard, 3 gold chain, 4 crown. */
export function Mascot({ level = 0, color = "#F3CF31", label = "The Totally Gone Bananas mascot", className = "" }: { level?: number; color?: string; label?: string; className?: string }) {
  const board = level >= 2;
  return (
    <svg className={`mascot ${className}`} viewBox={`0 0 400 ${board ? 275 : 230}`} role="img" aria-label={label}>
      <ellipse cx="205" cy={board ? 268 : 212} rx="140" ry="9" fill="var(--line)" opacity=".13" />
      {board && (
        <g>
          <rect x="70" y="226" width="270" height="18" rx="9" fill="#462018" />
          <circle cx="118" cy="256" r="15" fill="#F3CF31" stroke="#462018" strokeWidth="6" />
          <circle cx="292" cy="256" r="15" fill="#F3CF31" stroke="#462018" strokeWidth="6" />
        </g>
      )}
      <path d="M46 82 L16 58 C13 55 17 47 22 49 L56 70 Z" fill="#6B5A2A" stroke="#462018" strokeWidth="5" strokeLinejoin="round" />
      <path d={BODY} fill={color} />
      <path d="M80 104 C140 156 290 158 344 96" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".3" />
      <path d={BODY} fill="none" stroke="#462018" strokeWidth="6" strokeLinejoin="round" />
      <circle cx="373" cy="68" r="6" fill="#462018" />
      <path d="M170 140 h32 a4 4 0 0 1 4 4 v6 a12 12 0 0 1 -12 12 h-14 a12 12 0 0 1 -12 -12 v-6 a4 4 0 0 1 4 -4 Z" fill="#462018" />
      <path d="M214 140 h32 a4 4 0 0 1 4 4 v6 a12 12 0 0 1 -12 12 h-14 a12 12 0 0 1 -12 -12 v-6 a4 4 0 0 1 4 -4 Z" fill="#462018" />
      <path d="M204 146 h12" stroke="#462018" strokeWidth="5" strokeLinecap="round" />
      <path d="M178 147 l8 -5 M222 147 l8 -5" stroke="#FBF9E6" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      <path d="M192 172 Q208 186 224 172" fill="none" stroke="#462018" strokeWidth="5" strokeLinecap="round" />
      {level >= 3 && <path d="M150 181 Q205 226 262 179" fill="none" stroke="#E0A800" strokeWidth="7" strokeDasharray="3 7" strokeLinecap="round" />}
      {level >= 4 ? (
        <path d="M172 124 L176 90 L192 108 L206 80 L220 108 L236 90 L240 124 Z" fill="#F7C325" stroke="#462018" strokeWidth="5" strokeLinejoin="round" />
      ) : level >= 1 ? (
        <g>
          <path d="M236 121 C258 115 276 120 284 128 C264 131 248 129 236 127 Z" fill="#462018" />
          <path d="M172 125 C172 86 240 86 240 125 Z" fill="#E8793A" stroke="#462018" strokeWidth="5" strokeLinejoin="round" />
        </g>
      ) : null}
    </svg>
  );
}
