/** A ripped-paper edge. Zig-zag is deterministic so server and client render identically. */
export function TornEdge({ color = "var(--paper)", flip = false, className }: { color?: string; flip?: boolean; className?: string }) {
  const n = 56;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const y = 3 + ((i * 53) % 9) * 0.95 + (i % 2 ? 1.4 : 0);
    pts.push(`${((i / n) * 100).toFixed(2)},${y.toFixed(2)}`);
  }
  return (
    <svg
      viewBox="0 0 100 14"
      preserveAspectRatio="none"
      className={`block h-5 w-full sm:h-7 ${flip ? "rotate-180" : ""} ${className ?? ""}`}
      aria-hidden="true"
    >
      <polygon points={`0,0 100,0 ${[...pts].reverse().join(" ")}`} fill={color} />
    </svg>
  );
}
