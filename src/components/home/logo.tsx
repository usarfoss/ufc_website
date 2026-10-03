/** The club logo (public/brand/ufc-logo.svg): a mint tile with four faces. `size` is the rendered edge in px. */
export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a small static SVG; the image optimiser adds nothing
    <img src="/brand/ufc-logo.svg" alt="UFC logo" width={size} height={size} draggable={false} className={className} />
  );
}
