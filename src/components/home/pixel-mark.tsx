/**
 * The club's pixel motif (borrowed from the event posters): a loose grid of squares,
 * some lit. `lit` selects which of the 9 cells glow.
 */
const DEFAULT_LIT = [0, 4, 5, 7];

export function PixelMark({
  size = 22,
  lit = DEFAULT_LIT,
  className,
}: {
  size?: number;
  lit?: number[];
  className?: string;
}) {
  const cell = size / 3;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => {
        const on = lit.includes(i);
        const x = (i % 3) * cell;
        const y = Math.floor(i / 3) * cell;
        return (
          <rect
            key={i}
            x={x + 0.75}
            y={y + 0.75}
            width={cell - 1.5}
            height={cell - 1.5}
            rx={0.8}
            fill={on ? "#2ee58f" : "none"}
            stroke={on ? "none" : "currentColor"}
            strokeOpacity={0.28}
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}
