import { useCallback, useEffect, useRef } from "react";
import { useTypewriter } from "@/lib/hooks/useTypewriter";

const WORDS = [
  "BRANDING",
  "IDENTITÉ VISUELLE",
  "SOCIAL MEDIA DESIGN",
  "PRINT DESIGN",
  "WEB & UI DESIGN",
  "TYPOGRAPHIE",
  "DIRECTION ARTISTIQUE",
  "PHOTO EDITING",
  "PRESENTATION DESIGN",
];

export function TypewriterStrip() {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const unlock = () => {
      if (reducedRef.current) return;
      if (!ctxRef.current) {
        const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
        if (AC) ctxRef.current = new AC();
      }
      if (ctxRef.current?.state === "suspended") ctxRef.current.resume();
      enabledRef.current = true;
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  const playKey = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current || reducedRef.current) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 1700 + Math.random() * 600;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }, []);

  const word = useTypewriter(WORDS, { onTypeChar: playKey });

  return (
    <section
      className="py-6"
      style={{ background: "var(--color-blue-accent)", color: "#fff" }}
      aria-label="Domaines d'expertise"
    >
      <div className="container-x flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono uppercase text-sm md:text-base" style={{ letterSpacing: "0.15em" }}>
        <span>Le Maestro du Digital crée du</span>
        <span className="inline-flex items-center" style={{ minWidth: 320 }}>
          <span>{word}</span>
          <span className="ml-0.5 inline-block w-[2px] h-[1.1em] bg-white cursor-blink" aria-hidden />
        </span>
      </div>
    </section>
  );
}
