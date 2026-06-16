import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { aboutContentQuery } from "@/lib/queries";
import { useCountUp, useInView } from "@/lib/hooks/useCountUp";
import beretAsset from "@/assets/maestro-beret.png.asset.json";
import seatedAsset from "@/assets/maestro-seated.png.asset.json";

const DEFAULT_PHOTOS = [beretAsset.url, seatedAsset.url];

export function PhotoCarousel3D() {
  const { data: about } = useQuery(aboutContentQuery());
  const photos: string[] =
    Array.isArray(about?.hero_photos) && about!.hero_photos.length > 0
      ? (about!.hero_photos as string[])
      : DEFAULT_PHOTOS;

  const [index, setIndex] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(() => {
      setFlipping(true);
      setTimeout(() => setIndex((i) => (i + 1) % photos.length), 450);
      setTimeout(() => setFlipping(false), 900);
    }, 5000);
    return () => clearInterval(id);
  }, [photos.length]);

  function onMove(e: React.MouseEvent) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -y * 10, ry: x * 12 });
  }
  function onLeave() { setTilt({ rx: 0, ry: 0 }); }

  return (
    <div className="relative" style={{ perspective: "1200px" }}>
      <div aria-hidden className="pointer-events-none absolute -top-8 -left-8 w-16 h-16 border float-slow"
        style={{ borderColor: "var(--color-blue-accent)", opacity: 0.5 }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-6 -right-6 w-10 h-10 float-slow-rev"
        style={{ background: "var(--color-blue-accent)", opacity: 0.7 }} />

      <div
        ref={wrapRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative aspect-[3/4] w-full max-w-md mx-auto rounded-2xl glow-ring overflow-hidden"
        style={{
          transformStyle: "preserve-3d",
          transform: flipping
            ? "rotateY(-90deg) scale(1.03)"
            : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: flipping ? "transform .9s cubic-bezier(.4,0,.2,1)" : "transform .25s ease-out",
        }}
      >
        <img
          src={photos[index]}
          alt="Le Maestro du Digital — portrait"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className="label-mono text-white/80">Portfolio · 2026</span>
          <span className="label-mono text-white/80">0{index + 1} / 0{photos.length}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Voir portrait ${i + 1}`}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === index ? 28 : 10,
              background: i === index ? "var(--color-blue-accent)" : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

const HERO_STATS = [
  { value: 2, suffix: "+", label: "Années\nd'expérience" },
  { value: 100, suffix: "+", label: "Projets\nréalisés" },
  { value: 10, suffix: "+", label: "Clients\naccompagnés" },
  { value: 100, suffix: "%", label: "Satisfaction\nclients" },
] as const;

function HeroStat({ value, suffix, label, delay }: (typeof HERO_STATS)[number] & { delay: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const n = useCountUp(value, inView, 1800);
  return (
    <div ref={ref} style={{ animationDelay: `${delay}ms` }} className="fade-up-blur">
      <div
        className="font-display leading-none"
        style={{ color: "var(--color-blue-light)", fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)" }}
      >
        {n}
        <span style={{ color: "var(--color-blue-accent)" }}>{suffix}</span>
      </div>
      <div className="label-mono mt-2 whitespace-pre-line" style={{ color: "#9a9aa5", fontSize: "0.7rem" }}>
        {label}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden grain-overlay"
      style={{ background: "radial-gradient(ellipse at 20% 0%, #1B2A4A 0%, #0d0d0d 55%, #050505 100%)", color: "#fff" }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 argyle-bg opacity-60" />

      <div aria-hidden className="pointer-events-none absolute -left-40 top-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(59,111,204,0.25), transparent 70%)" }} />
      <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 w-[500px] h-[500px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(123,167,220,0.18), transparent 70%)" }} />

      <div className="container-x relative grid lg:grid-cols-12 gap-12 items-center pt-32 pb-24">
        <div className="lg:col-span-7">
          <div
            className="label-mono inline-flex items-center gap-2 fade-up-blur"
            style={{ color: "var(--color-blue-accent)" }}
          >
            <span className="inline-block w-8 h-px" style={{ background: "var(--color-blue-accent)" }} />
            Graphic Designer &amp; Directeur Artistique
          </div>
          <h1 className="text-hero mt-6">
            <span className="block fade-up-blur" style={{ animationDelay: "80ms", color: "#FFFFFF" }}>Le Maestro</span>
            <span className="block fade-up-blur" style={{ animationDelay: "220ms", color: "#3B6FCC" }}>du Digital</span>
            <span className="block fade-up-blur italic" style={{ animationDelay: "360ms", color: "#FFFFFF" }}>
              crée<span style={{ color: "var(--color-blue-accent)" }}>.</span>
            </span>
          </h1>
          <p className="mt-8 max-w-md text-base fade-up-blur" style={{ color: "#C4C4CC", animationDelay: "520ms" }}>
            Je conçois des identités visuelles percutantes pour des marques ambitieuses.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 fade-up-blur" style={{ animationDelay: "680ms" }}>
            <Link
              to="/portfolio"
              data-cursor="cta"
              className="magnetic-cta inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm label-mono transition-transform hover:scale-[1.04] hover:-translate-y-0.5"
              style={{ background: "var(--color-blue-accent)", color: "#fff", boxShadow: "0 12px 40px -10px rgba(59,111,204,0.6)" }}
            >
              Voir mes projets <span aria-hidden>→</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm label-mono border border-white/30 hover:border-white hover:bg-white/5 transition-colors"
              style={{ color: "#fff" }}
            >
              Me contacter
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl">
            {HERO_STATS.map((s, i) => (
              <HeroStat key={s.label} {...s} delay={820 + i * 150} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 fade-up-blur" style={{ animationDelay: "300ms" }}>
          <PhotoCarousel3D />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 label-mono text-white/50 flex flex-col items-center gap-2">
        <span>Scroll</span>
        <span className="block w-px h-10 bg-white/20 relative overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-4 bg-white/80 animate-[fade-in_1.6s_ease-in-out_infinite]" />
        </span>
      </div>
    </section>
  );
}
