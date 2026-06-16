import { useEffect } from "react";
import { useReducedMotion, useIsTouch } from "@/lib/hooks/useReducedMotion";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const touch = useIsTouch();

  useEffect(() => {
    if (reduced || touch) return;
    let lenis: any;
    let raf = 0;
    let cancelled = false;
    (async () => {
      const Lenis = (await import("lenis")).default;
      if (cancelled) return;
      lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
      });
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (lenis) lenis.destroy();
    };
  }, [reduced, touch]);

  return <>{children}</>;
}
