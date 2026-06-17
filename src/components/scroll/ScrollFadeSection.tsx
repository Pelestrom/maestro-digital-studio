import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Parallax Stack — each section glides up slightly slower than the page scroll
 * and gently recedes (subtle scale) so the next section appears to slide over it.
 * No blur, no white overlay, no opacity fade — strictly transform-based for 60fps.
 *
 * - Honors prefers-reduced-motion
 * - Wraps the section in a 3D layer so transforms stay GPU-composited
 */
export function ScrollFadeSection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: 0, scale: 1 },
        {
          yPercent: -8,
          scale: 0.985,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transformOrigin: "center top",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </div>
  );
}
