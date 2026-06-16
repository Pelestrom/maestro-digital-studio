import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Wraps a section and fades it out on scroll using GSAP ScrollTrigger.
 * Respects prefers-reduced-motion.
 */
export function ScrollFadeSection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        opacity: 0,
        scale: 0.96,
        y: -40,
        filter: "blur(4px)",
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top+=80",
          end: "bottom top+=60",
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} style={{ willChange: "opacity, transform, filter" }}>
      {children}
    </div>
  );
}
