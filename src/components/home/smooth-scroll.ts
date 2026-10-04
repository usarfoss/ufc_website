/** Eases the page to `target`. Lives outside any component because it reads the clock, which components must not do while rendering. */
export function smoothScrollTo(target: number, handle: { current: number }) {
  const from = window.scrollY;
  cancelAnimationFrame(handle.current);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return window.scrollTo(0, target);
  const dur = Math.min(1400, 450 + Math.abs(target - from) * 0.35);
  const t0 = performance.now();
  const stop = () => cancelAnimationFrame(handle.current); // the reader grabbed the wheel or the screen: let go
  window.addEventListener("wheel", stop, { once: true, passive: true });
  window.addEventListener("touchstart", stop, { once: true, passive: true });
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / dur);
    window.scrollTo(0, from + (target - from) * (1 - Math.pow(1 - k, 3)));
    if (k < 1) handle.current = requestAnimationFrame(step);
  };
  handle.current = requestAnimationFrame(step);
}
