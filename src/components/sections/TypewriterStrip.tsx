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
      try {
        if (!ctxRef.current) {
          const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
          if (AC) ctxRef.current = new AC();
        }
        if (ctxRef.current?.state === "suspended") {
          ctxRef.current.resume().catch(() => {});
        }
        enabledRef.current = true;
      } catch {
        /* noop */
      }
    };

    const opts: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener("pointerdown", unlock, opts);
    window.addEventListener("keydown", unlock, opts);
    window.addEventListener("touchstart", unlock, opts);
    window.addEventListener("scroll", unlock, opts);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("scroll", unlock);
    };
  }, []);

  /**
   * Soft digital tick — sine wave, very short, extremely discreet.
   * No reverb, no aggressive frequency, peak gain ≈ 0.07, total length < 60 ms.
   */
  const playTick = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current || reducedRef.current) return;

    const now = ctx.currentTime;

    // Body tone — soft sine, mid-high but warm
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1180, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    // Gentle low-pass to remove any harshness
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 3200;
    lp.Q.value = 0.7;

    osc.connect(lp).connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }, []);

  const word = useTypewriter(WORDS, { onTypeChar: playTick });

  return (
    <section
      className="py-6"
      style={{ background: "var(--color-blue-accent)", color: "#fff" }}
      aria-label="Domaines d'expertise"
    >
      <div
        className="container-x flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono uppercase text-sm md:text-base"
        style={{ letterSpacing: "0.15em" }}
      >
        <span>Le Maestro du Digital crée du</span>
        <span className="inline-flex items-center" style={{ minWidth: 320 }}>
          <span>{word}</span>
          <span className="ml-0.5 inline-block w-[2px] h-[1.1em] bg-white cursor-blink" aria-hidden />
        </span>
      </div>
    </section>
  );
}
