export function Difficulty({ value }: { value: number }) {
  return (
    <span className="pill diff" role="img" aria-label={`Difficulty ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((k) => <span key={k} className={k > value ? "off" : undefined}>🍌</span>)}
    </span>
  );
}
