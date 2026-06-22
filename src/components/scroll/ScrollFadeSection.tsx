import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Premium scroll section with pronounced entry and exit animations.
 *
 * Entry: translateY (80px) + fade + scale (0.92 → 1) with easeOutExpo
 * Exit: subtle scale down (1 → 0.95) + opacity fade when scrolling past
 * Children: staggered reveal (80-100ms between each)
 *
 * Honors prefers-reduced-motion.
 */
export function ScrollFadeSection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Section entrance animation
      gsap.fromTo(
        el,
        { opacity: 0, y: 80, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            end: "bottom 15%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Section exit animation - subtle "closing" effect
      gsap.fromTo(
        el,
        { scale: 1, opacity: 1 },
        {
          scale: 0.95,
          opacity: 0.6,
          duration: 0.5,
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: el,
            start: "bottom 20%",
            end: "bottom -10%",
            scrub: 0.8,
          },
        },
      );

      // Staggered children reveal
      const inner = el.firstElementChild as HTMLElement | null;
      const kids = inner ? Array.from(inner.children) : [];
      if (kids.length > 1) {
        gsap.fromTo(
          kids,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "expo.out",
            stagger: 0.09,
            scrollTrigger: {
              trigger: el,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </div>
  );
}
